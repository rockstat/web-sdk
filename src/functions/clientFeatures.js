import {nav, win} from '../Browser';

function checkLS() {
  try {
    const x = '__storage_test__';
    localStorage.setItem(x, x);
    localStorage.removeItem(x);
    return true;
  }
  catch (e) {
    return false;
  }
}

const features = {
  'locstor': 'localStorage' in win && checkLS(),
  'addel': 'addEventListener' in win,
  'promise': 'Promise' in win,
  'sbeacon': 'sendBeacon' in nav,
  'atob': !!win.atob
};

export default features;
