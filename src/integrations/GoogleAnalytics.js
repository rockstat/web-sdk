import createLogger from '../functions/createLogger';
import Emitter from 'component-emitter';
import when from '../functions/when';
import {win} from '../Browser';
import {
  INTERNAL_EVENT,
  EVENT_USER_PARAMS
} from "../Variables";

const log = createLogger('Alco GA');

const GoogleAnalytics = function () {

  // Getting Google Analytics ClientId
  when(() => win.ga, () => {
    win.ga(() => {
      try {

        const gaId = win.ga && win.ga.getAll && win.ga.getAll()[0] && win.ga.getAll()[0].get('clientId');

        if (gaId) {

          this.emit(INTERNAL_EVENT, EVENT_USER_PARAMS, {gaId});
        }

      } catch (e) {
        log.error('Error:',e)
      }
    })
  }, 25, 40);

};

Emitter(GoogleAnalytics.prototype);


export default GoogleAnalytics;
