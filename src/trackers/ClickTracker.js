import objectAssing from '../functions/objectAssing';
// import runOnStop from '../functions/runOnStop';
// import objectKeys from '../functions/objectKeys';
// import each from '../functions/each';
import { win, doc } from "../Browser";
import { closest } from '../lib/dom-utils';
import Emitter from 'component-emitter';
import {
  EVENT,
  EVENT_OPTION_OUTBOUND,
  EVENT_OPTION_TERMINATOR,
  EVENT_LINK_CLICK,
  EVENT_ELEMENT_CLICK
} from '../Constants';

const linkTag = 'a';
const nn = (val) => val || '';

/**
 *
 * @param options
 * @constructor
 */
const ClickTracker = function (options) {

  this.options = objectAssing({}, options);
  this.initialized = false;
  this.eventHandler = this.eventHandler.bind(this);
  this.initialize();
};
Emitter(ClickTracker.prototype);

ClickTracker.prototype.eventHandler = function (e) {

  const target = e.target || e.srcElement;
  const link = closest(target, linkTag, true);

  if (this.options.allClicks || !!link) {

    const draft = {
      name: EVENT_ELEMENT_CLICK,
      // target, link params
      data: {
        target: this.getTargetInfo(target)
      },
      options: {} // holder for link options
    }

    const event = !!link ? this.mutateToLinkClick(draft, link) : draft;
    this.emit(EVENT, event);
  }
};

ClickTracker.prototype.mutateToLinkClick = function (draft, link) {

  const loc = win.location;
  const outbound = link.hostname !== loc.hostname || link.port !== loc.port || link.protocol !== loc.protocol;

  const linkData = {
    href: link.href,
    text: link.innerText,
    outbound: outbound
  }
  const linkOptions = {
    // [EVENT_OPTION_TERMINATOR]: true,
    [EVENT_OPTION_OUTBOUND]: outbound
  }

  return objectAssing({}, draft, {
    name: EVENT_LINK_CLICK,
    data: objectAssing({}, draft.data, linkData),
    options: objectAssing({}, draft.options, linkOptions)
  });
}

ClickTracker.prototype.getTargetInfo = function (target) {

  if (!target) {
    return {};
  }
  return {
    tag: nn(target.tagName && target.tagName.toLowerCase()),
    type: nn(target.getAttribute('type')),
    name: nn(target.getAttribute('name')),
    ph: nn(target.getAttribute('placeholder')),
    cls: nn(target.className),
    id: nn(target.id),
    href: nn(target.href),
    text: nn(target.innerText)
  };
}


ClickTracker.prototype.initialize = function () {

  if (!win.addEventListener) return;
  doc.addEventListener('click', this.eventHandler, true);
  this.initialized = true;
};

ClickTracker.prototype.unload = function () {
  doc.removeEventListener('click', this.eventHandler, true);
};

export default ClickTracker;
