import nextTick from './nextTick';

/**
 * Loop on a short interval until `condition()` is true, then call `fn`.
 *
 * @param {Function} condition
 * @param {Function} fn
 * @param {number} [interval=25]
 * @param {number} [attemps=-1]
 */

export default function (condition, fn, interval, attemps) {
  if (typeof condition !== 'function') throw new Error('condition must be a function');
  if (typeof fn !== 'function') throw new Error('fn must be a function');
  attemps = attemps || -1;

  if (condition()) return nextTick(fn);

  const counter = () => {
    return attemps < 0 || attemps > 0
  };

  const ref = setInterval(function () {
    if (!counter()) return clearInterval(ref);
    if (!condition()) return;
    nextTick(fn);
    clearInterval(ref);
  }, interval || 100);
}

