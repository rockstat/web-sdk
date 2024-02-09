// import Sockette from 'sockette';
import Emitter from 'component-emitter';
import queryStringify from 'qs/lib/stringify';
// import Promise from 'promise-polyfill';

import {
  win,
  doc,
  nav
} from './Browser';
import {
  hasBeaconSupport,
  hasXHRWithCreds,
  hasXHRSupport,
  hasXDRSupport,
  hasAnyXRSupport,
  hasWSSupport
} from './data/browserCharacts';
import {
  EVENT_OPTION_OUTBOUND,
  EVENT_OPTION_TERMINATOR,
  EVENT_OPTION_REQUEST,
  EVENT_OPTION_TRANSPORT_IMG,
  SERVER_MESSAGE,
  INTERNAL_EVENT,
  SERVICE_TRACK,
} from './Constants';
import objectAssign from './functions/objectAssing';
import createLogger from './functions/createLogger';
// import { isObject } from './functions/type';

const HTTPS = 'https';
const WSS = 'wss';

const log = createLogger('RST/Transport');
const noop = () => { };


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
  this.creds = {};
  this.options = objectAssign({
    responseTimeout: 10000
  },
    options
  );
  this.pathPrefix = options.pathPrefix;
  this.server = this.options.server;
  // this.wsServer = this.options.wsServer || this.options.server;
  // this.wsPath = this.options.wsPath || '/wss';
  this.urlMark = this.options.urlMark;
  // this.wsConnected = false;
  this.servicesMap = {
    'track': 't4k'
  }
  this.msgCounter = new Date() - 1514764800000;
  this.waitCallers = {};
};


// Extending Emitter
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
 * @returns {Transport}
 */
Transport.prototype.makeURL = function (path, data = {}, proto = HTTPS) {
  const query = queryStringify(data);
  return `${proto}://${this.server}${this.pathPrefix}${path}?${query}`;
}

// Transport.prototype.makeWsURL = function (data = {}) {
//   const query = queryStringify(data);
//   return `${WSS}://${this.wsServer}${this.wsPath}?${query}`;
// }


/**
 * Creates XHR / XDR object
 * @param {string} url
 */
Transport.prototype.createXHR = function (url) {
  return new Promise(function (resolve, reject) {
    if (hasXHRWithCreds || !hasXDRSupport && hasXHRSupport) {
      /** @type {XMLHttpRequest} */
      const xhr = new win.XMLHttpRequest();
      xhr.open('POST', url, true);
      if (hasXHRWithCreds) {
        xhr.withCredentials = true;
      }
      // not used to prevent options requests
      // xhr.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");
      xhr.setRequestHeader("Content-Type", "application/json");
      resolve(xhr);
    } else if (hasXDRSupport) {
      // hack to prevent IE 'aborted' bug
      setTimeout(() => {
        xhr = new win.XDomainRequest();
        xhr.ontimeout = noop();
        xhr.onprogress = noop();
        xhr.open('POST', url, true);
        resolve(xhr);
      }, 0);
    }
  })
}


/**
 * Old good friend XHR
 * @param url
 * @param data
 */
Transport.prototype.sendXHR = function (url, data) {
  return new Promise((resolve, reject) => {
    const handler = (xhr) => {
      if (xhr.status === 200) {
        try {
          return resolve(JSON.parse(xhr.responseText));
        } catch (exc) {
          log.error(exc)
          return reject(exc);
        }
      } else {
        return reject(new Error('XHR request error'))
      }
    };

    this.createXHR(url)
      .then(xhr => {
        xhr.onload = () => handler(xhr);
        xhr.onerror = () => handler(xhr);
        xhr.send(data);
      })
      .catch(exc => reject(exc))
  });
};


/**
 *
 * @param url {string}
 */
Transport.prototype.sendIMG = function (url) {
  
  return new Promise((resolve, reject) => {
    const img = win.Image ? (new Image(1, 1)) : doc.createElement('img');
    img.src = url;
    img.onload = () => {
      resolve();
    };
    img.onerror = (err_msg) => {
      reject(err_msg);
    }        
  });
};


/**
 *
 * @param msg {Object}
 * @param query {Array}
 * @param options {Object}
 */
