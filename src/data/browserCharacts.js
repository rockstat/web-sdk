import {
  nav,
  win
} from '../Browser';
import {
  isHttps
} from './pageDefaults';

export const hasLocStoreSupport = (function () {
  try {
    const ls = localStorage;
    const test = '_rstest_';
    ls.setItem(test, test);
    const res = ls.getItem(test);
    ls.removeItem(test);
    return res === test;
  } catch (e) { }
  return false;
})();

export const hasPromiseSupport = (function () {
  return 'Promise' in win;
})();

export const hasAddELSupport =  (function () {
  return 'addEventListener' in win;
})();

export const hasWebPushSupport = (function () {
  return ('serviceWorker' in nav && 'PushManager' in win) &&
    ('showNotification' in ServiceWorkerRegistration.prototype);
})();

export const hasBeaconSupport = (function () {
  return 'sendBeacon' in nav;
})();

export const hasBlobSupport = (function () {
  return 'Blob' in win;
})();

export const hasXDRSupport = (function () {
  return !!window.XDomainRequest;
})();

export const hasXHRSupport = (function () {
  return !!win.XMLHttpRequest;
})();

export const hasXHRWithCreds = (function () {
  return hasXHRSupport && ('withCredentials' in new win.XMLHttpRequest());
})();

export const hasAnyXRSupport = (function () {
  return hasXHRSupport || hasXDRSupport;
})();

export const hasBase64Support = (function () {
  return win.atob && win.btoa;
})();

export const hasWSSupport = (function () {
  const protocol = isHttps() ? 'wss' : 'ws';
  if ('WebSocket' in window) {
    let protoBin = ('binaryType' in WebSocket.prototype);
    if (protoBin) {
      return protoBin;
    }
    try {
      return !!(new WebSocket(protocol + '://.').binaryType);
    } catch (e) { }
  }
  return false;
})();

export default {
  'ls': hasLocStoreSupport,
  'pr': hasPromiseSupport,
  'ae': hasAddELSupport,
  'sb': hasBeaconSupport,
  'ab': hasBase64Support,
  'wp': hasWebPushSupport
};
