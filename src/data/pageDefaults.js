import {win, doc, html, body} from "../Browser";

function getProto() {
  const proto = win.location.protocol;
  return proto.substr(0, proto.length - 1)
}

export default function(params) {

  params = params || {};
  params.short = params.short || false;

  const loc = win.location;
  return params.short
    ? {
      title: doc.title,
      referrer: doc.referrer,
      url: loc.href
    }
    : {
      path: loc.pathname,
      domain: loc.hostname,
      referrer: doc.referrer,
      query: loc.search,
      title: doc.title,
      url: loc.href,
      hash: loc.hash,
      proto: getProto()
    };
}

export function isHttps() {
  return getProto() === 'https';
}
