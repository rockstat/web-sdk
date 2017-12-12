import objectAssign from './functions/objectAssing';
import createLogger from './functions/createLogger';
import LocalStorageAdapter from './LocalStorage';
import SessionTracker from './SessionTracker';
import pageDefaults from './pageDefaults';
import browserData from './browserData';
import clientData from './clientData';

import {
  EVENT_PAGEVIEW
} from "./Variables";

const log = createLogger('ALC');

function Alcolytics() {

  log('starting Alcolytics');

  this.initialized = false;
  this.queue = [];
  this.options = {
    sessionTimeout: 1800, // 30 min
    lastCampaignExpires: 7776000, // 3 month
    library: 'alco.js',
    libver: 1,
    projectId: 0,
    initialUid: 0
  };

  this.storage = new LocalStorageAdapter();
  this.sessionTracker = new SessionTracker(this.storage, this.options);
  this.sessionTracker.addEventCallback(ev => this.event(ev));

}

/**
 * Handle events from queue and start accepting events
 */
Alcolytics.prototype.initialize = function () {

  if(this.initialized) return;
  this.initialized = true;

  // Handling queue
  this.queue.map(e => {
    this.handle.apply(this, e);
  });
  this.queue = [];

};

Alcolytics.prototype.sendToServer = function (data) {

  const query = [
    'uid='+this.sessionTracker.uid
  ];

  window.fetch(this.options.server + '/track?' + query.join('&'), {
    method: 'POST',
    body: JSON.stringify(data)
  }).then(result => {
      log('fetch result', result);
    })
    .catch(err => {
      log.warn('fetch err', err);
    })
};


/**
 * Handling event
 * @param name
 * @param data
 */
Alcolytics.prototype.handle = function (name, data) {

  if(!this.initialized){
    return this.queue.push([name, data]);
  }

  const page = pageDefaults();

  this.sessionTracker.handleEvent(name, objectAssign({}, page));

  // Cloning data
  data = objectAssign({}, data);

  const msg = {
    projectId: this.options.projectId,
    uid: this.sessionTracker.uid,
    ymClientId: this.sessionTracker.ymClientId,
    gaClientId: this.sessionTracker.gaClientId,
    page: pageDefaults(),
    session: this.sessionTracker.lastSession,
    library: this.libInfo,
    name: name,
    data: data,
    client: clientData(),
    browser: browserData()
  };

  this.sendToServer(msg);

};

/**
 * Tracking event
 * @param name
 * @param data
 */
Alcolytics.prototype.event = function (name, data) {

  this.handle(name, data);

};

/**
 * Tracking page load
 */
Alcolytics.prototype.page = function (data) {

  this.handle(EVENT_PAGEVIEW, data);

};

/**
 * Calling from server.
 * @param uid
 */
Alcolytics.prototype.setInitialUid = function (uid) {

  this.sessionTracker.setInitialUid(uid);

};

/**
 * Applying configuration block. Can be called multiple times
 * @param options
 */
Alcolytics.prototype.configure = function (options) {

  this.options = objectAssign(this.options, options);
  this.libInfo = {
    name: this.options.library,
    libver: this.options.libver,
    snippet: this.options.snippet,
  };

};


export default Alcolytics;
