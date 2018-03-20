const callable = function (fn) {
  if (typeof fn !== 'function') throw new TypeError(fn + " is not a function");
  return fn;
};

export default (function () {
  // W3C Draft
  // http://dvcs.w3.org/hg/webperf/raw-file/tip/specs/setImmediate/Overview.html
  if (typeof setImmediate === 'function') {
    return function (cb) { setImmediate(callable(cb)); };
  }

  // Wide available standard
  if ((typeof setTimeout === 'function') || (typeof setTimeout === 'object')) {
    return function (cb) { setTimeout(callable(cb), 0); };
  }

  return null;
}());
