import {
  win,
  doc,
  html,
  body
} from "../Browser";
import urlParse from "url-parse";

export function getScheme() {
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
    ref: doc.referrer,
    url: pageUrl
  } : {
    title: doc.title,
    path: parsed.pathname,
    ref: doc.referrer,
    url: pageUrl,
    query: parsed.query,
    domain: parsed.hostname,
    scheme: getScheme()
  };
}

export function isHttps() {
  return getScheme() === 'https';
}
