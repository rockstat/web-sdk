/**
 * Запускает функцию лишь однажды
 * @param cb
 * @return {Function}
 */
export default function once(cb) {
  let called = false;
  return function (...args) {
    if (called) return;
    called = true;
    cb(...args);
  };
}
