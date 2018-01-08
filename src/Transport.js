import objectAssign from './functions/objectAssing';
import createLogger from './functions/createLogger';
import {win, doc, nav} from "./Browser";
import {
  EVENT_OPTION_OUTBOUND,
  EVENT_OPTION_SCHEDULED
} from "./Variables";

const log = createLogger('Transport');

const Transport = function (options) {

  this.options = objectAssign({}, this.defaults, options);
  this.beaconSupport = false// 'sendBeacon' in nav;

  this.server = this.options.server;

  const xhrFound = !!win.XMLHttpRequest;
  const xhrCreds = xhrFound && ('withCredentials' in new win.XMLHttpRequest());
  const xdrFound = !!win.XDomainRequest;

  if (xhrFound && xhrCreds || xhrFound && !xdrFound) {

    this.XHR = win.XMLHttpRequest;

  } else if (xdrFound) {

    this.XHR = win.XDomainRequest;

  } else {
    // HZ
  }
};


Transport.prototype.defaults = {
  xhrTimeout: 10000
};


Transport.prototype.sendBeacon = function (url, data) {

  data = JSON.stringify(data);

  if (this.beaconSupport) {

    log('sending native beacon');

    nav.sendBeacon(url, data);

  } else {

    log('sending xhr');

    const xhr = new this.XHR();
    xhr.withCredentials = true;
    xhr.open('POST', url, true);
    xhr.send(data);

    // Img load test
    const img = win.Image ? (new Image(1,1)) : doc.createElement('img');
    img.src = this.server + '/track?' + (new Date()).getTime();
    img.onload = () => {
      log('img loaded');
    };
  }
};

Transport.prototype.sendBasic = function (url, data) {

  data = JSON.stringify(data);

  const xhr = new this.XHR();
  xhr.withCredentials = true;
  xhr.timeout = this.options.xhrTimeout;
  xhr.open('POST', url, true);
  xhr.send(data);

  //TODO: handle error, success

};


Transport.prototype.send = function (url, data, options = {}) {

  return (options[EVENT_OPTION_SCHEDULED] || options[EVENT_OPTION_OUTBOUND]
      ? this.sendBeacon
      : this.sendBasic
  ).call(this, url, data, options);

};


export default Transport;
