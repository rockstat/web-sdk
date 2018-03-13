import Sockette from 'sockette';
import objectAssign from './functions/objectAssing';
import createLogger from './functions/createLogger';
import {win, doc, nav} from './Browser';
import {
  checkSendBeacon,
  isXHRWithCreds,
  isXHRsupported,
  isXDRsupported,
  wsSupported

} from './data/clientFeatures';
import {
  EVENT_OPTION_MEAN,
  EVENT_OPTION_OUTBOUND,
  EVENT_OPTION_TERMINATOR
} from './Variables';


const log = createLogger('Transport');
const noop = () => {
};

const Transport = function (options) {

  this.options = objectAssign(
    {sendTimeout: 5000},
    options
  );

  this.server = this.options.server;
  const parts = this.server.split('//');

  if (this.options.activateWs && wsSupported()) {
    this.startWs(parts[1]);
  }

};


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
    xhr.send(data);

  }
  else if (isXDRsupported()) {
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
 * @param query {string}
 * @param msg {Object}
 * @param options {Object}
 */
Transport.prototype.send = function (query, msg, options = {}) {

  const data = JSON.stringify(msg);
  const useSafe = !!options[EVENT_OPTION_TERMINATOR]
    || !!options[EVENT_OPTION_OUTBOUND]
    || !!options[EVENT_OPTION_MEAN];

  const postURL = this.server + '/track?' + query;
  const imgURL = this.server + '/img?' + query;

  log(`params. safe: ${useSafe}`);

  try {

    if (this.options.allowSendBeacon && checkSendBeacon()) {

      log('sending using beacon');
      nav.sendBeacon(postURL, data);
      return true;

    }
    else if (!useSafe && (this.options.allowXHR && (isXHRsupported() || isXDRsupported()))) {

      log('sending using XHR/XDR');
      this.sendXHR(postURL, data);
      return true;

    }
  } catch (error) {
    log.warn(error);
    msg.error = `${error.name}: ${error.message}`;
  }

  // Send only part when using gif
  const part = this.options.msgCropper(msg);
  log.log(`sending using IMG. useSafe: ${useSafe}`);

  try {
    const partData = btoa(JSON.stringify(part));
    this.sendIMG(imgURL + '&b64=' + partData);
  } catch (e) {
    log.error('Error during sending data using image', e);
  }
};


/**
 * Start WebSocket connection
 * @param server
 */
Transport.prototype.startWs = function (server) {

  // this.ws.close(); // graceful shutdown

  try {

    const ready = (type, e) => {
      log.warn('Connected!', e);
      if (!e) {
        this.ws.send('Hello, world!');
      }
    };

    const endp = 'wss://' + server + ':8082/ws';

    log(`ws endpoing: ${endp}`);

    this.ws = new Sockette(endp, {
      timeout: 5e3,
      maxAttempts: 10,
      onopen: e => (e) => ready('onopen', e),
      onmessage: e => log('Received:', e),
      onreconnect: e => log('Reconnecting...', e),
      onmaximum: e => log('Stop Attempting!', e),
      onclose: e => log('Closed!', e),
      onerror: e => log('Error:', e)
    });

  } catch (e) {
    log.error('ws error', e);
  }
};


export default Transport;
