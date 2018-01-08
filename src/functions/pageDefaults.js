import {win, doc, html, body} from "../Browser";

function getProto() {
  const proto = win.location.protocol;
  return proto.substr(0, proto.length - 1)
}

export default function() {

  const loc = win.location;
  return {
    path: loc.pathname,
    hostname: loc.hostname,
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
