import objectAssing from '../functions/objectAssing';
import toArray from '../functions/toArray';
import each from '../functions/each';
import Emitter from 'component-emitter';
import {win, doc} from '../Browser';
import {closest} from 'dom-utils';
import createLogger from '../functions/createLogger';
import {
  EVENT,
  EVENT_OPTION_OUTBOUND,
  EVENT_OPTION_SCHEDULED
} from '../Variables';
import {
  useCaptureSupport,
  removeHandler,
  addHandler
} from '../functions/domEvents';
import ClickTracker from './ClickTracker';

const log = createLogger('FormTracker');

const formTag = 'form';
const elementsTags = ['input', 'checkbox', 'radio', 'textarea', 'select']; // ?option ?button ?submit

const formEvents = ['submit'];
const elementEvents = ['focus', 'blur', 'change', 'invalid'];

function extractFormData(form) {
  if (!form) {
    return {};
  }

  return {
    fmthd: form.getAttribute('method'),
    fact: form.getAttribute('action'),
    fname: form.getAttribute('name'),
    fcls: form.className,
    fid: form.id
  }
}

function extractElementData(element) {
  if (!element) {
    return {};
  }

  return {
    etag: element.tagName && element.tagName.toLocaleLowerCase(),
    etype: element.getAttribute('type'),
    ename: element.getAttribute('name'),
    eph: element.getAttribute('placeholder'),
    ecl: element.className,
    eid: element.id
  }
}


const FormTracker = function (options) {

  this.options = objectAssing({}, options);
  this.formEventHandler = this.formEventHandler.bind(this);
  this.elementEventHandler = this.elementEventHandler.bind(this);

  this.initialize();

};

Emitter(FormTracker.prototype);

FormTracker.prototype.initialize = function () {

  if (useCaptureSupport) {

    each(formEvents, (event) => {
      doc.addEventListener(event, this.formEventHandler, true);
    });

    each(elementEvents, (event) => {
      doc.addEventListener(event, this.elementEventHandler, true);
    });

  }

};


FormTracker.prototype.unload = function () {

  if (useCaptureSupport) {

    each(formEvents, (event) => {
      doc.removeEventListener(event, this.formEventHandler, true);
    });

    each(elementEvents, (event) => {
      doc.removeEventListener(event, this.elementEventHandler, true);
    });

  }
};


FormTracker.prototype.formEventHandler = function (e) {

  const target = e.target || e.srcElement;
  const type = e.type;

  const form = closest(target, formTag, true);

  const event = {
    name: `Form ${type}`,
    data: {
      event: type,
      ...extractFormData(form)
    },
    options: {
      [EVENT_OPTION_SCHEDULED]: (type === 'submit')
    }
  };

  this.emit(EVENT, event);

};

FormTracker.prototype.elementEventHandler = function (e) {

  const target = e.target || e.srcElement;
  const type = e.type;

  const element = closest(target, elementsTags.join(','), true);

  const form = element && closest(element, formTag);
  const event = {
    name: `Field ${type}`,
    data: {
      event: type,
      ...extractElementData(element),
      ...extractFormData(form)
    }
  };

  this.emit(EVENT, event);

};


export default FormTracker;
