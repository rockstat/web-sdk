import objectAssign from './functions/objectAssing';
import createLogger from './functions/createLogger';

const log = createLogger('LocalStorage');

function LocalStorageAdapter(options) {
  options = options || {};

  this.options = objectAssign({
    prefix: 'alc:',
  }, options);

  this.available = this.checkAvailability();
  this.prefix = this.options.prefix;
}

LocalStorageAdapter.prototype.getPrefixedKey = function (key, options) {

  options = options || {};

  let prefix = this.prefix;

  if (options.session === true) {
    prefix += 's:';
  }

  return prefix + key;
};

LocalStorageAdapter.prototype.set = function (key, value, options) {

  if (!this.available)
    return;

  options = options || {};
  const query_key = this.getPrefixedKey(key, options);

  try {

    const exp = options.exp
      ? Math.round((new Date()).getTime() / 1000) + options.exp
      : '';

    localStorage.setItem(query_key, exp + '|' + JSON.stringify(value));

  } catch (e) {
    log(e);
    log.warn("LockStorage didn't successfully save the '{" + key + ": " + value + "}' pair, because the localStorage is full.");
  }

};

LocalStorageAdapter.prototype.get = function (key, options, missing) {

  if (!this.available)
    return;

  //const missing = undefined;
  options = options || {};
  const query_key = this.getPrefixedKey(key, options);

  let data;

  try {

    data = localStorage.getItem(query_key);

    if (data) {

      const nowSec = (new Date()).getTime() / 1000;
      const sepPos = data.indexOf('|');

      if(sepPos < 0){

        log.warn('Wrong format. Missing separator');

        this.rm(key, options);
        return missing;

      }

      const exp = data.substr(0, sepPos);
      const value = data.substr(sepPos + 1);

      if (exp && nowSec > exp) {

        this.rm(key, options);
        return missing;

      }

      return JSON.parse(value);

    } else {

      return missing;

    }

  } catch (e) {

    log(e);
    log.warn("LocalStorageAdapter could not load the item with key " + key);

  }


};

LocalStorageAdapter.prototype.inc = function (key, options) {

  if (!this.available)
    return;

  let counter = this.get(key, options) || 0;
  counter += 1;
  this.set(key, counter, options);
  return counter;

};

LocalStorageAdapter.prototype.rm = function (key, options) {

  if (!this.available)
    return;

  options = options || {};
  const query_key = this.getPrefixedKey(key, options);

  localStorage.removeItem(query_key);

};

LocalStorageAdapter.prototype.getAllKeys = function (options) {

  if (!this.available)
    return [];

  let keys = Object.keys(localStorage);
  const prefix = this.getPrefixedKey('', options);
  const result = [];

  for (let i = 0; i < keys.length; i++) {

    const key = keys[i];

    if (key.substr(0, prefix.length) === prefix) {
      result.push(key.substr(prefix.length));
    }
  }

  return result;

};

LocalStorageAdapter.prototype.getAll = function (options) {

  if (!this.available)
    return {};

  options = options || {};

  const keys = this.getAllKeys(options);
  const results = {};

  for (let i = 0; i < keys.length; i++) {

    const key = keys[i];
    results[key] = this.get(key, options);

  }

  return results
};

LocalStorageAdapter.prototype.rmAll = function (options) {

  if (!this.available)
    return;

  options = options || {};
  const keys = this.getAllKeys(options);

  for (let i = 0; i < keys.length; i++) {

    this.rm(keys[i]);

  }
};

LocalStorageAdapter.prototype.checkAvailability = function () {

  try {

    const x = '__storage_test__';
    localStorage.setItem(x, x);
    localStorage.removeItem(x);
    return true;
  }
  catch (e) {
    return false;
  }
};

export default LocalStorageAdapter;
