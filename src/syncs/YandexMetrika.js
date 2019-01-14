import createLogger from '../functions/createLogger';
import Emitter from 'component-emitter';
import when from '../functions/when';
import {win} from '../Browser';
import {
  INTERNAL_EVENT,
  EVENT_USER_PARAMS
} from "../Constants";

const log = createLogger('Alco YM');

const YandexMetrika = function () {

  // Waiting YM load
  when(() => win.Ya && (win.Ya.Metrika || win.Ya.Metrika2) && win.Ya._metrika && win.Ya._metrika.counter, () => {
    try {
      // Getting YM ClientId
      const ymId = win.Ya._metrika.counter.getClientID();

      if (ymId) {
        this.emit(INTERNAL_EVENT, EVENT_USER_PARAMS, {ymId});
      }

    } catch (e) {
      log.error('Error:', e)
    }
  }, 25, 40);

};

Emitter(YandexMetrika.prototype);

export default YandexMetrika;
