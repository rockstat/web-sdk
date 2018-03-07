import objectKeys from './objectKeys';

export default Object.assign ? Object.assign : function(target, firstSource) {

  if (target === undefined || target === null) {
    return;
  }

  const to = Object(target);
  for (let i = 1; i < arguments.length; i++) {
    let nextSource = arguments[i];
    if (nextSource === undefined || nextSource === null) {
      continue;
    }

    const keysArray = objectKeys(Object(nextSource));
    for (let nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
      const nextKey = keysArray[nextIndex];
      const desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
      if (desc !== undefined && desc.enumerable) {
        to[nextKey] = nextSource[nextKey];
      }
    }
  }
  return to;
}
