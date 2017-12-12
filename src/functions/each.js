import {isObject, isArray} from './type';

export default function each(arg, cb) {
  if(!arg || !cb) return;
  if(isArray(arg)){
    for (let i = 0; i < arg.length; i++) {
      cb(arg[i], i);
    }
  } else if (isObject(arg)){
    for (const key in arg) {
      if (arg.hasOwnProperty(key)) {
        cb(key, arg[key]);
      }
    }
  }
}

