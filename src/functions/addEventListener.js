export default function addEventListener(element, eventType, eventHandler, useCapture) {
  if (element.addEventListener) {
    return element.addEventListener(eventType, eventHandler, useCapture);
  }
  else if (element.attachEvent) {
    return element.attachEvent('on' + eventType, eventHandler);
  }
  else {
    element['on' + eventType] = eventHandler;
  }
}
