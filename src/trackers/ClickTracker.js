import objectAssing from '../functions/objectAssing';
import runOnStop from '../functions/runOnStop';
import objectKeys from '../functions/objectKeys';
import each from '../functions/each';
import {closest} from 'dom-utils';
import Emitter from 'component-emitter';
import {
  EVENT_OPTION_OUTBOUND,
  EVENT_OPTION_SCHEDULED
} from "../Variables";

const win = window;
const doc = document;
const linkTag = 'a';


/**
 *
 * @param options
 * @constructor
 */
const ClickTracker = function (options) {

  this.options = objectAssing({}, this.defaults, options);
  this.eventHandler = this.eventHandler.bind(this);
  this.initialize();

};

ClickTracker.prototype.defaults = {
  namePrefix: '',
};

Emitter(ClickTracker.prototype);


ClickTracker.prototype.eventHandler = function (e) {

  const target = e.target || e.srcElement;
  const link = closest(target, linkTag, true);

  if (link) {
    const loc = window.location;
    const outbound = link.hostname !== loc.hostname || link.port !== loc.port || link.protocol !== loc.protocol;
    const event = {
      name: this.options.namePrefix + 'Link click',
      data: {
        href: link.href,
        text: link.innerText,
        outbound: outbound
      },
      options: {
        [EVENT_OPTION_SCHEDULED]: true,
        [EVENT_OPTION_OUTBOUND]: outbound
      }
    };

    this.emit('event', event);
  }
};


ClickTracker.prototype.initialize = function () {

  if (!win.addEventListener) return;

  doc.addEventListener('click', this.eventHandler, true);

};


ClickTracker.prototype.unload = function () {

  doc.removeEventListener('click', this.eventHandler, true);

};

export default ClickTracker;
