import './polyfill';
import {
  documentReady
} from './functions/domEvents';
import {
  win
} from './Browser';
import Tracker from './Tracker';

const wk = 'rstat';
if (win[wk]) {
  const holder = win[wk];
  // const buildTracker = function (stub) {
  const tracker = new Tracker();
  tracker.configure({
    snippet: holder._sv
  });
  // Attaching method to page
  const doCall = function (args) {
    args = args.slice(0);
    const method = args.shift();
    return tracker[method] ?
      tracker[method].apply(tracker, args) :
      new Error('Undefined method');
  };

  holder._q.map(doCall);
  holder.doCall = doCall;
  holder.queue = [];
  // }

  documentReady(() => {
    tracker.initialize();
  });
}
