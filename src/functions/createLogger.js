const getTime = function () {
  return (new Date()).toISOString().substr(11);
};

export default function createLooger(name) {

  const log = function (...args) {
    if(PRODUCTION) return;
    console && console.log && console.log(`${getTime()} ${name}:`, ...args)
  };

  log.warn = function (...args) {
    console && console.warn && console.warn(`${getTime()} ${name}:`, ...args)
  };

  log.error = (...args) => {
    console && console.error && console.error(`${getTime()} ${name}:`, ...args);
  };

  return log;
}
