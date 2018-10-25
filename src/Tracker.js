import Promise from 'promise-polyfill';
import objectAssign from './functions/objectAssing';
import createLogger from './functions/createLogger';
import LocalStorageAdapter from './LocalStorageAdapter';
import CookieStorageAdapter from './CookieStorageAdapter';
import {
  pageDefaults,
  isHttps
} from './data/pageDefaults';
import {
  hashCode
} from './functions/stringHash';
import autoDomain from './functions/autoDomain';
import browserData from './data/browserData';
import browserCharacts from './data/browserCharacts';
import performanceData from './data/performance';
import BrowserEventsTracker from './trackers/BrowserEventsTracker';
import ActivityTracker from './trackers/ActivityTracker';
import SessionTracker from './trackers/SessionTracker';
import ClickTracker from './trackers/ClickTracker';
import FormTracker from './trackers/FormTracker';
import GoogleAnalytics from './syncs/GoogleAnalytics';
import YandexMetrika from './syncs/YandexMetrika';
import { PixelSync } from './syncs/PixelSync';
import {
  isObject
} from './functions/type';
import msgCropper from './functions/msgCropper';
import SelfishPerson from './SelfishPerson';
import {
  Transport
} from './Transport';
import Emitter from 'component-emitter';
import each from './functions/each';
import {
  EVENT_PAGEVIEW,
  EVENT_IDENTIFY,
  EVENT_PAGE_UNLOAD,
  READY,
  EVENT,
  DOM_BEFORE_UNLOAD,
  EVENTS_ADD_PERF,
  EVENTS_NO_SCROLL,
  INTERNAL_EVENT,
  SERVER_MESSAGE,
  SERVICE_TRACK,
  EVENT_OPTION_REQUEST,
} from './Constants';
import {
  win
} from './Browser';
import { packSemVer } from './functions/packSemVer';


const LIBRARY = 'web-sdk';
const LIBVER = packSemVer('3.16.0');

const noop = () => { };
const boolOrOptions = (options) => {
  return isObject(options) ? options : {};
}
const log = createLogger('RST');

/**
 * Main Tracker class
 * @constructor
 * @property {Transport} transport class used for communicate with server
 */
function Tracker() {

  log('starting RST Tracker');

  const pd = pageDefaults();
  const domain = autoDomain(pd.domain);


  this.initialized = false;
  this.configured = false;
  this.valuableFields = undefined;
  this.queue = [];

  this.options = {
    projectId: hashCode(domain),
    sessionTimeout: 1800, // 30 min
    lastCampaignExpires: 7776000, // 3 month
    initialUid: 0,
    cookieDomain: domain,
    cookiePath: '/',
    // prefix for cookie stored at target website
    cookiePrefix: 'rst-',
    loctorPrefix: 'rst:',
    pathPrefix: '',
    urlMark: 'band',
    trackActivity: true,
    trackClicks: {
      allClicks: false
    },
    trackForms: true,
    allowHTTP: false,
    allowSendBeacon: true,
    allowXHR: true,
    activateWs: false,
    pixelSyncEnabled: false,
    pixelSync: {},
    msgCropper: (msg) => msgCropper(msg, this.valuableFields)
  };

  this.syncs = [];
  this.trackers = [];
  this.transport = null;
}

Emitter(Tracker.prototype);

/**
 * Handle events from queue and start accepting events
 */
Tracker.prototype.initialize = function () {

  // Check is initialized
  if (this.initialized) {
    return;
  }

  // Check is HTTPS
  if (!isHttps() && !this.options.allowHTTP) {
    return log.warn('Works only on https');
  }

  log('Initializing...');

  // Check is configured
  if (!this.configured) {
    log.warn('Initializing before configuration yet complete');
  }

  // Constructing storage adapters (should be before any other actions)
  this.localStorage = new LocalStorageAdapter({
    prefix: this.options.loctorPrefix
  });
  this.cookieStorage = new CookieStorageAdapter({
    cookieDomain: this.options.cookieDomain,
    cookiePrefix: this.options.cookiePrefix,
    cookiePath: this.options.cookiePath,
    allowHTTP: this.options.allowHTTP
  });

  // Getting and applying personal configuration
  this.selfish = new SelfishPerson(this, this.options);
  this.configure(this.selfish.getConfig());

  log(this.options);

  // Handling browser events
  this.browserEventsTracker = new BrowserEventsTracker();
  this.browserEventsTracker.initialize();

  // Session tracker
  this.sessionTracker = new SessionTracker(this, this.options)
    .initialize(this)
    .handleUid(this.options.initialUid);

  // Interract with server
  this.transport = new Transport(this.options)
    .setCreds(this.sessionTracker.creds())
    .connect();

  // Main tracker
  this.trackers.push(
    this.browserEventsTracker,
    this.sessionTracker
  );

  // Other tracker
  if (this.options.trackActivity) {
    this.activityTracker = new ActivityTracker(boolOrOptions(this.options.trackActivity));
    this.trackers.push(this.activityTracker);
  }

  if (this.options.trackClicks) {
    this.clickTracker = new ClickTracker(boolOrOptions(this.options.trackClicks));
    this.trackers.push(this.clickTracker);
  }

  if (this.options.trackForms) {
    this.formTracker = new FormTracker(boolOrOptions(this.options.trackForms));
    this.trackers.push(this.formTracker);
  }

  // Integrations
  this.syncs.push(
    new GoogleAnalytics(),
    new YandexMetrika()
  );
  if (this.options.pixelSyncEnabled) {
    this.syncs.push(new PixelSync());
  }

  // Receiving events from trackers and syncs
  const plugins = [this.transport].concat(this.trackers, this.syncs);

  each(plugins, (plugin) => {
    plugin.on(EVENT, ({
      name,
      data,
      options
    }) => {
      this.handle(name, data, options);
    });

    plugin.on(INTERNAL_EVENT, (name, data) => {
      log(`on-in:${name}`);
      this.emit(name, data);
    });
  });

  // Fire ready
  this.emit(READY);
  this.on(DOM_BEFORE_UNLOAD, this.unload);

  this.initialized = true;

  // Handling queue
  this.queue.map(e => {
    this.handle.apply(this, e);
  });
  this.queue = [];
};

