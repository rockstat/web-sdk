import Sockette from 'sockette';
import Emitter from 'component-emitter';
import objectAssign from './functions/objectAssing';
import createLogger from './functions/createLogger';
import {
  win,
  doc,
  nav
} from './Browser';
import {
  isSendBeacon,
  isXHRWithCreds,
  isXHRsupported,
  isXDRsupported,
  wsSupported,
  isBlobSupported
} from './data/clientFeatures';
import {
  EVENT_OPTION_MEAN,
  EVENT_OPTION_OUTBOUND,
  EVENT_OPTION_TERMINATOR,
  SERVER_MESSAGE,
  INTERNAL_EVENT
} from './Constants';
import {
  qs
} from 'url-parse';
import {
  METHODS
} from 'http';

const enc = encodeURIComponent;
const HTTPS = 'https://';
const log = createLogger('Transport');
const noop = () => {};

function buildQuery(qpairs) {
  const res = qpairs.length ? qpairs.map((v) => {
    return enc(v[0]) + '=' + enc(v[1])
  }) : '';
  console.dir(qpairs);
  return res;
}


/**
 * Transport class containing general connecting methods
 * @param {Object} options transport options
 * @constructor
 * @property {boolean} wsConnected
 * @property {Object} creds
 * @class
 *
 */
export function Transport(options) {
  /**@private */
  this.creds = {};
  /**@private */
  this.options = objectAssign({
      sendTimeout: 5000
    },
    options
  );

  /**@private */
  this.server = options.server;
  /**@private */
  this.wsConnected = false;
};

// Extending Emitter
Emitter(Transport.prototype);

/**
 * Set default credentials that used to send data to server
 * @param {Object} creds object containing creds
 * @returns {Transport}
 */
Transport.prototype.setCreds = function (creds) {
  this.creds = creds;
  return this;
}


/**
 * Transform path to query url
 * @param {string} path
 * @param {Array} qpairs
 * @returns {Transport}
 */
Transport.prototype.makeURL = function (path, qpairs = []) {
  const query = qpairs.length ? `?${buildQuery(qpairs)}` : '';
  return `${HTTPS}${this.server}${path}${query}`;
}




/**
 * Old good friend XHR
 * @param url
 * @param data
 */
Transport.prototype.sendXHR = function (url, data) {

  let xhr;
  if (isXHRWithCreds() || !isXDRsupported() && isXHRsupported()) {
    xhr = new win.XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.withCredentials = true;
    // xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(data);

  } else if (isXDRsupported()) {
    // hack to prevent IE 'aborted' bug
    setTimeout(() => {
      xhr = new win.XDomainRequest();
      xhr.onload = noop();
      xhr.onerror = noop();
      xhr.ontimeout = noop();
      xhr.onprogress = noop();
      xhr.open('POST', url, true);
      xhr.send(data);
    }, 0);
  }
};

/**
 *
 * @param url {string}
 */
Transport.prototype.sendIMG = function (url) {
  // Img load test
  const img = win.Image ? (new Image(1, 1)) : doc.createElement('img');
  img.src = url;
  img.onload = () => {
    log('img loaded');
  };
};

/**
 *
 * @param msg {Object}
 * @param query {Array}
 * @param options {Object}
 */
Transport.prototype.send = function (msg, options = {}) {

  const data = JSON.stringify(msg);
  const useSafe = !!options[EVENT_OPTION_TERMINATOR] ||
    !!options[EVENT_OPTION_OUTBOUND] ||
    !!options[EVENT_OPTION_MEAN];


  const postPath = `/track/${msg.projectId}/${msg.name}`;
  const imgPath = `/img/${msg.projectId}/track/${msg.name}`;

  // log(`params. safe: ${useSafe}`);

  try {

    if (this.wsConnected) {
      this.sendMessage(msg)
      return true;
    } else if (this.options.allowSendBeacon && isSendBeacon() && isBlobSupported()) {
      log('sending using beacon');
      nav.sendBeacon(this.makeURL(postPath), data);
      return true;

    } else if (!useSafe && (this.options.allowXHR && (isXHRsupported() || isXDRsupported()))) {
      log('sending using XHR/XDR');
      this.sendXHR(this.makeURL(postPath), data);
      return true;
    }
  } catch (error) {
    log.warn(error);
  }

  // Send only part when using gif
  const part = this.options.msgCropper(msg);
  log(`sending using IMG. useSafe: ${useSafe}`, part);

  try {
    const partData = JSON.stringify(part);
    this.sendIMG(this.makeURL(imgPath, [
      ['j', partData]
    ]));
  } catch (e) {
    log('Error during sending data using image', e);
  }
};

/**
 * Establish server connection if configured
 */
Transport.prototype.connect = function () {
  if (this.options.activateWs && wsSupported()) {
    const {
      wssPort,
      server
    } = this.options;
    this.startWs(server, wssPort);
  }
  return this;
}

/**
 * Start WebSocket connection
 * @param server
 */
Transport.prototype.startWs = function (host, port) {
  const pinger = setInterval(_ => {
    this.wsConnected && this.sendMessage({"name":"ping"});
  }, 1e4)
  try {
    const endp = `wss://${host}:${port}/wss?${qs.stringify(this.creds)}`;
    log(`ws endpoing: ${endp}`);
    this.ws = new Sockette(endp, {
      timeout: 5e3,
      maxAttempts: 10,
      onopen: e => {
        this.wsConnected = true;
        this.sendMessage({"name":"hello"});
        log('connected');
      },
      onmessage: e => {
        if (e.data) try {
          const data = JSON.parse(e.data);
          this.emit(INTERNAL_EVENT, SERVER_MESSAGE, data);
        } catch (err) {
          log.warn(err);
        }
      },
      onreconnect: e => {},
      onmaximum: e => log.warn('Stop Attempting!', e),
      onclose: e => {
        this.wsConnected = false
      },
      onerror: e => log('Error:', e)
    });

  } catch (e) {
    log.error('ws error', e);
  }
};


Transport.prototype.sendMessage = function (msg) {
  this.ws.json(objectAssign(msg, this.creds));
}
