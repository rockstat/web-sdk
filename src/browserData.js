const w = window;
const d = document;

function if1() {
  try {
    return w === w.top ? 0 : 1;
  } catch (e) {}
}

function if2() {
  try {
    return w.parent.frames.length > 0 ? 2: 0;
  } catch (e){}
}

function wh() {

  try {
    const de = d.documentElement || {};
    const body = d.getElementsByTagName('body')[0] || {};
    return {
      w: w.innerWidth || de.clientWidth || body.clientWidth,
      h: w.innerHeight|| de.clientHeight|| body.clientHeight
    };
  } catch (e) {}
}

function sr() {
  try {

    const s = w.screen;
    const o = s.orientation || {};
    return {
      tot: {w: s.width, h: s.height},
      avail: {w: s.availWidth, h: s.availHeight},
      asp: Math.round(w.devicePixelRatio && w.devicePixelRatio * 1000),
      oAngle: o.angle,
      oType: o.type
    };

  } catch (e) {}
}

export default function () {
  return {
    if: [if1(), if2()],
    wh: wh(),
    sr: sr()
  }
}
