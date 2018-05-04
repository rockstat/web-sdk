import './polyfill';
import {
  documentReady
} from './functions/domEvents';
import {
  win
} from './Browser';

// Main
import Alcolytics from './Alcolytics';

const holder = win['alco'];

if (holder) {
  const buildTracker = function (stub) {

    const tracker = new Alcolytics();
    tracker.configure({
      server: holder.server,
      snippet: holder.snippet
    });

    // Attaching method to page
    const doCall = function (args) {
      args = args.slice(0);
      const method = args.shift();
      return alcolytics[method] ?
        alcolytics[method].apply(alcolytics, args) :
        new Error('Method not supported');
    };


    holder.queue.map(doCall);
    holder.doCall = doCall;
    holder.queue = [];

  }



  documentReady(() => {
    alcolytics.initialize();
  });
}
