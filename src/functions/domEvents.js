import {doc, win} from "../Browser";

const useAddEL = !!win.addEventListener;
const useAttach = !!win.attachEvent;

/**
 * @return {boolean}
 */
const checkIsComplete = () => {
  return doc.readyState === 'loaded';
};

export const isDocComplete = checkIsComplete;

/**
 * @return {boolean}
 */
const checkIsInteractive = () => {
  //TODO: Нужно подумать о state === 'loaded'
  return doc.readyState === 'interactive';
};

export const isDocInteractive = checkIsInteractive;


const interactiveChecker = (cb) => {
  let fired = false;
  return () => {
    if (fired) return;
    if (checkIsInteractive()) {
      fired = true;
      cb();
    }
  };
};



/**
 *
 * @type {boolean}
 */
export const useCaptureSupport = useAddEL;


/**
 * @param elem
 * @param type
 * @param handler
 * @param useCapture
 * @return {*}
 */
export function addHandler(elem, type, handler, useCapture = false) {
  if (useAddEL) {
    return elem.addEventListener(type, handler, useCapture);
  }
  else if (useAttach) {

    if (type === 'DOMContentLoaded') {
      return addHandler(elem, 'readystatechange', interactiveChecker(handler), useCapture);
    }

    return elem.attachEvent('on' + type, handler);
  }
}

/**
 *
 * @param elem
 * @param type
 * @param handler
 * @param useCapture
 * @return {*}
 */
export function removeHandler(elem, type, handler, useCapture) {
  if (useAddEL) {
    return elem.addEventListener(type, handler, useCapture);
  }
  else if (useAttach) {

    if (type === 'DOMContentLoaded') {
      //TODO: Добить удалени слушателя
      return;
    }

    return elem.attachEvent('on' + type, handler);
  }
}
