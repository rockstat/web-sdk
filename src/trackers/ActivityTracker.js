import objectAssing from '../functions/objectAssing';
import runOnStop from '../functions/runOnStop';
import objectKeys from '../functions/objectKeys';
import each from '../functions/each';
import Emitter from 'component-emitter';

const win = window;
const doc = document;

const activityEvents = [
  'touchmove', 'touchstart', 'touchleave', 'touchenter', 'touchend', 'touchcancel',
  'click', 'mouseup', 'mousedown', 'mousemove', 'mousewheel', 'mousewheel', 'wheel',
  'scroll', 'keypress', 'keydown', 'keyup', 'resize', 'focus', 'blur'
];

/**
 * Returns document height
 * @return {number}
 */
const getPageHeight = function () {

  const html = doc.documentElement;
  const body = doc.body;
  return Math.max(html.offsetHeight, html.scrollHeight, body.offsetHeight, body.scrollHeight);

};


/**
 *
 * @param options
 * @constructor
 */
const ActivityTracker = function (options) {

  this.options = objectAssing({}, this.defaults, options);
  this.iteration = 0;
  this.active = 0;
  this.counter = {};

  this.maxScroll = 0;
  this.maxScreen = 0;

  this.activityTrackingDelay = setTimeout(
    () => this.initialize(),
    this.options.delay * 1000
  );

  this.scrollHandler = runOnStop(
    (e) => this.doHandleScroll(e),
    500
  );

};


ActivityTracker.prototype.defaults = {
  namePrefix: '',
  delay: 2,
  interval: 5
};

Emitter(ActivityTracker.prototype);


ActivityTracker.prototype.doHandleScroll = function (e) {

  const scrollPos = win.pageYOffset;
  const windowHeight = win.innerHeight;
  const pageHeight = getPageHeight();
  const currentScroll = Math.min(
    100,
    Math.max(
      0,
      100 * (scrollPos / (pageHeight - windowHeight))
    )
  );

  this.maxScroll = currentScroll > this.maxScroll
    ? currentScroll
    : this.maxScroll;

  const currentScreen = Math.ceil(pageHeight / windowHeight / 100 * currentScroll + 0.1);

  this.maxScreen = currentScreen > this.maxScreen
    ? currentScreen
    : this.maxScreen;

  const event = {
    name: this.options.namePrefix + 'Scroll',
    data: {
      ph: pageHeight,
      wh: windowHeight,
      csn: currentScreen,
      msn: this.maxScreen,
      csl: Math.round(currentScroll),
      msl: Math.round(this.maxScroll)
    }
  };
  this.emit('event', event);

};


ActivityTracker.prototype.eventHandler = function (e) {

  const type = e.type;


  if (type === 'scroll') {
    this.scrollHandler();
  }

  this.counter[type] = (this.counter[type] || 0) + 1;

};


ActivityTracker.prototype.fireEvent = function () {

  this.iteration++;

  if (objectKeys(this.counter).length > 0) {
    const event = {
      name: this.options.namePrefix + 'Activity',
      data: {
        iteration: this.iteration,
        active: ++this.active
      }
    };

    objectAssing(event.data, this.counter);
    this.emit('event', event);

    this.counter = {};
  }

};


ActivityTracker.prototype.initialize = function () {

  if(!win.addEventListener) return;

  each(activityEvents, (event) => {

    win.addEventListener(event, (e) => this.eventHandler(e), true);

  });

  this.activityFireInterval = setInterval(
    () => this.fireEvent(),
    this.options.interval * 1000
  )

};


ActivityTracker.prototype.unload = function () {

  each(activityEvents, (event) => {

    win.removeEventListener(event, (e) => this.eventHandler(e));

  });

  clearInterval(this.activityFireInterval);
  clearTimeout(this.activityTrackingDelay);

};

export default ActivityTracker;
