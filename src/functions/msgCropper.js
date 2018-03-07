import {isArray} from './type';
import each from './each';

export default function msgCropper(msg, msgCropSchema) {
  const result = {};
  each(msgCropSchema, function (key, val) {
    if(!msg[key]) return;
    if (val === true) {
      result[key] = msg[key];
    } else if (isArray(val) ) {
      result[key] = {};
      each(val, function (key2) {
        if(!msg[key][key2]) return;
        result[key][key2] = msg[key][key2];
      })
    }
  });
  return result;
}
