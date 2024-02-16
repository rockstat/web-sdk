import { nav, win, body, html } from "../Browser";
import objectAssing from '../functions/objectAssing';
import each  from '../functions/each';

const not_present = 'not present'


function getTimeZone(d) {
  const extracted = /\((.*)\)/.exec(d.toString());
  return extracted && extracted[1] || 'not present';
}

export function tstz() {
  const d = new Date();
  return {
    ts: d.getTime(),
    tz: getTimeZone(d),
    tzo: -d.getTimezoneOffset() * 1000
  }
}

export function binfo() {
  const d = new Date();
  return {
    plt: nav.platform || not_present,
    prd: nav.product || not_present
  }
}

function if1() {
  try {
    return win === win.top ? 0 : 1;
  } catch (e) { }
}

function if2() {
  try {
    return win.parent.frames.length > 0 ? 2 : 0;
  } catch (e) { }
}

function wh() {
  try {
    return {
      w: win.innerWidth || html.clientWidth || body.clientWidth,
      h: win.innerHeight || html.clientHeight || body.clientHeight
    };
  } catch (e) { }
}

function sr() {
  try {
    const s = win.screen;
    const orient = s.orientation || {};
    const aspRatio = win.devicePixelRatio
    return {
      tw: s.width || -1,
      th: s.height || -1,
      aw: s.availWidth || -1,
      ah: s.availHeight || -1,
      sopr: Math.round(aspRatio ? aspRatio * 1000 : -1),
      soa: orient.angle || -1,
      sot: orient.type || not_present
    };

  } catch (e) { }
}

const he_values = ['architecture', 'bitness', 'mobile', 'model', 'platform', 'platformVersion', 'uaFullVersion'];
const storedUAData = {};

export function prepareUAData(){
  if (nav['userAgentData'] && nav.userAgentData['getHighEntropyValues']){
    nav.userAgentData.getHighEntropyValues(he_values).then(ua => { 
      each(ua || {}, (k, v) => {
        if (he_values.includes(k)){
          storedUAData[k] = v;
        }
      })
     }).catch((e) => {
      storedUAData['err'] = String(e);
     });
  }
}


export default function () {
  return objectAssing({
    if1: if1(),
    if2: if2(),
    uad: storedUAData,
  }, wh(), sr(), binfo())
}
