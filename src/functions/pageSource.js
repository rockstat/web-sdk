import objectAssign from './objectAssing';
import getOsMarks from './getOpenStatMarks';
import createLogger from './createLogger';
import simpleHash from './simpleHash';
import removeWww from './removeWww';
import objectKeys from './objectKeys';
import {isArray} from './type';
import urlParse from 'url-parse';
import punycode from 'punycode';

import {
  SESSION_CAMPAIGN,
  SESSION_DIRECT,
  SESSION_INTERNAL,
  SESSION_ORGANIC,
  SESSION_REFERRAL,
  SESSION_SOCIAL,
} from "../Variables";

const qs = urlParse.qs;

const ENGINE_GOOGLE = 'google';
const ENGINE_YANDEX = 'yandex';
const ENGINE_MAILRU = 'mailru';
const ENGINE_RAMBLER = 'rambler';
const ENGINE_BING = 'bing';
const ENGINE_YAHOO = 'yahoo';
const ENGINE_NIGMA = 'nigma';
const ENGINE_DUCKDUCKGO = 'duckduckgo';

const ENGINE_FACEBOOK = 'fb';
const ENGINE_TWITTER = 'twitter';
const ENGINE_VK = 'vk';
const ENGINE_OK = 'ok';
const ENGINE_LINKEDIN = 'linkedin';
const ENGINE_INSTAGRAM = 'instagram';

const UTMS = ['utm_source', 'utm_campaign', 'utm_content', 'utm_medium', 'utm_term'];
const OS = '_openstat';
const CLIDS = ['yclid', 'gclid'];

const RULES = [

  {domain: 'plus.google.com', engine: ENGINE_GOOGLE, type: SESSION_SOCIAL},
  {domain: 'plus.url.google.com', engine: ENGINE_GOOGLE, type: SESSION_SOCIAL},
  {domain: 'google.com.', engine: ENGINE_GOOGLE, type: SESSION_ORGANIC},
  {domain: 'google.', engine: ENGINE_GOOGLE, type: SESSION_ORGANIC},

  {domain: 'yandex.', param: 'text', engine: ENGINE_YANDEX, type: SESSION_ORGANIC},
  {domain: 'go.mail.ru', param: 'q', engine: ENGINE_MAILRU, type: SESSION_ORGANIC},
  {domain: 'nigma.ru', param: 's', engine: ENGINE_NIGMA, type: SESSION_ORGANIC},
  {domain: 'rambler.ru', param: 'query', engine: ENGINE_RAMBLER, type: SESSION_ORGANIC},
  {domain: 'bing.com', param: 'q', engine: ENGINE_BING, type: SESSION_ORGANIC},
  {domain: 'yahoo.com', param: 'p', engine: ENGINE_YAHOO, type: SESSION_ORGANIC},
  {domain: 'duckduckgo.com', engine: ENGINE_DUCKDUCKGO, type: SESSION_ORGANIC},

  {domain: 'com.google.android.', engine: ENGINE_GOOGLE, type: SESSION_ORGANIC}, // app

  {domain: 'facebook.com', engine: ENGINE_FACEBOOK, type: SESSION_SOCIAL},
  {domain: 'instagram.com', engine: ENGINE_INSTAGRAM, type: SESSION_SOCIAL}, //l.instagram.com
  {domain: 'vk.com', engine: ENGINE_VK, type: SESSION_SOCIAL}, // away.vk.com
  {domain: 'linkedin.com', engine: ENGINE_LINKEDIN, type: SESSION_SOCIAL},
  {domain: 'lnkd.in', engine: ENGINE_LINKEDIN, type: SESSION_SOCIAL},
  {domain: 'ok.ru', engine: ENGINE_OK, type: SESSION_SOCIAL},
  {domain: 't.co', engine: ENGINE_TWITTER, type: SESSION_SOCIAL},

  {domain: 'googlesyndication.com', engine: ENGINE_GOOGLE, type: SESSION_CAMPAIGN},
  {domain: 'googlesyndication.com', engine: ENGINE_GOOGLE, type: SESSION_CAMPAIGN},
  {domain: 'googleadservices.com', engine: ENGINE_GOOGLE, type: SESSION_CAMPAIGN},
  {domain: 'doubleclick.net', engine: ENGINE_GOOGLE, type: SESSION_CAMPAIGN},
  {domain: 'youtube.com', engine: ENGINE_GOOGLE, type: SESSION_CAMPAIGN},

];


const log = createLogger('PS');


const cleanQueryParam = function (val) {

  // processing multiple marks
  if (isArray(val)) val = val[0];

  // To string
  val = String(val);

  // processing url encoded marks
  if (val.indexOf('%') >= 0) {
    val = decodeURIComponent(val);
  }

  return val;

};


export default function pageSource(page) {

  const source = {
    type: SESSION_DIRECT,
    marks: {},
    hasMarks: false
  };

  let query = {};
  let queryKeys = [];

  if (page.query) {
    query = qs.parse(page.query);
    queryKeys = objectKeys(query);

    // Processing marks
    for (let i = 0; i < queryKeys.length; i++) {
      const key = queryKeys[i];
      // UTM
      for (let j = 0; j < UTMS.length; j++) {
        if (key === UTMS[j]) {

          source.marks[key] = cleanQueryParam(query[key])
          source.hasMarks = true;
        }
      }

      if (key === OS) {
        const os = getOsMarks(query[key]);
        source.marks = objectAssign(source.marks, os);
        source.hasMarks = true;
      }

      for (let j = 0; j < CLIDS.length; j++) {
        if (key === CLIDS[j]) {
          source.marks['has_' + key] = 1;
          source.hasMarks = true;
        }
      }
    }
  }

  // Processing ref
  let ref;
  if (page.referrer) {
    ref = urlParse(page.referrer);
  }
  source.refHash = simpleHash(page.referrer);

  // Direct with marks -> campaign
  if (!ref) {

    if (source.hasMarks) {
      source.type = SESSION_CAMPAIGN;
    }

    return source;
  }

  source.refHost = punycode.toUnicode(removeWww(ref.hostname));

  // Internal
  if (ref && source.refHost === removeWww(page.hostname)) {
    source.type = source.hasMarks ? SESSION_CAMPAIGN : SESSION_INTERNAL;
    return source;
  }

  // Other types: campaigns, organic, social

  const refDomainParts = source.refHost.split('.').reverse();

  for (let i = 0; i < RULES.length; i++) {
    const rule = RULES[i];
    const ruleDomainParts = rule.domain.split('.').reverse();
    const refDomainPartsClone = refDomainParts.slice();

    if (ruleDomainParts[0] === '') {
      ruleDomainParts.shift();
      refDomainPartsClone.shift();
    }

    if (refDomainPartsClone.slice(0, ruleDomainParts.length).join('.') === ruleDomainParts.join('.')) {

      source.type = rule.type;
      source.engine = rule.engine;

      if (rule.param && query[rule.param]) {
        source.keyword = cleanQueryParam(query[rule.param]);
      }

      break;
    }
  }

  // Referral
  if (!source.engine) {
    source.type = SESSION_REFERRAL;
  }

  // Forcing campaign type id marks present
  if (source.hasMarks) {
    source.type = SESSION_CAMPAIGN;
  }

  return source;

}
