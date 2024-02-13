import createLogger from '../functions/createLogger';
import Emitter from 'component-emitter';
import when from '../functions/when';
import {win} from '../Browser';
import {
  INTERNAL_EVENT,
  EVENT_USER_PARAMS
} from "../Constants";

const log = createLogger('RST/GASync');

const GoogleAnalytics = function () {

  // Getting Google Analytics ClientId

  function get_ga_clientid() {
    
  }

  let ga4ClientId;
  when(
    () => {
      try {
        var parsed_cookies = {};
        document.cookie.split(';').forEach(function(el) {
          var splitCookie = el.split('=');
          var key = splitCookie[0].trim();
          var value = splitCookie[1];
          parsed_cookies[key] = value;
        });
        if(parsed_cookies["_ga"]){
          ga4ClientId = parsed_cookies["_ga"].substring(6);
        }
        return !!ga4ClientId;
      } catch(e){
        log.warn('Error while getting ga4 client id', e);
      }
    },
    () => {
      this.emit(INTERNAL_EVENT, EVENT_USER_PARAMS, {ga4ClientId});
    }, 
    100,
    100);
  
  // when(() => win.ga && win.ga.getAll && win.ga.getAll()[0], () => {
  //   win.ga(() => {
  //     try {
  //       const gaId = win.ga.getAll()[0].get('clientId');

  //       if (gaId) {
  //         this.emit(INTERNAL_EVENT, EVENT_USER_PARAMS, {gaId});
  //       }
  //     } catch (e) {
  //       log.error('Error while getting GA Client id:', e)
  //     }
  //   })
  // }, 25, 40);
};

Emitter(GoogleAnalytics.prototype);


export default GoogleAnalytics;
