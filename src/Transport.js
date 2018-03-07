import objectAssign from './functions/objectAssing';
import createLogger from './functions/createLogger';
import {win, doc, nav} from './Browser';
import {checkSendBeacon, checkXHRCreds, checkXHR, checkXDR} from './data/clientFeatures';
import {
  EVENT_OPTION_OUTBOUND,
  EVENT_OPTION_TERMINATOR
} from './Variables';

const log = createLogger('Transport');

const Transport = function (options) {

  this.options = objectAssign({
    sendTimeout: 5000
  }, options);

  this.beaconSupport = options.useSendBeacon && checkSendBeacon();
  this.XHRSupport = options.useXHR && (checkXHR() || checkXDR());

  this.server = this.options.server;
};

Transport.prototype.sendXHR = function (url, data) {

  let xhr;
  if (checkXHRCreds() || !checkXDR() && checkXHR()) {
    xhr = new win.XMLHttpRequest();
  } else if (checkXDR()) {
    xhr = new win.XDomainRequest();
    xhr.timeout = this.options.sendTimeout;
    xhr.onload = noop();
    xhr.onerror = noop();
    xhr.ontimeout = noop();
    xhr.onprogress = noop();
  }
  xhr.open('POST', url, true);
  xhr.withCredentials = true;
  xhr.send(data);
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
  const useSafe = !!(options[EVENT_OPTION_TERMINATOR] || options[EVENT_OPTION_OUTBOUND]);

  const postURL = this.server + '/track?' + query;
  const imgURL = this.server + '/img?' + query;

  try {

    if (this.beaconSupport) {

      log('sending using beacon');
      nav.sendBeacon(postURL, data);
      return true;

    } else if (!useSafe && this.XHRSupport) {

      log('sending using XHR/XDR');
      this.sendXHR(postURL, data);
      return true;
    }
  } catch (error) {
    msg.error = `${error.name}: ${error.message}`;
  }

  const part = this.options.msgCropper(msg);
  log('sending using IMG');

  const partData = btoa(JSON.stringify(part));
  this.sendIMG(imgURL + '&b64=' + partData);
  return true;

};


export default Transport;
