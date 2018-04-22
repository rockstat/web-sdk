import Emitter from 'component-emitter';
import {
  closest
} from 'dom-utils';
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
} from '../Variables';
import {
  useCaptureSupport,
  removeHandler,
  addHandler
} from '../functions/domEvents';

const log = createLogger('FormTracker');

const formTag = 'form';
const elementsTags = ['input', 'checkbox', 'radio', 'textarea', 'select']; // ?option ?button ?submit

const formEvents = ['submit'];
const elementEvents = ['focus', 'blur', 'change', 'invalid'];

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
    fmthd: element.getAttribute('method'),
    fact: element.getAttribute('action'),
    fname: element.getAttribute('name'),
    fcls: element.className,
    fid: element.id
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
    etag: element.tagName && element.tagName.toLocaleLowerCase(),
    etype: element.getAttribute('type'),
    ename: element.getAttribute('name'),
    eph: element.getAttribute('placeholder'),
    ecl: element.className,
    eid: element.id
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
      name: `Form ${type}`,
      data: {
        event: type,
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

  const target = ev.target || ev.srcElement;
  const type = ev.type;

  const element = closest(target, elementsTags.join(','), true);
  const form = element && closest(element, formTag);

  if (element) {
    const event = {
      name: `Field ${type}`,
      data: {
        event: type,
        ...extractElementData(element),
        ...extractFormData(form)
      }
    };
    this.emit(EVENT, event);
  }
};


export default FormTracker;
