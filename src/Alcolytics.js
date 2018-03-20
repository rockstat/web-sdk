import objectAssign from './functions/objectAssing';
import createLogger from './functions/createLogger';
import LocalStorageAdapter from './LocalStorageAdapter';
import CookieStorageAdapter from './CookieStorageAdapter';
import pageDefaults from './data/pageDefaults';
import browserData from './data/browserData';
import clientData from './data/clientData';
import clientFeatures from './data/clientFeatures';
import performanceData from './data/performance';
import BrowserEventsTracker from './trackers/BrowserEventsTracker';
import ActivityTracker from './trackers/ActivityTracker';
import SessionTracker from './trackers/SessionTracker';
import ClickTracker from './trackers/ClickTracker';
import FormTracker from './trackers/FormTracker';
import GoogleAnalytics from './integrations/GoogleAnalytics';
import YandexMetrika from './integrations/YandexMetrika';
import {isObject} from './functions/type';
import msgCropper from './functions/msgCropper';
import SelfishPerson from './SelfishPerson';
import Transport from './Transport';
import Emitter from 'component-emitter';
import each from './functions/each';

import {
  EVENT_PAGEVIEW,
  EVENT_IDENTIFY,
  EVENT_PAGE_LOADED,
  EVENT_PAGE_UNLOAD,
  EVENT_OPTION_MEAN,
  READY,
  EVENT,
  CB_DOM_EVENT,
  DOM_COMPLETE,
  DOM_BEFORE_UNLOAD,
  EVENTS_ADD_PERF,
  EVENTS_ADD_SCROLL,
  EVENTS_NO_SCROLL,
  INTERNAL_EVENT,
} from './Variables';
import {win} from './Browser';

const noop = () => {
};
const log = createLogger('Alcolytics');

// Schema used for minify data at thin channels
const msgCropSchema = {
  name: true,
  data: true,
  projectId: true,
  uid: true,
  error: true,
  client: ['ts', 'tzOffset'],
  session: ['eventNum', 'pageNum', 'num'],
  // error fields
  args: true,
  lvl: true
};

/**
 * Main Alcolytics class
 * @constructor
 */
function Alcolytics() {

  log('starting Alcolytics');

  this.initialized = false;
  this.configured_flag = false;
  this.queue = [];
  this.options = {
    projectId: 1,
    sessionTimeout: 1800, // 30 min
    lastCampaignExpires: 7776000, // 3 month
    library: 'alco.js',
    libver: 213,
    initialUid: 0,
    cookieDomain: 'auto',
    trackActivity: true,
    trackClicks: true,
    trackForms: true,
    allowHTTP: false,
    allowSendBeacon: true,
    allowXHR: true,
    activateWs: false,
    msgCropper: (msg) => msgCropper(msg, msgCropSchema)
  };

  this.integrations = [];
  this.trackers = [];

  this.on(DOM_BEFORE_UNLOAD, this.unload);

}

Emitter(Alcolytics.prototype);

/**
 * Handle events from queue and start accepting events
 */
Alcolytics.prototype.initialize = function () {

  // Check is HTTPS
  const page = pageDefaults();

  if (page.proto !== 'https' && !this.options.allowHTTP) {
    return log.warn('Works only on https');
  }
  // Check is initialized
  if (this.initialized) {
    return;
  }

  // Constructing storage methods (should be before any other actions)
  this.localStorage = new LocalStorageAdapter(this.options);
  this.cookieStorage = new CookieStorageAdapter({
    cookieDomain: this.options.cookieDomain,
    allowHTTP: this.options.allowHTTP
  });

  // Getting and applying personal configuration
  this.selfish = new SelfishPerson(this, this.options);
  this.configure(this.selfish.getConfig());

  log('Initializing');

  this.initialized = true;

  // Check is configured
  if (!this.configured_flag) {
    log.warn('Initializing before configuration was complete');
  }


  // Library data
  this.libInfo = {
    name: this.options.library,
    libver: this.options.libver,
    snippet: this.options.snippet
  };

  // Transport to server
  this.transport = new Transport(this.options);

  // Handling browser events
  this.browserEventsTracker = new BrowserEventsTracker();
  this.browserEventsTracker.initialize();

  // Session tracker
  this.sessionTracker = new SessionTracker(this, this.options)
    .subscribe(this)
    .handleUid(this.options.initialUid);

  // Main tracker
  this.trackers.push(
    this.browserEventsTracker,
    this.sessionTracker
  );

  // Other tracker
  if (this.options.trackActivity) {
    this.activityTracker = new ActivityTracker();
    this.trackers.push(this.activityTracker);
  }

  if (this.options.trackClicks) {
    this.clickTracker = new ClickTracker();
    this.trackers.push(this.clickTracker);
  }

  if (this.options.trackForms) {
    this.formTracker = new FormTracker();
    this.trackers.push(this.formTracker);
  }

  // Integrations
  this.integrations.push(
    new GoogleAnalytics(),
    new YandexMetrika()
  );

  // Receiving events from trackers and plugins
  const plugins = [].concat(this.trackers, this.integrations);

  each(plugins, (plugin) => {

    plugin.on(EVENT, ({name, data, options}) => {
      this.handle(name, data, options);
    });

    plugin.on(INTERNAL_EVENT, (name, data) => {
      this.emit(name, data);
    });

  });

  // Fire ready
  this.emit(READY);

  // Handling queue
  this.queue.map(e => {
    this.handle.apply(this, e);
  });
  this.queue = [];

};


