function createLooger(name) {

  const log = function (...args) {
    if(PRODUCTION) return;
    console && console.log && console.log(name+':', ...args)
  };

  log.warn = function (...args) {
    if(PRODUCTION) return;
    console && console.warn && console.warn(name+':', ...args)
  };

  log.error = (...args) => {
    if(PRODUCTION) return;
    console && console.error && console.error(...args);
  };

  return log;

}

export default createLooger;
