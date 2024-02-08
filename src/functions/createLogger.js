import {win} from '../Browser';

const isProd = PRODUCTION;


const logger = function (type, arr, prefix) {
  if (('console' in win) && (type in console)) {

    // Sending to remote log
    const call = Function.prototype.call;
    call.apply(call, [console[type], console].concat(prefix ? [prefix] : [])
      .concat(arr));
  }
};

export default function createLogger(name) {

  const prefix = () => {
    const time = (new Date()).toISOString().substring(11);
    return `${time} ${name}:`;
  };

  const log = function (...args) {
    if (!isProd || win._rst_logger) {
      logger('info', args, prefix());
    }
  };

  log.info = function (...args) {
    if (!isProd || win._rst_logger) {
      logger('info', args, prefix());
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