Transport.prototype.send = function (msg, options = {}) {
  const data = JSON.stringify(msg);
  const isRequest = !!options[EVENT_OPTION_REQUEST];
  const useTransportImg = !!options[EVENT_OPTION_TERMINATOR]
    || !!options[EVENT_OPTION_OUTBOUND] || !!options[EVENT_OPTION_TRANSPORT_IMG];
  const _service = this.servicesMap[msg.service] || msg.service;
  const postPath = `/${this.urlMark}/${_service}.json`;
  const imgPath = `/${this.urlMark}/${_service}.gif`;


  if (!useTransportImg){
    try {
      // if websocket activated

      // if (this.wsConnected) {
      //   log('sending using WS');
      //   return this.wsSendMessage(msg);
      // }
      // user sendBeacon only for notifications requests
      if (this.options.allowSendBeacon && hasBeaconSupport && !isRequest) {
        log.info('sending using beacon');
        nav.sendBeacon(this.makeURL(postPath), data);
        return Promise.resolve();
      }
      // regular XMLHttpRequest
      if (this.options.allowXHR && hasAnyXRSupport) {
        log.info('sending using XHR/XDR');
        return this.sendXHR(this.makeURL(postPath), data);
      }
      // If reuquired response but not available transport
      if (isRequest) {
        return Promise.reject('Requested request transport, but method unavailable');
      }
    } catch (error) {
      log.warn('Beacon/XHR failed', error);
    }
  }

  // Use extra transport - img
  // Send only part when using gif
  const smallMsg = (msg.service === SERVICE_TRACK)
    ? this.options.msgCropper(msg) : msg;
  log.info(`Trying to send using img`, smallMsg);

  try {
    return this.sendIMG(this.makeURL(imgPath, objectAssign(smallMsg, this.creds)));
  } catch (e) {
    log.warn('Error during sending data using image', e);
    return Promise.reject(e);
  }
};


/**
 * Establish server connection if configured
 */
Transport.prototype.connect = function () {
  // if (this.options.activateWs && hasWSSupport) {
  //   this.startWs();
  // }
  return this;
}


/**
 * Start WebSocket connection
 * @param server
 */
// Transport.prototype.startWs = function () {
//   const pinger = setInterval(_ => {
//     this.wsConnected && this.wsSendMessage({ "service": "track", "name": "ping" });
//   }, 1e4);
//   try {
//     const endpoint = this.makeWsURL(this.creds);
//     log(`ws endpoing: ${endpoint}`);
//     // this.ws = new Sockette(endpoint, {
//       // timeout: 5e3,
//       // maxAttempts: 10,
//       // onopen: (e) => {
//         // this.wsConnected = true;
//         // log('WS connected');
//         // this.wsSendMessage({ "service": "track", "name": "hello" });
//       // },
//       onmessage: (e) => {
//         if (e.data) {
//           try {
//             const data = JSON.parse(e.data);
//             if (isObject(data) && data.id__) {
//               this.clearWait(data.id__, true, data);
//             } else {
//               this.emit(INTERNAL_EVENT, SERVER_MESSAGE, data);
//             }
//           } catch (err) {
//             log.warn(err);
//           }
//         }
//       },
//       onreconnect: (e) => { },
//       onmaximum: (e) => log.warn('Stop Attempting!', e),
//       onclose: (e) => {
//         this.wsConnected = false;
//         clearInterval(pinger);
//       },
//       onerror: e => log('Error:', e)
//     });

//   } catch (e) {
//     log.error('ws error', e);
//   }
// };

// Transport.prototype.clearWait = function (id, success, dataOrError) {
//   if (this.waitCallers[id]) {
//     const wait = this.waitCallers[id];
//     delete this.waitCallers[id];
//     clearTimeout(wait.timeout)
//     if (!success && wait.reject) {
//       wait.reject(dataOrError)
//     }
//     else if (success && wait.resolve) {
//       wait.resolve(dataOrError);
//     }
//   }
// }

// Transport.prototype.wsSendMessage = function (msg, callback) {
//   const id = msg.id__ = '_' + this.msgId();
//   return new Promise((resolve, reject) => {
//     const timeout = setTimeout(() => {
//       this.clearWait(id, false, new Error('WS response Timeout'))
//     }, this.options.responseTimeout);
//     this.waitCallers[id] = { resolve, reject, timeout };
//     this.ws.json(objectAssign(msg, this.creds));
//   })
// }

Transport.prototype.msgId = function () {
  return ++this.msgCounter;
}
