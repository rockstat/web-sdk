import objectAssing from '../functions/objectAssing';
import toArray from '../functions/toArray';
import each from '../functions/each';
import {closest} from 'dom-utils';
import Emitter from 'component-emitter';

const win = window;
const formTag = 'form';

const FormTracker = function (options) {

  this.options = objectAssing({}, this.defaults, options);
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

  const form = isForm ? target : closest(target, formTag);
  const field = !isForm && target;

  const event = {
    name: this.options.namePrefix + (isForm ? 'Form ' : 'Field ') + e.type,
    data: {
      event: e.type
    }
  };

  if (field) {

    const ftag = field.tagName.toLocaleLowerCase();
    const ftype = field.getAttribute('type');

    objectAssing(event.data, {
      ftag,
      ftype,
      fname: field.getAttribute('name'),
      fph: field.getAttribute('placeholder'),
      fcl: field.className,
      fid: field.id,
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

    const handlerWrapper = (e) => this.eventHandler(e);

    form.addEventListener('focus', handlerWrapper, true);
    form.addEventListener('blur', handlerWrapper, true);
    form.addEventListener('change', handlerWrapper, true);
    form.addEventListener('submit', handlerWrapper, true);
    form.addEventListener('invalid', handlerWrapper, true);

  })
};

export default FormTracker;
