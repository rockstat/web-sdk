import objectAssign from './functions/objectAssing';
import createLogger from './functions/createLogger';
import objectKeys from './functions/objectKeys';
import pageSource from './pageSource';
import each from './functions/each';
import when from './functions/when';

import {
  EVENT_PAGEVIEW,
  EVENT_SESSION,
  SESSION_ORGANIC,
  SESSION_CAMPAIGN,
  SESSION_SOCIAL
} from "./Variables";

const keyLastEventTS = 'levent';
const keyLastCampaign = 'lcamp';
const keyLastSession = 'lsess';
const keyLastSessionTS = 'lsts';
const keySessionCounter = 'csess';
const keyPagesCounter = 'scpages';
const keyUid = 'uid';

const log = createLogger('ST');

function SessionTracker(storage, options) {

  this.eventCallbacks = [];
  this.storage = storage;
  this.options = options;
  this.lastSession = null;
  this.lastCampaign = null;
  this.initialUid = null;
  this.uid = null;
  this.ymClientId = this.storage.get('ymClientId');
  this.gaClientId = this.storage.get('gaClientId');

  // Getting Yandex Metrika ClientId
  when(() => window.Ya && window.Ya.Metrika, ()=> {
    try {
      this.ymClientId = Ya._metrika && Ya._metrika.counter && Ya._metrika.counter.getClientID();
      this.storage.set('ymClientId', this.ymClientId);
    } catch (e) {log.error(e)}
  }, 25, 2000);

  // Getting Google Analytics ClientId
  when(() => !!window.ga, ()=> {
    ga(() => {
      try {
        this.gaClientId = ga && ga.getAll && ga.getAll()[0] && ga.getAll()[0].get('clientId');
        this.storage.set('gaClientId', this.gaClientId);
      } catch (e) {log.error(e)}
    })
  }, 25, 40)

}


SessionTracker.prototype.fireSessionEvent = function () {

  const data = {

  };

  each(this.eventCallbacks, (cb) => {
    cb(EVENT_SESSION, data);
  });

};

SessionTracker.prototype.setInitialUid = function (uid) {

  this.initialUid = uid;

};

SessionTracker.prototype.shouldRestart = function (session, source) {

  // Override session if got organic or campaign
  const bySource = source.type === SESSION_ORGANIC || source.type === SESSION_CAMPAIGN || source.type === SESSION_SOCIAL;

  // Prevent restarting by refresh enter page
  const byRef = session.refHash !== source.refHash;
  return bySource && byRef;

};


SessionTracker.prototype.addEventCallback = function (cb) {

  this.eventCallbacks.push(cb);

};


SessionTracker.prototype.handleEvent = function (name, data) {

  if (name !== EVENT_PAGEVIEW) return;

  const source = pageSource(data);
  const lastEventTS = this.storage.get(keyLastEventTS);
  const lastSession = this.storage.get(keyLastSession);
  this.uid = this.storage.get(keyUid, {}, this.initialUid);

  // Saving uid
  this.storage.set(keyUid, this.uid);

  // Setting last event
  const now = (new Date()).getTime();
  this.storage.set(keyLastEventTS, now);

  // Starting new Session
  if (
    typeof lastEventTS === 'undefined'
    || (now - lastEventTS) > this.options.sessionTimeout * 1000
    || this.shouldRestart(lastSession, source)
  ) {

    source.num = this.storage.inc(keySessionCounter);
    source.start = now;

    // Cleaning old session vars
    this.storage.rmAll({session: true});

    // Updating counters
    this.storage.set(keyLastSessionTS, now, {session: true});
    this.storage.set(keyPagesCounter, 0, {session: true});

    // Saving last session
    this.storage.set(keyLastSession, source);
    this.lastSession = source;

    // Applying last campaign
    if (source.hasMarks) {
      this.storage.set(keyLastCampaign, source, {exp: 7776000});
    }

    this.fireSessionEvent();
  }

  // Increment page count
  if (name === EVENT_PAGEVIEW) {
    this.storage.inc(keyPagesCounter, {session: true});
  }

  // Updating state
  this.lastSession = this.storage.get(keyLastSession);
  this.lastCampaign = this.storage.get(keyLastCampaign);

};


export default SessionTracker;
