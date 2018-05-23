import objectAssign from '../functions/objectAssing';
import createLogger from '../functions/createLogger';
import pageSource from '../functions/pageSource';
import isValidUid from '../functions/isValidUid';
import Emitter from 'component-emitter';

import {
  EVENT_PAGEVIEW,
  EVENT_SESSION,
  SESSION_ORGANIC,
  SESSION_CAMPAIGN,
  SESSION_SOCIAL,
  EVENT_USER_PARAMS,
  EVENT
} from '../Constants';

const KEY_LAST_EVENT_TS = 'levent';
const KEY_LAST_CAMPAIGN = 'lcamp';
const KEY_LAST_SESSION = 'lsess';
const KEY_LAST_SESSION_TS = 'lsts';
const KEY_SESSION_COUNTER = 'csess';
const KEY_PAGES_COUNTER = 'scpages';
const KEY_EVENTS_COUNTER = 'scevs';
const KEY_UID = 'uid';
const KEY_USER_ID = 'userid';
const KEY_USER_TRAITS = 'usertr';
const KEY_USER_PARAMS = 'userpr';

const log = createLogger('ST');

function SessionTracker(alco, options) {

  this.localStorage = alco.localStorage;
  this.cookieStorage = alco.cookieStorage;

  this.storage = this.localStorage;

  this.options = options;
  this.lastSession = null;
  this.initialUid = null;
  this.userId = undefined;
  this.userTraits = undefined;
  this.uid = null;
  this.userParams = this.getUserParams();
}

Emitter(SessionTracker.prototype);

SessionTracker.prototype.subscribe = function (emitter) {

  emitter.on(EVENT_USER_PARAMS, this.setUserParams.bind(this));
  return this;

};


SessionTracker.prototype.fireSessionEvent = function () {

  this.emit(EVENT, {
    name: EVENT_SESSION,
    data: {}
  });

};

SessionTracker.prototype.shouldRestart = function (session, source) {

  // Override session if got organic or campaign
  const bySource = source.type === SESSION_ORGANIC || source.type === SESSION_CAMPAIGN || source.type === SESSION_SOCIAL;

  // Prevent restarting by refresh enter page
  const byRef = session.refHash !== source.refHash;
  return bySource && byRef;

};


SessionTracker.prototype.getStoredUid = function () {

  const uid = this.cookieStorage.get(KEY_UID) || this.localStorage.get(KEY_UID);
  return isValidUid(uid) && uid;

};

SessionTracker.prototype.setStoredUid = function (uid) {

  this.storage.set(KEY_UID, uid);
  this.cookieStorage.set(KEY_UID, uid);

};

SessionTracker.prototype.handleUid = function (uid) {

  log(`Handling initial ${uid}`);
  this.initialUid = uid;
  this.uid = this.getStoredUid() || this.initialUid;
  // Saving uid
  this.setStoredUid(this.uid);
  return this;
};

/**
 * Get user credentials
 * @returns {Object} containing main user credentials
 */
SessionTracker.prototype.creds = function () {
  return {
    uid: this.uid
  }
}

SessionTracker.prototype.getUid = function () {

  return this.uid;

};

SessionTracker.prototype.getPageNum = function () {

  return this.storage.get(KEY_PAGES_COUNTER, {
    session: true
  });

};

/**
 * Get state of session events counter
 * @return {Number} current value
 */
SessionTracker.prototype.getEventNum = function () {

  return this.storage.get(KEY_EVENTS_COUNTER, {
    session: true
  });

};


SessionTracker.prototype.sessionData = function () {

  return objectAssign({
      pageNum: this.getPageNum(),
      eventNum: this.getEventNum()
    },
    this.lastSession, {
      refHash: undefined
    }
  );

};

SessionTracker.prototype.getUserParams = function () {

  const params = this.storage.get(KEY_USER_PARAMS) || {};

  // Removing old vars
  if (params.gaClientId) {
    params.gaClientId = undefined;
  }
  if (params.ymClientId) {
    params.ymClientId = undefined;
  }
  return params;
};

SessionTracker.prototype.setUserParams = function (params) {

  this.userParams = objectAssign(this.userParams, params);
  this.storage.set(KEY_USER_PARAMS, this.userParams);

};

/**
 *
 * @return {*}
 */
SessionTracker.prototype.userData = function () {

  const id = this.storage.get(KEY_USER_ID);
  const traits = this.storage.get(KEY_USER_TRAITS);
  const params = this.storage.get(KEY_USER_PARAMS);

  return objectAssign({},
    params, {
      id,
      traits
    }
  );
};

SessionTracker.prototype.setUserData = function (data) {

  if (data.userId) {
    this.storage.set(KEY_USER_ID, data.userId);
    this.userId = data.userId;
  }

  if (data.userTraits) {
    this.storage.set(KEY_USER_TRAITS, data.userTraits);
    this.userTraits = data.userTraits;
  }
};


SessionTracker.prototype.handleEvent = function (name, data, page) {

  // Skipping own events
  if (name === EVENT_SESSION) {
    return null;
  }

  const source = pageSource(page);
  const lastEventTS = this.storage.get(KEY_LAST_EVENT_TS);
  const lastSession = this.storage.get(KEY_LAST_SESSION);

  // Setting last event
  const now = (new Date()).getTime();
  this.storage.set(KEY_LAST_EVENT_TS, now);

  // Starting new session if needed
  let shouldRestart = lastEventTS === undefined ||
    (now - lastEventTS) > this.options.sessionTimeout * 1000 ||
    this.shouldRestart(lastSession, source);

  if (shouldRestart) {

    source.num = this.storage.inc(KEY_SESSION_COUNTER);
    source.start = now;

    // Cleaning old session vars
    this.storage.rmAll({
      session: true
    });

    // Updating counters
    this.storage.set(KEY_LAST_SESSION_TS, now, {
      session: true
    });
    this.storage.set(KEY_PAGES_COUNTER, 0, {
      session: true
    });
    this.storage.set(KEY_EVENTS_COUNTER, 0, {
      session: true
    });

    // Saving last session
    this.storage.set(KEY_LAST_SESSION, source);
    this.lastSession = source;

    // Applying last campaign
    if (source.type === SESSION_CAMPAIGN) {
      this.storage.set(KEY_LAST_CAMPAIGN, source, {
        exp: 7776000
      });
    }
  }

  // Increment counters
  (name === EVENT_PAGEVIEW) ?
  this.storage.inc(KEY_PAGES_COUNTER, {
    session: true
  }): this.storage.inc(KEY_EVENTS_COUNTER, {
    session: true
  });

  // Emitting session event
  if (shouldRestart) {
    this.fireSessionEvent();
  }

  // Updating state
  this.lastSession = this.storage.get(KEY_LAST_SESSION);
  this.lastCampaign = this.storage.get(KEY_LAST_CAMPAIGN);

};

SessionTracker.prototype.unload = function () {

};


export default SessionTracker;
