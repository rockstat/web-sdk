const getTime = function () {
  return (new Date()).toISOString().substr(11);
};


const logger = function( type, arr ) {
  if (( 'console' in window ) && ( type in console )) {
    const call = Function.prototype.call;
    call.apply( call, [ console[ type ], console ].concat( arr ));
  }
};

export default function createLooger(name) {

  const log = function (...args) {
    if(!PRODUCTION){
      logger('log', args);
    }
  };

  log.warn = function (...args) {
    logger('warn', args);
  };

  log.error = (...args) => {
    const prefix = `${getTime()} ${name}:`;
    logger('error', args);
  };

  return log;
}
