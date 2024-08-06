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
// import simpleHash from './functions/simpleHash';
import { cyrb53 } from './functions/cyrb53';
// import { isObject } from './functions/type';

const HTTPS = 'https';

const log = createLogger('RST/Transport');
const noop = () => { };

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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


/*
if (false && hasFetchSupport) {
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
*/

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
  const dig = cyrb53(data);
  const isRequest = !!options[EVENT_OPTION_REQUEST];
  // !options[EVENT_OPTION_TERMINATOR] || !!options[EVENT_OPTION_OUTBOUND] || 
  const useTransportImg = !!options[EVENT_OPTION_TRANSPORT_IMG];
  const _service = this.servicesMap[msg.service] || msg.service;
  const postPath = `/${this.urlMark}/${_service}.json`;
  const imgPath = `/${this.urlMark}/${_service}.gif`;

  const postUrlBeacon = this.makeURL(postPath, { "dig": dig, "td_trans": "b"});
  const postUrlFetch = this.makeURL(postPath, { "dig": dig, "td_trans": "f" });
  // Use extra transport - img
  // Send only part when using gif
  return new Promise((resolve, reject) => {
    if (useTransportImg) {
      try {
        const smallMsg = (msg.service === SERVICE_TRACK)
          ? this.options.msgCropper(msg) : msg;
        log.info(`Trying with img transport`, smallMsg);

        const imgUrl = this.makeURL(imgPath, objectAssign(smallMsg, this.creds));

        const img = win.Image ? (new Image(1, 1)) : doc.createElement('img');
        img.src = imgUrl;
        return nextTick(() => resolve());
      } catch (e) {
        return nextTick(() => reject(e));
      }
    }

    try {

      let beaconResult = false;

      if (this.options.allowSendBeacon && hasBeaconSupport) {
        log.info('Sending using beacon');
        beaconResult = nav.sendBeacon(postUrlBeacon, data);
      }

      if (beaconResult) {
        return nextTick(() => resolve());
      }

      if (hasFetchSupport) {
        log.info('Sending using fetch');
        fetch(postUrlFetch, {
          method: 'POST',
          body: data,
          keepalive: true
        }).then((response) => {
          return response.then((responseText) => {
            if (response.status === 200) {
              try {
                return JSON.parse(responseText);
              } catch (e) {
                return Promise.reject(e)
              }
            }
          });
        }).then((data) => {
          return resolve(data)
        }).catch((e) => {
          return reject(e)
        });
      }
    } catch (e) {
      log.warn('Fetch err', e);
    }
    return reject(e)
  });


  // => response.text()
  // .then((responseText) => {
  //   console.log('resp text', responseText, response.status, response.status === 200);
  //   if (response.status === 200) {
  //     try {
  //       resolve(JSON.parse(responseText));
  //     } catch (e) {
  //       log.error(e)
  //       return reject(e);
  //     }
  //   }
  // }



  // return new Promise((resolve, reject) => {

  //   const doSendBeacon = (attempt) => {
  //     log.warn(`Sending beacon. Attempt ${attempt}`);
  //     let res = nav.sendBeacon(postUrl, data);
  //     if (res === true) {
  //       return resolve();
  //     }
  //     if (attempt > 0) {
  //       setTimeout(doSendBeacon(attempt - 1), 200);
  //     } else {
  //       nextTick(() => doSendImg());
  //     }
  //   }

  //   const doFetch = () => {



  //   }

  //   // if (false && hasFetchSupport) {
  //   // }

  //   if (isRequest) {
  //     return doFetch();
  //     // return reject('Requested request transport, but method unavailable');
  //   }

  //   if (useTransportImg) {
  //     return doSendImg();
  //   }
  // } catch (error) {
  //   log.warn('Beacon/XHR failed', error);
  //   return reject(error);
  // }

  // try {
  //   return this.sendIMG(this.makeURL(imgPath, objectAssign(smallMsg, this.creds)));
  // } catch (e) {
  //   log.warn('Error during sending data using image', e);
  //   return Promise.reject(e);
  // }

  // });





};
