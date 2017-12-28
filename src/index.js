// todo: check libs (localstorage, etc...)


const win = window;

// Feature detection
const features = {
  'locst': 'localStorage' in win,
  'addel': 'addEventListener' in win,
  'promise': 'Promise' in win,
  'sbeacon': 'sendBeacon' in navigator
};

// Main
import Alcolytics from './Alcolytics';

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

// Waiting document load
const initialize = document.onreadystatechange = function () {
  const rs = document.readyState;
  if (rs === 'complete' || rs === 'loaded' || rs === 'interactive') {
    alcolytics.initialize();
  }
};
initialize();
