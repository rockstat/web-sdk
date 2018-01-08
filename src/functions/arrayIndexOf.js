export default function arrayIndexOf(array, searchElement, startFrom) {

  if (array.indexOf) {
    return array.indexOf(searchElement, startFrom);
  }

  if (this === undefined || this === null) {
    throw new TypeError(this + ' is not an object');
  }

  const arraylike = array instanceof String ? this.split('') : array;
  const length = Math.max(Math.min(arraylike.length, 9007199254740991), 0) || 0;
  let index = startFrom || 0;

  index = (index < 0 ? Math.max(length + index, 0) : index) - 1;

  while (++index < length) {
    if (index in arraylike && arraylike[index] === searchElement) {
      return index;
    }
  }

  return -1;
};