Alcolytics.prototype.isInitialized = function () {

  return this.initialized;

};

/**
 * Applying configuration block. Can be called multiple times
 * @param {Object} options
 */
Alcolytics.prototype.configure = function (options) {

  if (this.initialized) {
    return log.warn('Configuration cant be applied because already initialized');
  }
  this.configured_flag = true;
  this.options = objectAssign(this.options, options);

};

/**
 * Handling event
 * @param {string} name
 * @param {Object|undefined} data
 * @param {Object} options - Event properties
 */
Alcolytics.prototype.handle = function (name, data = {}, options = {}) {

  if (!this.initialized) {
    return this.queue.push([name, data]);
  }

  log(`Handling ${name}`);

  this.emit(EVENT, name, data, options);

  // Special handlers
  if (name === EVENT_IDENTIFY) {
    return this.sessionTracker.setUserData(data);
  }

  this.sessionTracker.handleEvent(name, data, pageDefaults());

  // Typical message to server. Can be cropped using {msgCropSchema}
  const msg = {
    name: name,
    data: data,
    projectId: this.options.projectId,
    uid: this.sessionTracker.getUid(),
    user: this.sessionTracker.userData(),
    page: pageDefaults({short: true}),
    session: this.sessionTracker.sessionData(),
    lib: this.libInfo,
    client: clientData(),
    cf: clientFeatures,
    browser: browserData()
  };


  if (EVENTS_ADD_PERF.indexOf(name) >= 0) {
    msg.perf = performanceData();
  }

  if (this.activityTracker && EVENTS_NO_SCROLL.indexOf(name) < 0) {
    msg.scroll = this.activityTracker.getPositionData();
  }

  // Sending to server
  this.sendToServer(msg, options);
};


/**
 * Log remote: send to server log
 * @param {string} level
 * @param {Array} args
 */
Alcolytics.prototype.logOnServer = function (level, args) {
  if (this.isInitialized()){
    this.sendToServer(
      {name: 'log', lvl: level, args: args},
      {[EVENT_OPTION_MEAN]: true}
    );
  }

};

/**
 *
 * @param msg {Object}
 * @param options {Object}
 */
Alcolytics.prototype.sendToServer = function (msg, options) {
  const query = [
    'uid=' + this.sessionTracker.getUid()
  ];
  this.transport.send(query.join('&'), msg, options);
};


Alcolytics.prototype.unload = function () {

  log('Unloading...');
  this.event(EVENT_PAGE_UNLOAD);

  each(this.trackers, (tracker) => {
    tracker.unload();
  });

};

/**
 * Tracking event
 * @param name
 * @param data
 * @param options
 */
Alcolytics.prototype.event = function (name, data, options) {

  this.handle(name, data, options);

};

/**
 * Track page load
 */
Alcolytics.prototype.page = function (data, options) {

  this.handle(EVENT_PAGEVIEW, data, options);

};


/**
 * Show warn log record. For testing purposes
 */
Alcolytics.prototype.warn = function (msg) {

  log.warn(new Error(msg));

};

/**
 * Show warn log record. For testing purposes
 */
Alcolytics.prototype.enableLogger = function () {

  win._alco_logger = true;

};

/**
 * Adding user details
 */
Alcolytics.prototype.identify = function (userId, userTraits) {

  if (isObject(userId)) {
    userTraits = userId;
    userId = undefined;
  }

  this.handle(EVENT_IDENTIFY, {
    userId,
    userTraits
  });

};

/**
 * Add external ready callback
 * @param cb
 */
Alcolytics.prototype.onReady = function (cb) {

  return this.isInitialized()
    ? (cb || noop)()
    : this.on(READY, cb);


};

/**
 * Add external event callback
 * @param cb
 */
Alcolytics.prototype.onEvent = function (cb) {

  this.on(EVENT, cb);

};

/**
 * Returns Alcolytics uid
 * @return {String}
 */
Alcolytics.prototype.getUid = function () {

  return this.sessionTracker.getUid();

};

/**
 * Save personal config overrides
 * @param {Object} config
 */
Alcolytics.prototype.setCustomConfig = function (config) {

  this.selfish.saveConfig(config);

};


export default Alcolytics;
