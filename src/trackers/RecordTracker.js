import Emitter from 'component-emitter';
import objectAssing from '../functions/objectAssing';
import createLogger from '../functions/createLogger';
import {
  win,
  doc
} from '../Browser';
import {
  EVENT,
  EVENT_REC_START,
  EVENT_REC_BATCH
} from '../Constants';

const log = createLogger('RST/RecordTracker');

const SCRIPT_FILE = '/public/rrweb-record.js';

/**
 * Session recording tracker (rrweb).
 * rrweb не входит в основной бандл: скрипт дозагружается с сервера
 * трекера только когда запись запущена: вызовом rstat('record')
 * или при инициализации, если trackRecord.autostart = true.
 * @param {Object} options trackRecord options + options вызова record()
 * @param {Object} trackerOptions main tracker options (server, pathPrefix, allowHTTP)
 * @constructor
 */
const RecordTracker = function (options, trackerOptions) {

  this.options = objectAssing({
    scriptUrl: null,           // полный URL бандла записи, если нестандартный
    maskAllInputs: true,       // значения полей не попадают в реплей
    blockClass: 'rst-block',   // элемент полностью исключается из записи
    maskTextClass: 'rst-mask', // текст элемента заменяется звёздочками
    ignoreClass: 'rst-ignore', // input-события элемента не записываются
    recordCanvas: false,
    checkoutEveryNms: 120000,  // период полного снапшота DOM
    flushInterval: 5,          // сек между отправками буфера
    maxBatchBytes: 40000       // размер части: с конвертом должно влезать в лимит beacon/keepalive 64KB
  }, options);

  this.trackerOptions = trackerOptions || {};
  this.buffer = [];
  this.bufferBytes = 0;
  this.seq = 0;
  this.packed = false;
  this.stopFn = null;
  this.flushTimer = null;
  this.loading = false;
  // load() вызывает Tracker после подписки на события: если бандл уже на странице,
  // запись стартует синхронно и rec_start иначе ушёл бы до подписки
};

Emitter(RecordTracker.prototype);

/**
 * Recording bundle URL. По умолчанию — рядом с lib.js на сервере трекера
 * @returns {string|null}
 */
RecordTracker.prototype.scriptUrl = function () {
  if (this.options.scriptUrl) {
    return this.options.scriptUrl;
  }
  const opts = this.trackerOptions;
  if (!opts.server) {
    return null;
  }
  const proto = (opts.allowHTTP && win.location.protocol === 'http:') ? 'http' : 'https';
  return `${proto}://${opts.server}${opts.pathPrefix || ''}${SCRIPT_FILE}`;
};

/**
 * Lazy-load of the rrweb bundle
 */
RecordTracker.prototype.load = function () {
  if (this.loading) {
    return;
  }
  if (!win.MutationObserver) {
    return log.warn('MutationObserver not supported, recording disabled');
  }
  // Бандл уже на странице (повторный старт после stop) — скрипт не перезагружаем
  if (win.rrwebRecord) {
    this.loading = true;
    return this.startRecording();
  }
  const src = this.scriptUrl();
  if (!src) {
    return log.warn('No server configured, recording disabled');
  }
  this.loading = true;
  const el = doc.createElement('script');
  el.async = true;
  el.src = src;
  el.onload = () => this.startRecording();
  el.onerror = () => log.warn('Failed to load recording bundle');
  const first = doc.getElementsByTagName('script')[0];
  (first && first.parentNode)
    ? first.parentNode.insertBefore(el, first)
    : doc.head.appendChild(el);
};

RecordTracker.prototype.startRecording = function () {
  // stop() сбрасывает loading: запись остановили, пока бандл ещё грузился
  if (!this.loading || this.stopFn) {
    return;
  }
  const rrweb = win.rrwebRecord;
  if (!rrweb || !rrweb.record) {
    return log.warn('rrwebRecord global not found');
  }
  // pack (fflate) кратно сжимает снапшоты; без него шлём сырой JSON
  const packFn = win.rrwebPacker && win.rrwebPacker.pack;
  this.packed = !!packFn;

  try {
    this.stopFn = rrweb.record({
      emit: (event) => this.pushEvent(event),
      packFn: packFn || undefined,
      maskAllInputs: this.options.maskAllInputs,
      blockClass: this.options.blockClass,
      maskTextClass: this.options.maskTextClass,
      ignoreClass: this.options.ignoreClass,
      recordCanvas: this.options.recordCanvas,
      checkoutEveryNms: this.options.checkoutEveryNms
    });
  } catch (e) {
    return log.warn('rrweb record failed to start', e);
  }

  this.flushTimer = setInterval(
    () => this.flush(),
    this.options.flushInterval * 1000
  );

  this.emit(EVENT, {
    name: EVENT_REC_START,
    data: {
      packed: this.packed ? 1 : 0,
      masked: this.options.maskAllInputs ? 1 : 0
    }
  });
  log('recording started');
};

/**
 * Buffer one rrweb event (packed string or plain object)
 */
RecordTracker.prototype.pushEvent = function (event) {
  const str = typeof event === 'string' ? event : JSON.stringify(event);
  this.buffer.push(str);
  this.bufferBytes += str.length;
  if (this.bufferBytes >= this.options.maxBatchBytes) {
    this.flush();
  }
};

/**
 * Send buffered events as rec_batch message(s).
 * Батч больше maxBatchBytes режется на части: сервер склеивает d
 * по (uid, lib.st, seq)/part, парсит JSON и распаковывает события
 */
RecordTracker.prototype.flush = function () {
  if (!this.buffer.length) {
    return;
  }
  const payload = JSON.stringify(this.buffer);
  this.buffer = [];
  this.bufferBytes = 0;

  const seq = this.seq++;
  const size = this.options.maxBatchBytes;
  const parts = Math.ceil(payload.length / size);

  for (let i = 0; i < parts; i++) {
    this.emit(EVENT, {
      name: EVENT_REC_BATCH,
      data: {
        seq: seq,
        part: i,
        of: parts,
        p: this.packed ? 1 : 0,
        d: payload.substr(i * size, size)
      }
    });
  }
};

/**
 * Stop recording: остановить rrweb, отправить остаток буфера
 */
RecordTracker.prototype.stop = function () {
  this.loading = false;
  if (this.flushTimer) {
    clearInterval(this.flushTimer);
    this.flushTimer = null;
  }
  if (this.stopFn) {
    try {
      this.stopFn();
    } catch (e) {
      // rrweb мог не пережить разбор DOM при выгрузке страницы
    }
    this.stopFn = null;
  }
  this.flush();
  log('recording stopped');
};

/**
 * Unload handler
 */
RecordTracker.prototype.unload = function () {
  this.stop();
};

export default RecordTracker;
