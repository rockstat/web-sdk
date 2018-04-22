import {
  win,
  doc,
  html,
  body
} from "../Browser";
import urlParse from "url-parse";

export function getProto() {
  const proto = win.location.protocol;
  return proto.substr(0, proto.length - 1)
}

export function pageDefaults(params) {

  params = params || {};
  params.short = params.short || false;

  const loc = win.location;
  const pageUrl = loc.href;
  const parsed = urlParse(pageUrl);

  return params.short ? {
    title: doc.title,
    referrer: doc.referrer,
    url: pageUrl
  } : {
    path: parsed.pathname,
    referrer: doc.referrer,
    query: parsed.query,
    domain: parsed.hostname,
    title: doc.title,
    url: pageUrl,
    proto: getProto()
  };
}

export function isHttps() {
  return getProto() === 'https';
}
