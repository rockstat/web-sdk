import createLogger from './functions/createLogger'

const log = function (type, arr, name) {
  const time = (new Date()).toISOString().substr(11, 11);

  if (('console' in window) && (type in console)) {
    const call = Function.prototype.call;
    call.apply(call, [console[type], console, time, ...arr]);
  }
};

export const Logger = function () {

}

Logger.silent = PRODUCTION;
Logger.prototype.create = function (name) {
  return {
    debug: function (...args) {
      if (!Logger.silent) {
        log('debug', args, name);
      }
    },
    info: function (...args) {
      if (!Logger.silent) {
        log('info', args, name);
      }
    },
    warn: function (...args) {
      log('warn', args, name);
    },
    error: function (...args) {
      log('error', args, name);
    }
  }
}

export const logger = new Logger();
