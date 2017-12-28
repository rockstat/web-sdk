import addEventListener from '../functions/addEventListener';
import objectAssing from '../functions/objectAssing';
import objectKeys from '../functions/objectKeys';
import each from '../functions/each';
import Emitter from 'component-emitter';


const win = window;
const activityEvents = [
  'touchmove', 'touchstart', 'touchleave', 'touchenter', 'touchend', 'touchcancel',
  'click', 'mouseup', 'mousedown', 'mousemove', 'mousewheel', 'mousewheel', 'wheel',
  'scroll', 'keypress', 'keydown', 'keyup', 'resize', 'focus', 'blur'
];

const ActivityTracker = function (options) {

  this.options = objectAssing({}, this.defaults, options);
  this.iteration = 0;
  this.active = 0;
  this.counter = {};

  setTimeout(() => this.initialize(), this.options.delay * 1000);

};

ActivityTracker.prototype.defaults = {
  namePrefix: '',
  delay: 2,
  interval: 5
};

Emitter(ActivityTracker.prototype);

ActivityTracker.prototype.eventHandler = function (e) {

  const type = e.type;
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

  each(activityEvents, (event) => {

    addEventListener(win, event, (e) => this.eventHandler(e));

  });

  setInterval(() => this.fireEvent(), this.options.interval * 1000)

};

export default ActivityTracker;
