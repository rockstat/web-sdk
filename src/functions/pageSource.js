import objectAssign from './objectAssing';
import getOsMarks from './getOpenStatMarks';
import createLogger from './createLogger';
import simpleHash from './simpleHash';
import removeWww from './removeWww';
import objectKeys from './objectKeys';
import { isArray } from './type';
import urlParse from 'url-parse';
import punycode from 'punycode';

import {
  SESSION_CAMPAIGN,
  SESSION_DIRECT,
  SESSION_INTERNAL,
  SESSION_ORGANIC,
  SESSION_REFERRAL,
  SESSION_SOCIAL,
  SESSION_PARTNER,
  SESSION_WEBVIEW,
} from "../Constants";

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
const ENGINE_TIKTOK = 'tiktok';
const ENGINE_VK = 'vk';
const ENGINE_OK = 'ok';
const ENGINE_LINKEDIN = 'linkedin';
const ENGINE_INSTAGRAM = 'instagram';
const ENGINE_TELEGRAM = 'telegram';
const ENGINE_YOUTUBE = 'youtube';

const UTMS = ['utm_source', 'utm_campaign', 'utm_content', 'utm_medium', 'utm_term'];
const PARTNER_IDS = ['pid', 'cid'];
const OS = '_openstat';
const YCLID = 'yclid';
const GCLID = 'gclid';
const FBCLID = 'fbclid';
const WEBVIEW_PARAM = 'inWebView';

