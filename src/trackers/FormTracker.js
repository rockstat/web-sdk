import Emitter from 'component-emitter';
import objectAssing from '../functions/objectAssing';
import each from '../functions/each';
import {
  win,
  doc
} from '../Browser';
import createLogger from '../functions/createLogger';
import {
  EVENT,
  EVENT_OPTION_OUTBOUND,
  EVENT_OPTION_TERMINATOR
} from '../Constants';
import {
  useCaptureSupport,
  removeHandler,
  addHandler
} from '../functions/domEvents';
import { closest } from '../lib/dom-utils';


const log = createLogger('RST/FormTracker');

const formTag = 'form';
const elementsTags = ['input', 'checkbox', 'radio', 'textarea', 'select']; // ?option ?button ?submit

const formEvents = ['submit'];
const elementEvents = ['focus', 'blur', 'change', 'invalid'];

const nn = (val) => val || '';



/**
 * Process event type
 * @param  {string} event event type
 * @return {object}
 */
function prepareType(event) {
  return {
    event: nn(event)
  };
}


/**
 *
 * @param element {Element}
 * @return {object}
 */
function extractFormData(element) {
  if (!element) {
    return {
      ferr: 'Form element absent'
    };
  }

  return {
    fmthd: nn(element.getAttribute('method')),
    fact: nn(element.getAttribute('action')),
    fname: nn(element.getAttribute('name')),
    fcls: nn(element.className),
    fid: nn(element.id)
  };
}

/**
 *
 * @param element {Element}
 * @return {object}
 */
function extractElementData(element) {
  if (!element) {
    return {
      eerr: 'Input element absent'
    };
  }
  return {
    etag: nn(element.tagName && element.tagName.toLowerCase()),
    etype: nn(element.getAttribute('type')),
    ename: nn(element.getAttribute('name')),
    eph: nn(element.getAttribute('placeholder')),
    ecl: nn(element.className),
    eid: nn(element.id)
  };
}

/**
 *
 * @param options {object}
 * @constructor
 */
const FormTracker = function (options) {

  this.options = objectAssing({}, options);
  this.initialized = false;

  this.formEventHandler = this.formEventHandler.bind(this);
  this.elementEventHandler = this.elementEventHandler.bind(this);

  this.initialize();

};

Emitter(FormTracker.prototype);

FormTracker.prototype.initialize = function () {

  if (!useCaptureSupport) {
    return log.warn('addEventListener not supported');
  }

  each(formEvents, (event) => {
    addHandler(doc, event, this.formEventHandler, true);
  });

  each(elementEvents, (event) => {
    addHandler(doc, event, this.elementEventHandler, true);
  });

  this.initialized = true;
};

/**
 * Handler for form element events
 * @param ev {Event} Dom event
 */
FormTracker.prototype.formEventHandler = function (ev) {

  const target = ev.target || ev.srcElement;
  const type = ev.type;

  const form = closest(target, formTag, true);

  if (form) {
    const event = {
      name: `form_${type}`,
      data: {
        ...prepareType(type),
        ...extractFormData(form)
      },
      options: {
        [EVENT_OPTION_TERMINATOR]: (type === 'submit')
      }
    };

    this.emit(EVENT, event);
  }
};

/**
 * Handler for form inputs events
 * @param ev {Event} Dom event
 */
FormTracker.prototype.elementEventHandler = function (ev) {
  const {
    type,
    target
  } = ev;

  if (!target) {
    return;
  }
  const element = closest(target, elementsTags.join(','), true);
  const form = element && closest(element, formTag);

  if (element) {
    const event = {
      name: `field_${type}`,
      data: {
        ...prepareType(type),
        ...extractElementData(element),
        ...extractFormData(form)
      }
    };
    this.emit(EVENT, event);
  }
};

/**
 * Unload handler
 */
FormTracker.prototype.unload = function () {

  if (!this.initialized) {
    return log('Not initialized');
  }

  each(formEvents, (event) => {
    removeHandler(doc, event, this.formEventHandler, true);
  });

  each(elementEvents, (event) => {
    removeHandler(doc, event, this.elementEventHandler, true);
  });
};


export default FormTracker;
