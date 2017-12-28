export default function addEventListener(element, eventType, eventHandler, useCapture) {
  if (element.addEventListener) {
    return element.addEventListener(eventType, eventHandler, useCapture);
  }
  if (element.attachEvent) {
    return element.attachEvent('on' + eventType, eventHandler);
  }
  element['on' + eventType] = eventHandler;
}