const RULES = [

  { domain: 'plus.google.com', engine: ENGINE_GOOGLE, type: SESSION_SOCIAL },
  { domain: 'plus.url.google.com', engine: ENGINE_GOOGLE, type: SESSION_SOCIAL },
  { domain: 'google.com.', engine: ENGINE_GOOGLE, type: SESSION_ORGANIC },
  { domain: 'google.', engine: ENGINE_GOOGLE, type: SESSION_ORGANIC },

  { domain: 'yandex.', param: 'text', engine: ENGINE_YANDEX, type: SESSION_ORGANIC },
  { domain: 'go.mail.ru', param: 'q', engine: ENGINE_MAILRU, type: SESSION_ORGANIC },
  { domain: 'nigma.ru', param: 's', engine: ENGINE_NIGMA, type: SESSION_ORGANIC },
  { domain: 'rambler.ru', param: 'query', engine: ENGINE_RAMBLER, type: SESSION_ORGANIC },
  { domain: 'bing.com', param: 'q', engine: ENGINE_BING, type: SESSION_ORGANIC },
  { domain: 'yahoo.com', param: 'p', engine: ENGINE_YAHOO, type: SESSION_ORGANIC },
  { domain: 'duckduckgo.com', engine: ENGINE_DUCKDUCKGO, type: SESSION_ORGANIC },

  { domain: 'com.google.android.', engine: ENGINE_GOOGLE, type: SESSION_ORGANIC }, // app

  { domain: 'facebook.com', engine: ENGINE_FACEBOOK, type: SESSION_SOCIAL },

  { domain: 'tiktok.com', engine: ENGINE_TIKTOK, type: SESSION_SOCIAL },

  { domain: 'instagram.com', engine: ENGINE_INSTAGRAM, type: SESSION_SOCIAL }, //l.instagram.com

  { domain: 'org.telegram.', engine: ENGINE_TELEGRAM, type: SESSION_SOCIAL }, // app
  { domain: 'telegram.org', engine: ENGINE_TELEGRAM, type: SESSION_SOCIAL },
  { domain: 't.me', engine: ENGINE_TELEGRAM, type: SESSION_SOCIAL },
  
  { domain: 'vk.com', engine: ENGINE_VK, type: SESSION_SOCIAL }, // away.vk.com
  { domain: 'linkedin.com', engine: ENGINE_LINKEDIN, type: SESSION_SOCIAL },
  { domain: 'lnkd.in', engine: ENGINE_LINKEDIN, type: SESSION_SOCIAL },
  
  { domain: 'ok.ru', engine: ENGINE_OK, type: SESSION_SOCIAL },

  { domain: 't.co', engine: ENGINE_TWITTER, type: SESSION_SOCIAL },

  { domain: 'googlesyndication.com', engine: ENGINE_GOOGLE, type: SESSION_CAMPAIGN },
  { domain: 'googlesyndication.com', engine: ENGINE_GOOGLE, type: SESSION_CAMPAIGN },
  { domain: 'googleadservices.com', engine: ENGINE_GOOGLE, type: SESSION_CAMPAIGN },
  { domain: 'doubleclick.net', engine: ENGINE_GOOGLE, type: SESSION_CAMPAIGN },
  
  { domain: 'youtube.com', engine: ENGINE_YOUTUBE, type: SESSION_SOCIAL },
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

  log.info(page)

  let query = {};
  let queryKeys = [];
  let has_utm = false;
  let has_partner_ids = false;
  let has_os = false;
  let has_yclid = false;
  let has_gclid = false;
  let has_fbclid = false;
  let is_webview = false;

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
          has_utm = true;

        }
      }
      // OpenStat
      if (key === OS) {
        const os = getOsMarks(query[key]);
        source.marks = objectAssign(source.marks, os);
        source.hasMarks = true;
        has_os = true;
      }

      // Partner
      for (let j = 0; j < PARTNER_IDS.length; j++) {
        if (key === PARTNER_IDS[j]) {
          source.marks[key] = cleanQueryParam(query[key])
          source.hasMarks = true;
          has_partner_ids = true;
        }
      }

      // WebView
      if (key === WEBVIEW_PARAM) {
        if (cleanQueryParam(query[key]) == 'true' || cleanQueryParam(query[key]) == '1') {
          is_webview = true;
        }
      }

      // YClid
      if (key === YCLID) {
        source.hasMarks = true;
        source.marks['has_' + key] = 1;
        source.marks[key] = query[key];
        has_yclid = true;
      }

      // GClid
      if (key === GCLID) {
        source.hasMarks = true;
        source.marks['has_' + key] = 1;
        source.marks[key] = query[key];
        has_gclid = true;
      }

      // FBClid
      if (key === FBCLID) {
        source.hasMarks = true;
        source.marks['has_' + key] = 1;
        source.marks[key] = query[key];
        has_fbclid = true;
      }
    }
  }

  // Processing ref
  const ref = page.ref ? urlParse(page.ref) : '';
  source.refHash = simpleHash(page.ref + page.url);

  // Direct with marks -> campaign
  // Direct with fbclid -> facebooj social
  if (ref === '') {
    if (has_utm || has_os || has_gclid || has_yclid) {
      source.type = SESSION_CAMPAIGN;
    }
    if (has_partner_ids) {
      source.type = SESSION_PARTNER;
    }
    if(has_fbclid){
      source.type = SESSION_SOCIAL
      source.engine = ENGINE_FACEBOOK
    }
    if (is_webview){
      source.type = SESSION_WEBVIEW;
    }
    return source;
  }

  source.refhost = punycode.toUnicode(removeWww(ref.hostname));

  // Internal
  if (ref && source.refhost === removeWww(page.domain)) {
    log('internal detect', ref, source.refhost, removeWww(page.hostname))
    source.type = source.hasMarks ? SESSION_CAMPAIGN : SESSION_INTERNAL;
    return source;
  }

  // Other types: campaigns, organic, social

  const refDomainParts = source.refhost.split('.').reverse();

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

  // // Forcing campaign type id marks present
  // if (source.hasMarks) {
  //   source.type = SESSION_CAMPAIGN;
  // }

  // Forcing campaign type id marks present
  // we dont use fbclid because Facebook adds that to each outgoing link
  if (has_utm || has_os || has_gclid || has_yclid) {
    source.type = SESSION_CAMPAIGN;
  }

  if (has_partner_ids){
    source.type = SESSION_PARTNER;
  }

  if (is_webview){
    source.type = SESSION_WEBVIEW;
  }

  return source;
}