Tracker.prototype.isInitialized = function () {
  return this.initialized;
};

/**
 * Applying configuration block. Can be called multiple times
 * @param {Object} options
 */
Tracker.prototype.configure = function (options) {
  if (this.initialized) {
    return log.warn('Configuration cant be applied because already initialized');
  }
  this.configured = true;
  this.options = objectAssign(this.options, options);
};

/**
 * Handling event
 * @param {string} name
 * @param {Object|undefined} data
 * @param {Object} options - Event properties
 */
Tracker.prototype.handle = function (name, data = {}, options = {}) {

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

  // Schema used for minify data at thin channels
  this.valuableFields = this.valuableFields || {
    name: true,
    data: true,
    projectId: true,
    uid: true,
    user: true,
    error: true,
    browser: ['ts', 'tzOffset'],
    sess: ['eventNum', 'pageNum', 'num'],
  };

  // Typical message to server. Can be cropped using {msgCropSchema}
  const msg = {
    service: SERVICE_TRACK,
    name: name,
    data: data,
    projectId: this.options.projectId,
    uid: this.sessionTracker.getUid(),
    user: this.sessionTracker.userData(),
    page: pageDefaults({
      short: true
    }),
    sess: this.sessionTracker.sessionData(),
    char: browserCharacts,
    browser: browserData(),
    lib: {
      id: LIBRARY,
      v: LIBVER,
      sv: this.options.snippet
    }
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
Tracker.prototype.logOnServer = function (level, args) {
  if (this.isInitialized()) {
    this.sendToServer({
      service: SERVICE_TRACK,
      name: 'log',
      lvl: level,
      args: args
    });
  }
};

/**
 *
 * @param {Object} msg message
 * @param {Object} options Object contains options
 */
Tracker.prototype.sendToServer = function (msg, options) {
  return this.transport.send(msg, options);
};

Tracker.prototype.unload = function () {
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
Tracker.prototype.event = function (name, data, options) {
  this.handle(name, data, options);
};

/**
 * 
 * @param {string} service backend service name
 * @param {string} name event name
 * @param {object} data that will be passed to backend service
 * @returns {Promise<any>} result received from server
 */
Tracker.prototype.request = function (service, name, data = {}) {
  if (!isObject(data)) {
    throw new Error('"data" shold be an object');
  }
  return this.sendToServer(
    { service, name, data },
    { [EVENT_OPTION_REQUEST]: true }
  );
}

/**
 * Track page load
 */
Tracker.prototype.page = function (data, options) {
  this.handle(EVENT_PAGEVIEW, data, options);
};


/**
 * Show warn log record. For testing purposes
 */
Tracker.prototype.warn = function (msg) {
  log.warn(new Error(msg));
};

/**
 * Show warn log record. For testing purposes
 */
Tracker.prototype.enableLogger = function () {
  win._rst_logger = true;
};

/**
 * Adding user details
 */
Tracker.prototype.identify = function (userId, userTraits) {
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
Tracker.prototype.onReady = function (cb) {
  return this.isInitialized() ?
    (cb || noop)() :
    this.on(READY, cb);
};

/**
 * Add external event callback
 * @param cb
 */
Tracker.prototype.onEvent = function (cb) {
  this.on(EVENT, cb);
};

/**
 * Add external event callback
 * @param cb
 */
Tracker.prototype.onServerMessage = function (cb) {
  this.on(SERVER_MESSAGE, cb);
};

/**
 * Returns Tracker uid
 * @return {String}
 */
Tracker.prototype.getUid = function () {
  return this.sessionTracker.getUid();
};


/**
 * Implicit session restart
 */
Tracker.prototype.sessionEvent = function () {
  this.sessionTracker.fireSessionEvent();
};

/**
 * Save personal config overrides
 * @param {Object} config
 */
Tracker.prototype.setCustomConfig = function (config) {
  this.selfish.saveConfig(config);
};

export default Tracker;
