import {win} from '../Browser';

const isProd = PRODUCTION;


const logger = function (type, arr, prefix) {
  if (('console' in window) && (type in console)) {

    // Sending to remote log
    if(window['rstat'] && (type === 'warn' || type === 'error')){
      const estr = arr.map(e => e instanceof Error ? e+"": e);
      window.rstat('logOnServer', type, estr);
    }
    const call = Function.prototype.call;
    call.apply(call, [console[type], console].concat(prefix ? [prefix] : [])
      .concat(arr));
  }
};

export default function createLogger(name) {

  const prefix = () => {
    const time = (new Date()).toISOString()
      .substr(11);
    return `${time} ${name}:`;
  };

  const log = function (...args) {
    if (!isProd || window._rst_logger) {
      logger('log', args, prefix());
    }
  };

  log.warn = function (...args) {
    logger('warn', args, prefix());
  };

  log.error = (...args) => {
    logger('error', args, prefix());
  };

  return log;
}
