export default function runOnFinish(cb, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => cb(...args), wait);
  };
}
