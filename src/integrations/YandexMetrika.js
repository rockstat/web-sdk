import createLogger from '../functions/createLogger';
import Emitter from 'component-emitter';
import when from '../functions/when';
import {win} from '../Browser';
import {
  INTERNAL_EVENT,
  EVENT_USER_PARAMS
} from "../Variables";

const log = createLogger('Alco YM');

const YandexMetrika = function () {

  // Getting YM ClientId
  when(() => win.Ya && win.Ya.Metrika, () => {
    try {

      const ymClientId = win.Ya._metrika && win.Ya._metrika.counter && win.Ya._metrika.counter.getClientID();

      if (ymClientId) {
        this.emit(INTERNAL_EVENT, EVENT_USER_PARAMS, {ymClientId});
      }

    } catch (e) {
      log.error('Error:', e)
    }
  }, 25, 40);

};

Emitter(YandexMetrika.prototype);

export default YandexMetrika;
