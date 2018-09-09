import {
  nav,
  win
} from '../Browser';
import {
  isHttps
} from './pageDefaults';

function checkLS() {
  try {
    const ls = localStorage;
    const test = '_rstest_';
    ls.setItem(test, test);
    const res = ls.getItem(test);
    ls.removeItem(test);
    return res === test;
  } catch (e) {}
  return false;
}

function checkWPush() {
  return ('serviceWorker' in nav && 'PushManager' in win) &&
    ('showNotification' in ServiceWorkerRegistration.prototype);
}

export function isSendBeacon() {
  return 'sendBeacon' in nav;
}

export function isBlobSupported() {
  return 'Blob' in win;
}

export function isXDRsupported() {
  return !!window.XDomainRequest;
}

export function isXHRsupported() {
  return !!win.XMLHttpRequest;
}

export function isXHRWithCreds() {
  return isXHRsupported && ('withCredentials' in new win.XMLHttpRequest());
}

export function wsSupported() {
  const protocol = isHttps() ? 'wss' : 'ws';

  if ('WebSocket' in window) {
    let protoBin = ('binaryType' in WebSocket.prototype);
    if (protoBin) {
      return protoBin;
    }
    try {
      return !!(new WebSocket(protocol + '://.').binaryType);
    } catch (e) {}
  }

  return false;
}

export default {
  'ls': 'localStorage' in win && checkLS(),
  'ae': 'addEventListener' in win,
  'pr': 'Promise' in win,
  'sb': isSendBeacon(),
  'ab': !!win.atob,
  'wp': checkWPush()
};
