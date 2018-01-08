import {win, doc, body, html} from "../Browser";

function if1() {
  try {
    return win === win.top ? 0 : 1;
  } catch (e) {}
}

function if2() {
  try {
    return win.parent.frames.length > 0 ? 2: 0;
  } catch (e){}
}

function wh() {

  try {
    return {
      w: win.innerWidth || html.clientWidth || body.clientWidth,
      h: win.innerHeight|| html.clientHeight|| body.clientHeight
    };
  } catch (e) {}
}

function sr() {
  try {

    const s = win.screen;
    const o = s.orientation || {};
    return {
      tot: {w: s.width, h: s.height},
      avail: {w: s.availWidth, h: s.availHeight},
      asp: Math.round(win.devicePixelRatio && win.devicePixelRatio * 1000),
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
