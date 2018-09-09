export const SERVICE_TRACK = 'track';


export const EVENT = 'event';
export const EVENT_PAGEVIEW = 'page';
export const EVENT_IDENTIFY = 'identify';
export const EVENT_SESSION = 'session';
export const EVENT_PAGE_LOADED = 'page_loaded';
export const EVENT_ACTIVITY = 'activity';
export const EVENT_SCROLL = 'scroll';
export const EVENT_FORM_SUMBIT = 'form_submit';
export const EVENT_FORM_INVALID = 'form_invalid';
export const EVENT_FIELD_FOCUS = 'field_focus';
export const EVENT_FIELD_BLUR = 'field_blur';
export const EVENT_FIELD_CHANGE = 'field_change';
export const EVENT_USER_PARAMS = 'user_params';
export const EVENT_LINK_CLICK = 'link_click';
export const EVENT_PAGE_UNLOAD = 'page_unload';

export const EVENTS_ADD_PERF = [EVENT_PAGEVIEW, EVENT_PAGE_LOADED];

export const EVENTS_NO_SCROLL = [
  EVENT_SESSION,
  EVENT_PAGEVIEW,
  EVENT_PAGE_LOADED,
  EVENT_USER_PARAMS,
  EVENT_IDENTIFY
];

export const EVENTS_ADD_SCROLL = [
  EVENT_FORM_SUMBIT,
  EVENT_FORM_INVALID,
  EVENT_FIELD_FOCUS,
  EVENT_FIELD_CHANGE,
  EVENT_FIELD_BLUR,
  EVENT_ACTIVITY,
  EVENT_SCROLL
];

export const SERVER_MESSAGE = 'server-message';
export const INTERNAL_EVENT = 'internal_event';

export const EVENT_OPTION_TERMINATOR = 'terminator';
export const EVENT_OPTION_OUTBOUND = 'outbound';
export const EVENT_OPTION_MEAN = 'mean';

export const SESSION_INTERNAL = 'internal';
export const SESSION_DIRECT = 'direct';
export const SESSION_ORGANIC = 'organic';
export const SESSION_CAMPAIGN = 'campaign';
export const SESSION_REFERRAL = 'referral';
export const SESSION_SOCIAL = 'social';
export const SESSION_UNKNOWN = 'unknown';

export const DOM_INTERACTIVE = 'dom_interactive';
export const DOM_COMPLETE = 'dom_loaded';
export const DOM_BEFORE_UNLOAD = 'before_unload';
export const DOM_UNLOAD = 'unload';

export const READY = 'ready';

export const CB_DOM_EVENT = 'dom_event';




