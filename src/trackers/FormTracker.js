import objectAssing from '../functions/objectAssing';
import toArray from '../functions/toArray';
import each from '../functions/each';
import Emitter from 'component-emitter';
import {closest} from 'dom-utils';
import {
  EVENT_OPTION_OUTBOUND,
  EVENT_OPTION_SCHEDULED
} from "../Variables";

const win = window;
const formTag = 'form';

const FormTracker = function (options) {

  this.options = objectAssing({}, this.defaults, options);
  this.eventHandler = this.eventHandler.bind(this);
  this.initialize();
};

FormTracker.prototype.defaults = {
  namePrefix: ''
};

Emitter(FormTracker.prototype);

FormTracker.prototype.eventHandler = function (e) {

  const target = e.target || e.srcElement;
  const tag = target.tagName && target.tagName.toLocaleLowerCase();
  const isForm = tag === formTag;
  const type = e.type;

  const form = isForm ? target : closest(target, formTag);
  const field = !isForm && target;

  const event = {
    name: this.options.namePrefix + (isForm ? 'Form ' : 'Field ') + type,
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

  this.emit('event', event);

};


FormTracker.prototype.initialize = function () {

  // Works only IE9+ (supported useCapture)
  if (!win.addEventListener) return;

  each(toArray(document.getElementsByTagName('form')), (form) => {

    form.addEventListener('focus', this.eventHandler, true);
    form.addEventListener('blur', this.eventHandler, true);
    form.addEventListener('change', this.eventHandler, true);
    form.addEventListener('submit', this.eventHandler, true);
    form.addEventListener('invalid', this.eventHandler, true);

  })
};

export default FormTracker;
