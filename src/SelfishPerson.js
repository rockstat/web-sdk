'use strict';

const STORE_KEY = 'slfsh';

class SelfishPerson {

  constructor(tracker, options) {
    this.storage = tracker.localStorage;
  }

  saveConfig(options){
    this.storage.set(STORE_KEY, options);
  }

  getConfig(){
    return this.storage.get(STORE_KEY, {}, {});
  }
}

module.exports = SelfishPerson;
