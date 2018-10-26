import objectAssing from '../functions/objectAssing';
import runOnStop from '../functions/runOnStop';
import objectKeys from '../functions/objectKeys';
import each from '../functions/each';
import Emitter from 'component-emitter';
import {
  win,
  doc,
  html,
  body
} from "../Browser";
import {
  useCaptureSupport,
  removeHandler,
  addHandler
} from "../functions/domEvents";
import {
  EVENT,
  EVENT_ACTIVITY,
  EVENT_SCROLL,
} from "../Constants";

const scrollEvent = 'scroll';
const activityEvents = [
  'touchmove', 'touchstart', 'touchleave', 'touchenter', 'touchend', 'touchcancel',
  'click', 'mouseup', 'mousedown', 'mousemove', 'mousewheel', 'mousewheel', 'wheel',
  'scroll', 'keypress', 'keydown', 'keyup', 'resize', 'focus', 'blur'
];

/**
 * Returns document height
 * @return {number}
 */
const getDocumentHeight = function () {

  return Math.max(html.offsetHeight, html.scrollHeight, body.offsetHeight, body.scrollHeight, body.clientHeight);

};

/**
 * Return current top offset
 * @return {number|*}
 */
const getTopOffset = function () {
  const value = win.pageYOffset || html.scrollTop;
  return value >= 0 ? Math.round(value) : value;
};


/**
 * Returns screen height
 * @return {number}
 */
const getClientHeight = function () {
  return win.innerHeight || html.clientHeight;
};

/**
 *
 * @param options
 * @constructor
 */
const ActivityTracker = function (options) {

  this.options = objectAssing({
    flushInterval: 5
  }, options);

  // Activity handling
  this.iteration = 0;
  this.active = 0;
  this.counter = {};

  // Scroll variables
  this.maxPageScroll = 0;
  this.scrollState = {};

  this.eventHandler = this.eventHandler.bind(this);
  this.scrollHandlerWrapper = runOnStop(
    (e) => this.fireScrollEvent(e),
    500
  );

  if (useCaptureSupport) {
    each(activityEvents, (event) => {
      addHandler(doc, event, this.eventHandler, true);
    });

    this.activityFlushInterval = setInterval(
      () => this.fireActivityEvent(),
      this.options.flushInterval * 1000
    )
  }
};

Emitter(ActivityTracker.prototype);

/**
 *
 * @param emitter
 * @return {ActivityTracker}
 */
ActivityTracker.prototype.subscribe = function (emitter) {

  return this;
};

/**
 * Main events handler
 * @param event
 */
ActivityTracker.prototype.eventHandler = function (event) {

  const type = event.type;

  if (type === scrollEvent) {
    this.scrollHandlerWrapper();
  }
  this.counter[type] = (this.counter[type] || 0) + 1;
};


ActivityTracker.prototype.fireScrollEvent = function (e) {

  this.handleScroll();
  const event = {
    name: EVENT_SCROLL
  };

  this.emit(EVENT, event);

};

ActivityTracker.prototype.handleScroll = function () {

  const clientHeight = getClientHeight();
  const topOffset = getTopOffset();
  const docHeight = getDocumentHeight();
  const hiddenHeight = docHeight - clientHeight;
  const currentScroll = Math.min(
    100,
    Math.max(
      0,
      100 * Math.round(hiddenHeight && (topOffset / hiddenHeight) || 0)
    )
  );

  this.maxPageScroll = currentScroll > this.maxPageScroll ?
    currentScroll :
    this.maxPageScroll;

  this.scrollState = {
    dh: docHeight,
    ch: clientHeight,
    to: topOffset,
    cs: currentScroll,
    ms: this.maxPageScroll
  };
};

ActivityTracker.prototype.getPositionData = function () {
  this.handleScroll();
  return this.scrollState;
};


ActivityTracker.prototype.getEnrichmentData = function () {
  this.handleScroll();
  return {
    scroll: this.scrollState
  };
};


/**
 * Emitting activity event
 */
ActivityTracker.prototype.fireActivityEvent = function () {

  this.iteration++;

  if (objectKeys(this.counter).length > 0) {
    const event = {
      name: EVENT_ACTIVITY,
      data: {
        interval: this.options.flushInterval,
        iteration: this.iteration,
        active: ++this.active
      }
    };
    objectAssing(event.data, this.counter);
    this.emit(EVENT, event);
    this.counter = {};
  }
};

/**
 * Clear state
 */
ActivityTracker.prototype.clear = function () {
  this.fireActivityEvent();
  // Activity handling
  this.iteration = 0;
  this.active = 0;
  this.counter = {};
  this.maxPageScroll = 0;
  this.scrollState = {};
};

/**
 * Unload handler
 */
ActivityTracker.prototype.unload = function () {
  this.fireActivityEvent();
  each(activityEvents, (event) => {
    removeHandler(doc, event, this.eventHandler);
  });
  clearInterval(this.activityFlushInterval);
};


export default ActivityTracker;
