import {nav, win} from '../Browser';

function checkLS() {
  try {
    const x = '__storage_test__';
    localStorage.setItem(x, x);
    localStorage.removeItem(x);
    return localStorage.getItem(x) === x;
  }
  catch (e) {
    return false;
  }
}

function checkWPush() {
  return ('serviceWorker' in nav && 'PushManager' in win)
    && ('showNotification' in ServiceWorkerRegistration.prototype);
}

export function checkSendBeacon() {
  return 'sendBeacon' in nav;
}

export function isXDRsupported() {
  return !!win.XDomainRequest;
}

export function isXHRsupported() {
  return !!win.XMLHttpRequest
}

export function isXHRWithCreds() {
  return isXHRsupported && ('withCredentials' in new win.XMLHttpRequest())
}

export default {
  'locstor': 'localStorage' in win && checkLS(),
  'addel': 'addEventListener' in win,
  'promise': 'Promise' in win,
  'sbeacon': checkSendBeacon(),
  'atob': !!win.atob,
  'wpush': checkWPush()
};

