import objectAssing from '../functions/objectAssing';
import createLogger from '../functions/createLogger';
import Emitter from 'component-emitter';
import once from '../functions/once';
import {
  DOM_COMPLETE,
  DOM_BEFORE_UNLOAD,
  DOM_UNLOAD,
  DOM_INTERACTIVE,
  CB_DOM_EVENT
} from "../Variables";

const log = createLogger('Aclo::BET');
const win = window;
const doc = document;

/**
 * Трекер отслеживающий базовые события браузера, такие, как завершение загруки, выгрузка страницы и тп.
 * @param options
 * @constructor
 */
const BrowserEventsTracker = function (options) {

  this.options = objectAssing({}, options);

  // Обработчик завершения загрузки страницы
  this.loadedHandler = once(() => {

    this.emit(CB_DOM_EVENT, DOM_COMPLETE);
    win.removeEventListener && win.removeEventListener('load', this.loadedHandler);
    doc.detachEvent && doc.detachEvent('onload', this.loadedHandler);

  });

  // Обработчик beforeunload, который вызывается перед непосредственной выгрузкой страницы
  this.beforeUnloadHandler = () => {

    this.emit(CB_DOM_EVENT, DOM_BEFORE_UNLOAD);
    win.removeEventListener('beforeunload', this.beforeUnloadHandler);

  };

  // Обработчик unload
  this.unloadHandler = () => {

    this.emit(CB_DOM_EVENT, DOM_UNLOAD);
    win.removeEventListener('unload', this.unloadHandler);

  };

};

Emitter(BrowserEventsTracker.prototype);

BrowserEventsTracker.prototype.initialize = function () {

  if (win.addEventListener) {

    win.addEventListener('load', this.loadedHandler);
    win.addEventListener('beforeunload', this.beforeUnloadHandler);
    win.addEventListener('unload', this.unloadHandler);
  }

  // Для старых IE (8-)
  else if (doc.attachEvent) {
    doc.attachEvent("onload", this.loadedHandler);
  }

};


export default BrowserEventsTracker;
