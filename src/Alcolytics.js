import objectAssign from './functions/objectAssing';
import createLogger from './functions/createLogger';
import LocalStorageAdapter from './LocalStorageAdapter';
import CookieStorageAdapter from './CookieStorageAdapter';
import SessionTracker from './SessionTracker';
import pageDefaults from './functions/pageDefaults';
import browserData from './functions/browserData';
import clientData from './functions/clientData';
import {isObject} from './functions/type';
import FormTracker from './trackers/FormTracker';
import ActivityTracker from './trackers/ActivityTracker';
import Transport from './Transport';
import {
  EVENT_PAGEVIEW,
  EVENT_IDENTIFY,
  EVENT_SESSION,
  EVENT_INITIAL_UID
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
    libver: 1,
    projectId: 1,
    initialUid: '0',
    cookieDomain: 'auto'
  };
}

/**
 * Handle events from queue and start accepting events
 */
Alcolytics.prototype.initialize = function () {

  // Check HTTPS
  const page = pageDefaults();

  if (page.proto !== 'https') {
    return log.warn('Works only on https');
  }

  // Check initialized
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
  this.sessionTracker.setInitialUid(this.initialUid);
  this.sessionTracker.addEventCallback((name, data) => this.event(name, data));

  // Running trackers

  const eventWrapper = ({name, data}) => this.event(name, data);

  this.formTracker = new FormTracker();
  this.formTracker.on('event', eventWrapper);

  this.activityTracker = new ActivityTracker();
  this.activityTracker.on('event', eventWrapper);

  // Handling queue
  this.queue.map(e => {
    this.handle.apply(this, e);
  });
  this.queue = [];

};

Alcolytics.prototype.sendToServer = function (data) {

  const query = [
    'uid=' + this.sessionTracker.uid
  ];
  const url = this.options.server + '/track?' + query.join('&');
  this.transport.send(url, data);

};


/**
 * Handling event
 * @param name
 * @param data
 */
Alcolytics.prototype.handle = function (name, data) {

  if (!this.initialized) {
    return this.queue.push([name, data]);
  }

  if(name === EVENT_IDENTIFY){
    return this.sessionTracker.setUserData(data);
  }

  const page = pageDefaults();
  this.sessionTracker.handleEvent(name, data, page);

  // Cloning data
  data = objectAssign({}, data);

  const msg = {
    projectId: this.options.projectId,
    uid: this.sessionTracker.uid,
    user: this.sessionTracker.userData(),
    ymClientId: this.sessionTracker.ymClientId,
    gaClientId: this.sessionTracker.gaClientId,
    page: objectAssign({
        number: this.sessionTracker.getPageNum()
      }, page
    ),
    session: this.sessionTracker.sessionData(),
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
 * Calling from server.
 * @param uid
 */
Alcolytics.prototype.setInitialUid = function (uid) {

  this.initialUid = uid;
  // this.handle(EVENT_INITIAL_UID, {uid})

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


export default Alcolytics;
