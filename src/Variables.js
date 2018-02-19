export const EVENT = 'Event';
export const EVENT_PAGEVIEW = 'pageview';
export const EVENT_IDENTIFY = 'identify';
export const EVENT_SESSION = 'session';
export const EVENT_PAGE_LOADED = 'Page loaded';
export const EVENT_ACTIVITY = 'Activity';
export const EVENT_SCROLL = 'Scroll';
export const EVENT_FORM_SUMBIT = 'Form submit';
export const EVENT_FORM_INVALID = 'Form invalid';
export const EVENT_FIELD_FOCUS = 'Field focus';
export const EVENT_FIELD_BLUR = 'Field blur';
export const EVENT_FIELD_CHANGE = 'Field change';
export const EVENT_USER_PARAMS = 'User params';
export const EVENT_LINK_CLICK = 'Link click';

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

export const INTERNAL_EVENT = 'Internal event';

export const EVENT_OPTION_BOUNDED = 'bounded';
export const EVENT_OPTION_SCHEDULED = 'scheduled';
export const EVENT_OPTION_OUTBOUND = 'outbound';

export const SESSION_INTERNAL = 'internal';
export const SESSION_DIRECT = 'direct';
export const SESSION_ORGANIC = 'organic';
export const SESSION_CAMPAIGN = 'campaign';
export const SESSION_REFERRAL = 'referral';
export const SESSION_SOCIAL = 'social';
export const SESSION_UNKNOWN = 'unknown';

export const DOM_INTERACTIVE = 'domInteractive';
export const DOM_COMPLETE = 'domLoaded';
export const DOM_BEFORE_UNLOAD = 'beforeunload';
export const DOM_UNLOAD = 'unload';

export const READY = 'ready';

export const CB_DOM_EVENT = 'domEvent';




