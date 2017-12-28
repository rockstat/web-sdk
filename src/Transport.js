import objectAssign from './functions/objectAssing';

const win = window;

const Transport = function (options) {

  this.options = objectAssign({}, this.defaults, options);
  this.hasBeacon = 'sendBeacon' in navigator;

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


Transport.prototype.sendBeacon = function (url, data) {

  console.log('sending beacon');

  data = JSON.stringify(data);
  navigator.sendBeacon(url, data);

};

Transport.prototype.sendXHR = function (url, data, unloading) {

  data = JSON.stringify(data);
  const async = !unloading;

  const xhr = new this.XHR();
  xhr.withCredentials = true;
  xhr.timeout = async ? this.options.timeout : this.options.syncTimeout;
  xhr.open('POST', url, async);
  xhr.send(data);

};


Transport.prototype.defaults = {
  syncTimeout: 300,
  timeout: 10000
};


Transport.prototype.send = function (url, data, unloading) {

  return (this.hasBeacon && unloading
      ? this.sendBeacon
      : this.sendXHR
  ).apply(this, arguments);

};


export default Transport;
