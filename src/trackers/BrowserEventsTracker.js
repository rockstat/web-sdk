import objectAssing from '../functions/objectAssing';
import createLogger from '../functions/createLogger';
import Emitter from 'component-emitter';
import once from '../functions/once';
import {
  removeHandler,
  addHandler
} from "../functions/domEvents";
import { win, doc } from "../Browser";
import {
  DOM_COMPLETE,
  DOM_BEFORE_UNLOAD,
  DOM_VISIBILITY_CHANGE,
  INTERNAL_EVENT,
  EVENT,
  EVENT_PAGE_LOADED,
  EVENT_PAGE_VISIBILITY
} from "../Constants";

const log = createLogger('RST/BrowserEventsTracker');

/**
 * Трекер отслеживающий базовые события браузера, такие, как завершение загруки, выгрузка страницы и тп.
 * @param options
 * @constructor
 */
const BrowserEventsTracker = function (options) {

  this.options = objectAssing({
    unloadHandlers: true,
    visibilityHandlers: true // переключение вкладок / сворачивание окна (Page Visibility API)
  }, options);

  // Момент последней смены видимости — для длительности предыдущего состояния
  this.visibilityTs = Date.now();

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

  // Обработчик visibilitychange: вкладка ушла в фон или вернулась.
  // dur — сколько мс держалось предыдущее состояние
  this.visibilityHandler = () => {
    const now = Date.now();
    const hidden = doc.visibilityState === 'hidden' ? 1 : 0;
    const data = {
      hidden: hidden,
      state: doc.visibilityState,
      dur: now - this.visibilityTs
    };
    this.visibilityTs = now;
    this.emit(INTERNAL_EVENT, DOM_VISIBILITY_CHANGE, data);
    this.emit(EVENT, {
      name: EVENT_PAGE_VISIBILITY,
      data: data
    });
  };
};

Emitter(BrowserEventsTracker.prototype);

BrowserEventsTracker.prototype.initialize = function () {

  addHandler(win, 'load', this.loadedHandler);
  if (this.options.unloadHandlers) {
    addHandler(win, 'beforeunload', this.beforeUnloadHandler);
  }
  if (this.options.visibilityHandlers && typeof doc.visibilityState === 'string') {
    addHandler(doc, 'visibilitychange', this.visibilityHandler);
  }
};

BrowserEventsTracker.prototype.unload = function () {
  removeHandler(doc, 'visibilitychange', this.visibilityHandler);
};

export default BrowserEventsTracker;
