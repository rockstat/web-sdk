import './polyfill';
import {documentReady} from "./functions/domEvents";
import {win} from "./Browser";

// Main
import Alcolytics from './Alcolytics';

const holder = win['alco'];
const alcolytics = new Alcolytics();
alcolytics.configure({
  server: holder.server,
  snippet: holder.snippet
});

// Attaching method to page
holder.doCall = function (args) {
  args = args.slice(0);
  const method = args.shift();
  return alcolytics[method]
    ? alcolytics[method].apply(alcolytics, args)
    : new Error('Method not supported');
};
holder.queue.map(holder.doCall);
holder.queue = [];

documentReady(() => {
  alcolytics.initialize();
});
