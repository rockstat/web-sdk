import objectAssign from './functions/objectAssing';
import createLogger from './functions/createLogger';
import {win, doc, nav} from './Browser';
import {checkSendBeacon, isXHRWithCreds, isXHRsupported, isXDRsupported} from './data/clientFeatures';
import {
  EVENT_OPTION_OUTBOUND,
  EVENT_OPTION_TERMINATOR
} from './Variables';

const log = createLogger('Transport');
const noop = () => {};

const Transport = function (options) {

  this.options = objectAssign({
    sendTimeout: 5000
  }, options);

  this.server = this.options.server;
};

Transport.prototype.sendXHR = function (url, data) {

  let xhr;
  if (isXHRWithCreds() || !isXDRsupported() && isXHRsupported()) {
    xhr = new win.XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.withCredentials = true;
    xhr.send(data);

  } else if (isXDRsupported()) {

    setTimeout(() => {
      xhr = new win.XDomainRequest();
      xhr.onload = noop();
      xhr.onerror = noop();
      xhr.ontimeout = noop();
      xhr.onprogress = noop();
      xhr.open('POST', url, true);
      xhr.send(data);
    },0);

  }
};

/**
 *
 * @param url {string}
 * @param msg {Object}
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
 * @param query {string}
 * @param msg {Object}
 * @param options {Object}
 */
Transport.prototype.send = function (query, msg, options = {}) {

  const data = JSON.stringify(msg);
  const useSafe = !!options[EVENT_OPTION_TERMINATOR] || !!options[EVENT_OPTION_OUTBOUND];

  const postURL = this.server + '/track?' + query;
  const imgURL = this.server + '/img?' + query;

  log(`params. safe:${useSafe} `);

  try {

    if (this.options.allowSendBeacon && checkSendBeacon()) {

      log('sending using beacon');
      nav.sendBeacon(postURL, data);
      return true;

    } else if (!useSafe && (this.options.allowXHR && (isXHRsupported() || isXDRsupported()))) {

      log('sending using XHR/XDR');
      this.sendXHR(postURL, data);
      return true;

    }
  } catch (error) {
    log.warn(error);
    msg.error = `${error.name}: ${error.message}`;
  }

  const part = this.options.msgCropper(msg);
  log.log(`sending using IMG. safe${useSafe}`);

  const partData = btoa(JSON.stringify(part));
  this.sendIMG(imgURL + '&b64=' + partData);
  return true;

};


export default Transport;
