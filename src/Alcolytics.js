import objectAssign from './functions/objectAssing';
import createLogger from './functions/createLogger';
import LocalStorageAdapter from './LocalStorageAdapter';
import CookieStorageAdapter from './CookieStorageAdapter';
import pageDefaults from './functions/pageDefaults';
import browserData from './functions/browserData';
import clientData from './functions/clientData';
import performanceData from './data/performance';
import BrowserEventsTracker from './trackers/BrowserEventsTracker';
import ActivityTracker from './trackers/ActivityTracker';
import SessionTracker from './trackers/SessionTracker';
import ClickTracker from './trackers/ClickTracker';
import FormTracker from './trackers/FormTracker';
import GoogleAnalytics from './integrations/GoogleAnalytics';
import YandexMetrika from './integrations/YandexMetrika';
import {isObject} from './functions/type';
import Transport from './Transport';
import Emitter from 'component-emitter';
import each from './functions/each';
import {
  EVENT_PAGEVIEW,
  EVENT_IDENTIFY,
  EVENT_PAGE_LOADED,
  READY,
  EVENT,
  CB_DOM_EVENT,
  DOM_COMPLETE,
  DOM_BEFORE_UNLOAD,
  EVENTS_ADD_PERF,
  EVENTS_ADD_SCROLL,
  INTERNAL_EVENT,
} from "./Variables";

const log = createLogger('Alcolytics');

function Alcolytics() {

  log('starting Alcolytics');

  this.initialized = false;
  this.configured = false;
  this.queue = [];
  this.options = {
    sessionTimeout: 1800, // 30 min
    lastCampaignExpires: 7776000, // 3 month
    library: 'alco.js',
    libver: 102,
    projectId: 1,
    initialUid: 0,
    cookieDomain: 'auto'
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

  if (page.proto !== 'https') {
    return log.warn('Works only on https');
  }

  // Check is initialized
  if (this.initialized) return;
  this.initialized = true;

  log('Initializing');

  // Check is configured
  if (!this.configured) {
    log.warn('Initializing before configuration complete');
  }

  // Library data
  this.libInfo = {
    name: this.options.library,
    libver: this.options.libver,
    snippet: this.options.snippet,
  };

  // Transport to server
  this.transport = new Transport(this.options);

  // Constructing storage methods
  this.localStorage = new LocalStorageAdapter(this.options);
  this.cookieStorage = new CookieStorageAdapter(this.options);

  // Handling browser events
  this.browserEventsTracker = new BrowserEventsTracker();
  this.browserEventsTracker.initialize();

  // Session tracker
  this.sessionTracker = new SessionTracker(this, this.options)
    .subscribe(this)
    .handleUid(this.options.initialUid);

  // Other tracker
  this.activityTracker = new ActivityTracker();
  this.clickTracker = new ClickTracker();
  this.formTracker = new FormTracker();

  this.trackers.push(
    this.browserEventsTracker,
    this.sessionTracker,
    this.activityTracker,
    this.clickTracker,
    this.formTracker
  );

  // Integrations
  this.integrations.push(
    new GoogleAnalytics(),
    new YandexMetrika()
  );

  // Receiving events from trackers and plugins
  const plugins = [].concat(this.trackers, this.integrations);

  each(plugins, (plugin) => {

    plugin.on(EVENT, ({name, data, options}) => {
      this.handle(name, data, options)
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
 * Handling event
 * @param name
 * @param data
 * @param options
 */
Alcolytics.prototype.handle = function (name, data = {}, options = {}) {

  if (!this.initialized) {
    return this.queue.push([name, data]);
  }

  this.emit(EVENT, name, data, options);

  // Special handlers
  if (name === EVENT_IDENTIFY) {
    return this.sessionTracker.setUserData(data);
  }

  if (name === EVENT_IDENTIFY) {
    return this.sessionTracker.setUserData(data);
  }

  const page = pageDefaults();
  this.sessionTracker.handleEvent(name, data, page);

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
    browser: browserData(),
    perf: EVENTS_ADD_PERF.indexOf(name) >= 0 ? performanceData() : undefined,
    scroll: EVENTS_ADD_SCROLL.indexOf(name) >= 0 ? this.activityTracker.getPositionData() : undefined
  };

  // Sending to server
  const query = [
    'uid=' + this.sessionTracker.getUid()
  ];
  const url = this.options.server + '/track?' + query.join('&');
  this.transport.send(url, msg, options);

};

Alcolytics.prototype.unload = function () {

  log('Unloading...');

  each(this.trackers, (tracker) => {
    tracker.unload();
  });

};

/**
 *
 * @return {LocalStorageAdapter}
 */
Alcolytics.prototype.getStorage = function () {

  return this.localStorage;

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
 * Adding user details
 */
Alcolytics.prototype.identify = function (userId, userTraits) {

  if (isObject(userId)) {
    userTraits = userId;
    userId = undefined;
  }

  this.handle(EVENT_IDENTIFY, {userId, userTraits})

};

/**
 * Add external ready callback
 * @param cb
 */
Alcolytics.prototype.onReady = function (cb) {

  this.on(READY, cb)

};

/**
 * Add external event callback
 * @param cb
 */
Alcolytics.prototype.onEvent = function (cb) {

  this.on(EVENT, cb)

};

/**
 * Returns Alcolytics uid
 * @return {String}
 */
Alcolytics.prototype.getUid = function () {

  return this.sessionTracker.getUid();

};


export default Alcolytics;
