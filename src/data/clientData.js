const not_present = 'not present';

function getTimeZone(d) {
  const extracted = /\((.*)\)/.exec(d.toString());
  return extracted && extracted[1] || 'not present';
}

const n = navigator || {};

export default function () {
  const d = new Date();
  return {
    ts: d.getTime(),
    tz: getTimeZone(d),
    tzOffset: -d.getTimezoneOffset()*1000,
    platform: n.platform || not_present,
    product: n.product || not_present
  }
}
