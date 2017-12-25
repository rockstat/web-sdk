import objectAssign from './functions/objectAssing';
import pageDefaults from './functions/pageDefaults';
import createLogger from './functions/createLogger';
import autoDomain from './functions/autoDomain';
import Cookies from 'js-cookie';

const log = createLogger('CookieStorage');

function CookieStorageAdapter(options) {
  options = options || {};

  this.options = objectAssign({
    prefix: 'alc-',
  }, options);

  const pd = pageDefaults();

  this.domain = this.options.cookieDomain === 'auto'
    ? autoDomain(pd.hostname)
    : this.options.cookieDomain;

  this.available = this.checkAvailability();
  this.prefix = this.options.prefix;
  this.exp = new Date((new Date()).getTime() + 3*31536e+6);

  log(`Domain: ${this.domain}`);

}

CookieStorageAdapter.prototype.initialize = function () {

  let prefix = this.prefix;
  return prefix + key;

};


CookieStorageAdapter.prototype.getPrefixedKey = function (key, options) {

  let prefix = this.prefix;
  return prefix + key;
};


CookieStorageAdapter.prototype.set = function (key, value, options = {}) {

  if (!this.available)
    return;

  key = this.getPrefixedKey(key, options);

  const exp = !!options.session
    ? undefined
    : (options.exp
      ? new Date((new Date()).getTime() + options.exp * 1000)
      : this.exp);

  Cookies.set(key, value, { expires: exp, domain: this.domain, secure: true });


};

CookieStorageAdapter.prototype.get = function (key, options = {}) {

  if (!this.available)
    return;

  options = options || {};
  key = this.getPrefixedKey(key, options);

  return Cookies.get(key);


};

CookieStorageAdapter.prototype.inc = function (key, options) {

  if (!this.available)
    return;

  let counter = this.get(key, options) || 0;
  counter += 1;
  this.set(key, counter, options);
  return counter;
};

CookieStorageAdapter.prototype.rm = function (key, options) {

  if (!this.available)
    return;

  options = options || {};
  key = this.getPrefixedKey(key, options);

  Cookies.remove(key, { domain: this.domain, secure: true });
};


CookieStorageAdapter.prototype.getAllKeys = function (options) {

  if (!this.available)
    return [];

  const prefix = this.getPrefixedKey('', options);
  const result = [];

  let keys = Object.keys(Cookies.get());
  for (let i = 0; i < keys.length; i++) {

    const key = keys[i];

    if (key.substr(0, prefix.length) === prefix) {
      result.push(key.substr(prefix.length));
    }
  }

  return result;
};

CookieStorageAdapter.prototype.getAll = function (options) {

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

CookieStorageAdapter.prototype.rmAll = function (options) {

  if (!this.available)
    return;

  options = options || {};
  const keys = this.getAllKeys(options);

  for (let i = 0; i < keys.length; i++) {

    this.rm(keys[i]);

  }
};

CookieStorageAdapter.prototype.checkAvailability = function () {
  return true;
};

export default CookieStorageAdapter;
