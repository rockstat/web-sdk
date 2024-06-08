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
  hasFetchSupport,
  hasXHRWithCreds,
  hasXHRSupport,
  hasXDRSupport,
  hasAnyXRSupport,
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
import nextTick from './functions/nextTick'
import simpleHash from './functions/simpleHash';
// import { isObject } from './functions/type';

const HTTPS = 'https';

const log = createLogger('RST/Transport');
const noop = () => { };


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

/**
 *
 * @param url {string}
 */
Transport.prototype.sendIMG = function (url) {

  const p = new Promise((resolve, reject) => {
    const img = win.Image ? (new Image(1, 1)) : doc.createElement('img');
    // img.onload = () => {
    //   resolve();
    // };
    // img.onerror = (err_msg) => {
    //   reject(err_msg);
    // }
    // img.onload = () => console.log('ok');
    // img.onerror = (err_msg) => console.warn(err_msg);
    img.src = url;
    nextTick(() => resolve())
  });
  return p;
};


/**
 *
 * @param msg {Object}
 * @param query {Array}
 * @param options {Object}
 * @returns {Promise}
 * 
 * TODO: Use sendBeacon when unloading instead of img
 * 
 */
Transport.prototype.send = function (msg, options = {}) {
  const data = JSON.stringify(msg);
  const dig = simpleHash(data);
  const isRequest = !!options[EVENT_OPTION_REQUEST];
  // !options[EVENT_OPTION_TERMINATOR] || !!options[EVENT_OPTION_OUTBOUND] || 
  const useTransportImg = !!options[EVENT_OPTION_TRANSPORT_IMG];
  const _service = this.servicesMap[msg.service] || msg.service;
  const postPath = `/${this.urlMark}/${_service}.json`;
  const imgPath = `/${this.urlMark}/${_service}.gif`;

  if (!useTransportImg) {
    try {
      const postUrl = this.makeURL(postPath, { "dig": dig });
      if (hasFetchSupport) {
        return fetch(postUrl, {
          method: 'POST',
          body: data,
          keepalive: true
        }).then((response) => {
          return response.text()
            .then((responseText) => {
              console.log('resp text', responseText, response.status, response.status === 200);
              if (response.status === 200) {
                try {
                  return Promise.resolve(JSON.parse(responseText));
                } catch (e) {
                  log.error(e)
                  return Promise.reject(e);
                }
              }
            });
        }).catch((error) => {
          log.warn('Fetch failed', error);
        });
      }
      if (this.options.allowSendBeacon && hasBeaconSupport && !isRequest) {
        log.info('sending using beacon');
        nav.sendBeacon(postUrl, data);
        return Promise.resolve();
      }
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
