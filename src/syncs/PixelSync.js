import { logger } from '../Logger';
import Emitter from 'component-emitter';
import when from '../functions/when';
import urlParse from 'url-parse';
import qs from 'qs';
import { win } from '../Browser';
import {
  INTERNAL_EVENT,
  EVENT_USER_PARAMS
} from "../Constants";
import { Object } from 'core-js';

const log = logger.create('Pixel sync');

export const PixelSync = function () {
  const NativeImage = Image;
  const self = this;

  class FakeImage {
    constructor(w, h) {
      const nativeImage = new NativeImage(w, h);
      const handler = {
        set: function (obj, prop, value) {
          if (prop === 'src') {
            log.debug(`gotcha ${value}`);
            if (value && value.indexOf('https://dss.hybrid.ai/Pixel/Track2') === 0) {
              const u = new URL(value);
              const pid = u.searchParams.get('pid');
              if (pid) {
                self.emit(INTERNAL_EVENT, EVENT_USER_PARAMS, { hybridPid: pid });
              }
            }
          }
          return nativeImage[prop] = value;
        },
        get: function (target, prop) {
          return target[prop];
        }
      };
      try {
        const prox = new Proxy(nativeImage, handler);
        try {
          prox[Symbol.toStringTag] = 'HTMLImageElement';
        } catch (e) { }
        return prox;
      } catch (e) {
        return nativeImage;
      }
    }
  }

  Object.defineProperty(FakeImage, 'name', {
    enumerable: false,
    configurable: false,
    writable: false,
    value: 'Image'
  });
  Image = win.Image = FakeImage;
};

Emitter(PixelSync.prototype);
