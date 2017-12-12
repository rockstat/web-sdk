function getTimeZone(d) {
  return /\((.*)\)/.exec(d.toString())[1];
}

const n = navigator || {};

export default function () {
  const d = new Date();
  return {
    ts: d.getTime(),
    tz: getTimeZone(d),
    tzOffset: -d.getTimezoneOffset()*1000,
    platform: n.platform,
    product: n.product
  }
}
