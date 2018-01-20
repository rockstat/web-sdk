import objectAssing from '../functions/objectAssing';
import toArray from '../functions/toArray';
import each from '../functions/each';
import Emitter from 'component-emitter';
import {win, doc} from "../Browser";
import {closest} from 'dom-utils';
import {
  EVENT,
  EVENT_OPTION_OUTBOUND,
  EVENT_OPTION_SCHEDULED
} from '../Variables';
import {
  useCaptureSupport,
  removeHandler,
  addHandler
} from "../functions/domEvents";


const formTag = 'form';
const events = ['focus', 'blur', 'change', 'submit', 'invalid'];

const FormTracker = function (options) {

  this.options = objectAssing({}, this.defaults, options);
  this.eventHandler = this.eventHandler.bind(this);

  if (useCaptureSupport) {
    each(toArray(doc.getElementsByTagName('form')), (form) => {
      each(events, (type) => {
        addHandler(form, type, this.eventHandler, true);
      });
    })
  }
};

FormTracker.prototype.defaults = {};

Emitter(FormTracker.prototype);

FormTracker.prototype.eventHandler = function (e) {

  const target = e.target || e.srcElement;
  const tag = target.tagName && target.tagName.toLocaleLowerCase();
  const isForm = tag === formTag;
  const type = e.type;

  const form = isForm ? target : closest(target, formTag);
  const field = !isForm && target;

  const event = {
    name: (isForm ? 'Form ' : 'Field ') + type,
    data: {
      event: type
    },
    options: {
      [EVENT_OPTION_SCHEDULED]: (type === 'submit'),
    }
  };

  if (field) {

    const etag = field.tagName.toLocaleLowerCase();
    const etype = field.getAttribute('type');

    objectAssing(event.data, {
      etag,
      etype,
      ename: field.getAttribute('name'),
      eph: field.getAttribute('placeholder'),
      ecl: field.className,
      eid: field.id,
    });
  }

  if (form) {
    objectAssing(event.data, {
      fmthd: form.getAttribute('method'),
      fact: form.getAttribute('action'),
      fname: form.getAttribute('name'),
      fcls: form.className,
      fid: form.id,
    });
  }

  this.emit(EVENT, event);

};


FormTracker.prototype.unload = function () {

  if (useCaptureSupport) {
    each(toArray(doc.getElementsByTagName('form')), (form) => {
      each(events, (type) => {
        removeHandler(form, type, this.eventHandler);
      });
    })
  }

};


export default FormTracker;
