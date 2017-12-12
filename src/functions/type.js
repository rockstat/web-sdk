
export function isArray(arg) {

  return Array.isArray
    ? Array.isArray(arg)
    : Object.prototype.toString.call(arg) === '[object Array]';

}

export function isObject(arg) {

  return typeof arg === 'object';

}
