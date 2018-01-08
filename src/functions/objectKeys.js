export default Object.keys || (function () {
  const hasOwnProperty = Object.prototype.hasOwnProperty;
  const hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString');
  const dontEnums = [
    'toString',
    'toLocaleString',
    'valueOf',
    'hasOwnProperty',
    'isPrototypeOf',
    'propertyIsEnumerable',
    'constructor'
  ];
  const dontEnumsLength = dontEnums.length;

  return function (obj) {
    if (typeof obj !== 'function' && (typeof obj !== 'object' || obj === null)) {
      throw new TypeError('Object.keys called on non-object');
    }

    const result = [];

    for (const prop in obj) {
      if (hasOwnProperty.call(obj, prop)) {
        result.push(prop);
      }
    }

    if (hasDontEnumBug) {
      for (let i = 0; i < dontEnumsLength; i++) {
        if (hasOwnProperty.call(obj, dontEnums[i])) {
          result.push(dontEnums[i]);
        }
      }
    }
    return result;
  };
}());
