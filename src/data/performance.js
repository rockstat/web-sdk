/**
 * https://developer.mozilla.org/en-US/docs/Web/API/PerformanceTiming
 */
import {win} from "../Browser";

const perf = win.performance;

export default function () {

  const timing = perf && perf.timing;

  if (!timing) return;
  const cs = timing.connectStart;
  const dc = timing.domComplete;
  const scs = timing.secureConnectionStart;


  return {
    cs: 0,
    ce: timing.connectEnd - cs,
    scs: scs ? scs - cs : -1,
    rqs: timing.requestStart - cs,
    rss: timing.responseStart - cs,
    rse: timing.responseEnd - cs,
    dl: timing.domLoading - cs,
    di: timing.domInteractive - cs,
    dc: dc ? dc - cs : -1,
  };

}
