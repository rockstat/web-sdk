function createLooger(name) {

  const log = function (...args) {
    if(PRODUCTION) return;
    console && console.log && console.log(name+':', ...args)
  };

  log.warn = function (...args) {
    console && console.warn && console.warn(name+':', ...args)
  };

  log.error = (...args) => {
    console && console.error && console.error(...args);
  };

  return log;

}

export default createLooger;
