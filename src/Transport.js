import Emitter from 'component-emitter';
import {
  win,
  doc,
  nav
} from './Browser';
import {
  hasBeaconSupport,
  hasFetchSupport,
} from './data/browserCharacts';
import {
  EVENT_OPTION_REQUEST,
  EVENT_OPTION_TRANSPORT_IMG,
  SERVICE_TRACK,
} from './Constants';
import objectAssign from './functions/objectAssing';
import createLogger from './functions/createLogger';
import queryStringify from 'qs/lib/stringify';
import { cyrb53 } from './functions/cyrb53';

const HTTPS = 'https';

const log = createLogger('RST/Transport');

// Паузы перед повторами отправки события при сетевых сбоях (мс)
const RETRY_DELAYS = [1000, 5000];

/**
 * Transport class containing general connecting methods
 * @param {Object} options transport options
 * @constructor
 * @property {Object} creds
 * @class
 *
 */
export function Transport(options) {
  this.creds = {};
  this.options = objectAssign({
    responseTimeout: 10000
  },
    options
  );
  this.pathPrefix = options.pathPrefix;
  this.server = this.options.server;
  this.urlMark = this.options.urlMark;
  this.proto = (this.options.allowHTTP && win.location.protocol === 'http:')
    ? 'http'
    : HTTPS;
  this.servicesMap = {
    'track': 't4k'
  }
};

// Tracker подписывается на события каждого плагина, включая transport
// (канал для будущих server messages) — миксин нужен, даже пока emit не зовётся
Emitter(Transport.prototype);


/**
 * Set default credentials that used to send data to server
 * @param {Object} creds object containing creds
 * @returns {Transport}
 */
Transport.prototype.setCreds = function (creds) {
  this.creds = objectAssign({}, creds);
  return this;
}


/**
 * Transform path to query url
 * @param {string} path
 * @param {Object} data
 * @returns {string}
 */
Transport.prototype.makeURL = function (path, data = {}, proto) {
  const query = queryStringify(data);
  return `${proto || this.proto}://${this.server}${this.pathPrefix}${path}?${query}`;
}


/**
 * Service endpoint path
 * @param {string} service
 * @param {string} ext json|gif
 * @returns {string}
 */
Transport.prototype.servicePath = function (service, ext) {
  const _service = this.servicesMap[service] || service;
  return `/${this.urlMark}/${_service}.${ext}`;
}


/**
 * POST via fetch with timeout. Resolves with parsed JSON response
 * (null for empty body), rejects on non-2xx or network error.
 * @param {string} url
 * @param {string} data serialized message
 * @returns {Promise}
 */
Transport.prototype.sendFetch = function (url, data) {
  if (!hasFetchSupport) {
    return Promise.reject(new Error('No transport available'));
  }

  const fetchOptions = {
    method: 'POST',
    body: data,
    keepalive: true
  };

  let timer = null;
  if (win.AbortController) {
    const abortCtl = new win.AbortController();
    fetchOptions.signal = abortCtl.signal;
    timer = setTimeout(() => abortCtl.abort(), this.options.responseTimeout);
  }
  const clearTimer = () => timer && clearTimeout(timer);

  return fetch(url, fetchOptions)
    .then((response) => {
      clearTimer();
      return response.text().then((text) => {
        if (!response.ok) {
          const err = new Error(`Server responded with ${response.status}`);
          err.status = response.status;
          throw err;
        }
        if (!text) {
          return null;
        }
        try {
          return JSON.parse(text);
        } catch (e) {
          return null;
        }
      });
    }, (e) => {
      clearTimer();
      throw e;
    });
}


/**
 * Fetch with retries on transient failures.
 * 4xx are permanent — not retried; 5xx, timeouts and network errors are.
 * @param {string} url
 * @param {string} data
 * @param {Array<number>} delays remaining retry delays, ms
 * @returns {Promise}
 */
Transport.prototype.fetchWithRetry = function (url, data, delays) {
  return this.sendFetch(url, data).catch((e) => {
    const permanent = (e && e.status >= 400 && e.status < 500) || !hasFetchSupport;
    if (permanent || !delays.length) {
      throw e;
    }
    const delay = delays[0];
    log.warn(`Send failed, retrying in ${delay}ms`, e);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        this.fetchWithRetry(url, data, delays.slice(1)).then(resolve, reject);
      }, delay);
    });
  });
}


/**
 * Deliver an event message. Delivery matters, response doesn't:
 * beacon first, then fetch with retries.
 * @param {Object} msg
 * @returns {Promise}
 */
Transport.prototype.sendEvent = function (msg) {
  const data = JSON.stringify(msg);
  const dig = cyrb53(data);
  const path = this.servicePath(msg.service, 'json');

  if (this.options.allowSendBeacon && hasBeaconSupport) {
    try {
      if (nav.sendBeacon(this.makeURL(path, { dig, td_trans: 'b' }), data)) {
        return Promise.resolve(null);
      }
    } catch (e) {
      // очередь beacon переполнена или URL отвергнут — уходим в fetch
    }
    log.info('Beacon refused, falling back to fetch');
  }

  return this.fetchWithRetry(
    this.makeURL(path, { dig, td_trans: 'f' }),
    data,
    RETRY_DELAYS
  );
}


/**
 * Request-response call. Always fetch (beacon can't read replies),
 * no retries: server side effects must not be duplicated.
 * @param {Object} msg
 * @returns {Promise} parsed server response
 */
Transport.prototype.sendRequest = function (msg) {
  const data = JSON.stringify(msg);
  const dig = cyrb53(data);
  return this.sendFetch(
    this.makeURL(this.servicePath(msg.service, 'json'), { dig, td_trans: 'f' }),
    data
  );
}


/**
 * GET-pixel fallback channel (server-side logging).
 * Payload is cropped and passed in the query string.
 * @param {Object} msg
 * @returns {Promise}
 */
Transport.prototype.sendImg = function (msg) {
  const smallMsg = (msg.service === SERVICE_TRACK && this.options.msgCropper)
    ? this.options.msgCropper(msg)
    : msg;
  const url = this.makeURL(
    this.servicePath(msg.service, 'gif'),
    objectAssign({}, smallMsg, this.creds)
  );

  return new Promise((resolve, reject) => {
    const img = win.Image ? (new Image(1, 1)) : doc.createElement('img');
    // держим ссылку, чтобы GC не собрал изображение до завершения запроса
    this.lastImg = img;
    img.onload = () => resolve(null);
    img.onerror = () => reject(new Error('Img transport failed'));
    img.src = url;
  });
}


/**
 * Send message to server using transport chosen by options
 * @param {Object} msg
 * @param {Object} options
 * @returns {Promise}
 */
Transport.prototype.send = function (msg, options = {}) {
  if (options[EVENT_OPTION_TRANSPORT_IMG]) {
    return this.sendImg(msg);
  }
  if (options[EVENT_OPTION_REQUEST]) {
    return this.sendRequest(msg);
  }
  return this.sendEvent(msg);
};
