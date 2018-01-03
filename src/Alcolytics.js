import objectAssign from './functions/objectAssing';
import createLogger from './functions/createLogger';
import LocalStorageAdapter from './LocalStorageAdapter';
import CookieStorageAdapter from './CookieStorageAdapter';
import pageDefaults from './functions/pageDefaults';
import browserData from './functions/browserData';
import clientData from './functions/clientData';
import FormTracker from './trackers/FormTracker';
import SessionTracker from './SessionTracker';
import ActivityTracker from './trackers/ActivityTracker';
import ClickTracker from './trackers/ClickTracker';
import Transport from './Transport';
import {isObject} from './functions/type';
import Emitter from 'component-emitter';
import each from './functions/each';
import {
  EVENT_PAGEVIEW,
  EVENT_IDENTIFY,
  EVENT_SESSION,
  EVENT_INITIAL_UID,
  CB_READY,
  CB_EVENT
} from "./Variables";

const log = createLogger('Alcolytics');

function Alcolytics() {

  log('starting Alcolytics');

  this.initialized = false;
  this.configured = false;
  this.queue = [];
  this.initialUid = '1';
  this.options = {
    sessionTimeout: 1800, // 30 min
    lastCampaignExpires: 7776000, // 3 month
    library: 'alco.js',
    libver: 8,
    projectId: 1,
    initialUid: 0,
    cookieDomain: 'auto'
  };

  this.callbacks = {};
}

Emitter(Alcolytics.prototype);

/**
 * Handle events from queue and start accepting events
 */
Alcolytics.prototype.initialize = function () {

  // Check is HTTPS
  const page = pageDefaults();

  if (page.proto !== 'https') {
    return log.warn('Works only on https');
  }

  // Check is initialized
  if (this.initialized) return;
  this.initialized = true;

  log('Initializing');

  // Check configured
  if (!this.configured) {
    this.configured = true;
    log.warn('Initializing before configured');
  }

  // Library data
  this.libInfo = {
    name: this.options.library,
    libver: this.options.libver,
    snippet: this.options.snippet,
  };

  this.transport = new Transport(this.options);

  // Constructing deps
  this.localStorage = new LocalStorageAdapter(this.options);
  this.cookieStorage = new CookieStorageAdapter(this.options);

  this.sessionTracker = new SessionTracker(this, this.options);
  this.sessionTracker.handleUid(this.initialUid);

  this.formTracker = new FormTracker();
  this.activityTracker = new ActivityTracker();
  this.clickTracker = new ClickTracker();

  // Running trackers
  const eventWrapper = ({name, data, options}) => this.event(name, data, options);

  this.sessionTracker.on('event', eventWrapper);
  this.formTracker.on('event', eventWrapper);
  this.activityTracker.on('event', eventWrapper);
  this.clickTracker.on('event', eventWrapper);

  // Ready
  this.emit(CB_READY);

  // Handling queue
  this.queue.map(e => {
    this.handle.apply(this, e);
  });
  this.queue = [];

  // Unload tracker
  window.addEventListener('beforeunload', function(event) {
    log('beforeunload');
  });

  window.addEventListener('unload', function(event) {
    log('unload');
  });

};

/**
 * Applying configuration block. Can be called multiple times
 * @param options
 */
Alcolytics.prototype.configure = function (options) {

  if (this.initialized) {
    return log.warn('Configuration cant be applied because already initialized');
  }

  this.configured = true;
  this.options = objectAssign(this.options, options);

};

/**
 * Calling from server.
 * @param uid
 */
Alcolytics.prototype.setInitialUid = function (uid) {

  this.initialUid = uid;

};

/**
 * Handling event
 * @param name
 * @param data
 */
Alcolytics.prototype.handle = function (name, data = {}, options = {}) {

  if (!this.initialized) {
    return this.queue.push([name, data]);
  }

  this.emit(CB_EVENT, name, data, options);

  // Special handlers
  if(name === EVENT_IDENTIFY){
    return this.sessionTracker.setUserData(data);
  }

  const page = pageDefaults();
  this.sessionTracker.handleEvent(name, data, page);

  // Cloning data
  data = objectAssign({}, data);

  const msg = {
    name: name,
    data: data,
    projectId: this.options.projectId,
    uid: this.sessionTracker.getUid(),
    user: this.sessionTracker.userData(),
    page: page,
    session: this.sessionTracker.sessionData(),
    library: this.libInfo,
    client: clientData(),
    browser: browserData()
  };

  // Sending to server
  const query = [
    'uid=' + this.sessionTracker.uid
  ];
  const url = this.options.server + '/track?' + query.join('&');
  this.transport.send(url, msg, options);

};

/**
 * Tracking event
 * @param name
 * @param data
 */
Alcolytics.prototype.event = function (name, data, options) {

  this.handle(name, data, options);

};

/**
 * Tracking page load
 */
Alcolytics.prototype.page = function (data, options) {

  this.handle(EVENT_PAGEVIEW, data, options);

};

/**
 * Tracking page load
 */
Alcolytics.prototype.identify = function (userId, userTraits) {

  if(isObject(userId)){
    userTraits = userId;
    userId = undefined;
  }

  this.handle(EVENT_IDENTIFY, {userId, userTraits})

};

/**
 * Add ready callback
 * @param cb
 */
Alcolytics.prototype.onReady = function (cb) {

  this.on(CB_READY, cb)

};

Alcolytics.prototype.onEvent = function (cb) {

  this.on(CB_EVENT, cb)

};

Alcolytics.prototype.getUid = function () {

  return this.sessionTracker.getUid();

};

export default Alcolytics;
