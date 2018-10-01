import './polyfill';
import 'core-js';

import {
  documentReady
} from './functions/domEvents';
import {
  win
} from './Browser';
import Tracker from './Tracker';
import { packSemVer } from './functions/packSemVer';

const wk = 'rstat';

if (win[wk]) {
  const holder = win[wk];
  if (!holder._loaded) {
    const tracker = new Tracker();
    tracker.configure({
      snippet: packSemVer(`${holder._sv}`)
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
    holder._loaded = true;
    holder._q = [];
    documentReady(() => {
      tracker.initialize();
    });
  } else {
    console && console.error && console.error('rockstat already loaded');
  }
}
