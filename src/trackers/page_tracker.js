import objectAssing from '../functions/objectAssing';
import createLogger from '../functions/createLogger';
import Emitter from 'component-emitter';
import once from '../functions/once';
import {
  removeHandler,
  addHandler
} from "../functions/domEvents";
import {win, doc} from "../Browser";
import {
  DOM_COMPLETE,
  DOM_BEFORE_UNLOAD,
  DOM_UNLOAD,
  INTERNAL_EVENT,
  EVENT,
  EVENT_PAGE_LOADED
} from "../Constants";

const log = createLogger('Aclo::BET');

/**
 * Трекер отслеживающий базовые события браузера, такие, как завершение загруки, выгрузка страницы и тп.
 * @param options
 * @constructor
 */
const PageTracker = function (options) {

  this.options = objectAssing({}, options);

  // Обработчик завершения загрузки страницы
  this.loadedHandler = once(() => {

    this.emit(INTERNAL_EVENT, DOM_COMPLETE);
    this.emit(EVENT, {
      name: EVENT_PAGE_LOADED
    });
    removeHandler(win, 'load', this.loadedHandler);

  });

  // Обработчик beforeunload, который вызывается перед непосредственной выгрузкой страницы
  this.beforeUnloadHandler = () => {

    this.emit(INTERNAL_EVENT, DOM_BEFORE_UNLOAD);
    removeHandler(win, 'beforeunload', this.beforeUnloadHandler);

  };

  // Обработчик unload
  this.unloadHandler = () => {

    this.emit(INTERNAL_EVENT, DOM_UNLOAD);
    removeHandler(win, 'unload', this.unloadHandler);

  };
};

PageTracker.prop = 'page_tracker';

Emitter(PageTracker.prototype);

PageTracker.prototype.initialize = function () {

  addHandler(win, 'load', this.loadedHandler);
  addHandler(win, 'beforeunload', this.beforeUnloadHandler);
  addHandler(win, 'unload', this.unloadHandler);

};

PageTracker.prototype.unload = function () {

};


export default PageTracker;
