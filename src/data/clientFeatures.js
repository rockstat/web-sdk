import {nav, win} from '../Browser';
import {isHttps} from './pageDefaults';

function checkLS() {
  try {
    const ls = localStorage;
    const x = '__storage_test__';
    ls.setItem(x, x);
    ls.removeItem(x);
    return ls.getItem(x) === x;
  }
  catch (e) {}
  return false;
}

function checkWPush() {
  return ('serviceWorker' in nav && 'PushManager' in win)
    && ('showNotification' in ServiceWorkerRegistration.prototype);
}

export function checkSendBeacon() {
  return 'sendBeacon' in nav;
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
  'locstor': 'localStorage' in win && checkLS(),
  'addel': 'addEventListener' in win,
  'promise': 'Promise' in win,
  'sbeacon': checkSendBeacon(),
  'atob': !!win.atob,
  'wpush': checkWPush()
};

