import './polyfill';
import {addHandler, removeHandler, isDocInteractive, isDocComplete} from "./functions/domEvents";
import {win, doc, nav} from "./Browser";

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

if (isDocInteractive() || isDocComplete()) {
  alcolytics.initialize();
} else {
  addHandler(doc, 'DOMContentLoaded', function () {
    alcolytics.initialize();
    removeHandler(doc, 'DOMContentLoaded', this);
  });
}
