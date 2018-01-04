// todo: check libs (localstorage, etc...)

const win = window;
const doc = document;

// Feature detection
const features = {
  'locst': 'localStorage' in win,
  'addel': 'addEventListener' in win,
  'promise': 'Promise' in win,
  'sbeacon': 'sendBeacon' in navigator
};

// Main
import Alcolytics from './Alcolytics';
import once from './functions/once';

const varname = 'alco';
const alco = win[varname];
const alcolytics = new Alcolytics();
alcolytics.configure({
  server: alco.server,
  snippet: alco.snippet
});

// Attaching method to page
alco.doCall = function (args) {
  args = args.slice(0);
  const method = args.shift();
  return alcolytics[method]
    ? alcolytics[method].apply(alcolytics, args)
    : new Error('Method not supported');
};
alco.queue.map(alco.doCall);
alco.queue = [];

const initialize = once(() => {
  alcolytics.initialize();

  doc.removeEventListener && doc.removeEventListener('DOMContentLoaded', initialize);
  doc.detachEvent && doc.detachEvent("onreadystatechange", initialize);
});

const checkInteractive = () => {
  const state = doc.readyState;
  if (state === 'complete' || state === 'loaded' || state === 'interactive') {
    initialize();
  }
};

doc.addEventListener && doc.addEventListener('DOMContentLoaded', initialize);
doc.attachEvent && doc.attachEvent("onreadystatechange", checkInteractive);
checkInteractive();
