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


const features = {
  'locstor': 'localStorage' in win && checkLS(),
  'addel': 'addEventListener' in win,
  'promise': 'Promise' in win,
  'sbeacon': 'sendBeacon' in nav,
  'atob': !!win.atob,
  'wpush': checkWPush()
};

export default features;
