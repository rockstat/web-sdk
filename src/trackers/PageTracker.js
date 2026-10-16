import objectAssing from '../functions/objectAssing';
import { win, doc } from "../Browser";
import Emitter from 'component-emitter';
import {
  EVENT,
  EVENT_PAGEVIEW
} from '../Constants';
import createLogger from '../functions/createLogger';

const log = createLogger('RST/PageTracker');

const nn = (val) => val || '';

/**
 *
 * @param options
 * @constructor
 */
const PageTracker = function (options) {

  this.options = objectAssing({}, options);
  this.initialized = false;
  this.eventHandler = this.eventHandler.bind(this);
  this.initialize();
};
Emitter(PageTracker.prototype);

PageTracker.prototype.eventHandler = function (e) {
  const event = {
    name: EVENT_PAGEVIEW,
  };
  this.emit(EVENT, event);
};



PageTracker.prototype.initialize = function () {
  // if (!win.addEventListener) return;
  // win.addEventListener('hashchange', this.eventHandler, true);
  this.initialized = true;
};

PageTracker.prototype.unload = function () {
  // if (!win.addEventListener) return;
  // win.removeEventListener('hashchange', this.eventHandler, true);
  this.initialized = false;
};

export default PageTracker;


// class Hist {
//   currentUrl: String = ''
//   constructor() {
//       this.currentUrl = document.location.href || ''
//   }

//   url: () => String = () => {
//       return this.currentUrl
//   }

//   public urlChangeHandler = (event) => {
//       console.log("MY_HANDLER: location: " + document.location + ", state: " + JSON.stringify(event.state));
//   }

// }

// const h = new Hist()

// function greeter(person) {
//   return "Hello, " + person + ' at ' + h.url();
// }

// let user = "Jane User";

// document.body.textContent = greeter(user);


// window.onpopstate = h.urlChangeHandler


// window.onpopstate = ev => 
