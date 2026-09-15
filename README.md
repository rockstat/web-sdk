# Rockstat Web SDK

Browser tracking library for the Rockstat analytics and marketing automation platform.
It automatically tracks user actions: page views, clicks, forms, scrolling, activity,
tab switching, session recording (rrweb), and sends the data to the server via
beacon / fetch / image transports. Sessions are computed on the client using local storage
and cookies.

- [Installation](#installation)
- [Configuration](#configuration)
- [API methods](#api-methods)
- [Events](#events)
- [Message format](#message-format)
- [Transport](#transport)
- [Session recording](#session-recording)
- [Development](#development)

## Installation

The snippet from `snippet/snippet.html` creates a global `rstat` function, queues calls until
`lib.js` is loaded from the tracker server, then replays them. The whole API is a single
function: the first argument is the method name, the rest are its parameters.

```html
<script type="text/javascript">
  !function (w, d, st, cn, hs, lj, rst, se, he) {
    if(w.rstat) return; rst = w.rstat = function () {
      var a = Array.prototype.slice.call(arguments);
      a.length && a[0] === cn && rst._a(Object(a[1]));
      return rst.doCall ? rst.doCall.call(rst, a) : rst._q.push(a) && 0; };
    rst.push = rst; rst._sv = '5.2.1'; rst._q = [];
    rst._jsl = function (src) {
      se = d.createElement(st); se.async = !0; se.src = src;
      he = d.getElementsByTagName(st)[0]; he.parentNode.insertBefore(se, he); };
    rst._a = function(conf){
      rst._host = conf.server; rst._prefix = conf.pathPrefix || '';
      rst._host && rst._jsl(hs+rst._host+rst._prefix+lj); }
  }(window, document, 'script', 'configure', 'https://', '/lib.js');

  rstat('configure', {
    server: 'YOUR_SUBDOMAIN.DOMAIN'
  });
  rstat('page');
</script>
```

The snippet loads `https://<server><pathPrefix>/lib.js`. The library initializes on
`DOMContentLoaded`; calls made before that are executed after initialization.

The library only works over HTTPS unless `allowHTTP: true` is set.

## Configuration

```js
rstat('configure', { /* options */ });
```

Can be called multiple times; options are merged. After initialization the call is ignored
with a console warning.

### Core options

| Option | Default | Description |
|---|---|---|
| `server` | `null` | Tracker server host. Required |
| `pathPrefix` | `''` | Path prefix on the server: `/lib.js` and events are requested under `<pathPrefix>/...` |
| `urlMark` | `'band'` | Path segment for event delivery: `/<urlMark>/t4k.json` |
| `projectId` | domain hash | Project identifier. Derived from the page domain by default |
| `allowHTTP` | `false` | Allow running over HTTP (for local development) |
| `allowSendBeacon` | `true` | Use `navigator.sendBeacon` for events |
| `allowXHR` | `true` | Allow fetch |
| `sessionTimeout` | `1800` | Session timeout, seconds |
| `lastCampaignExpires` | `7776000` | How long the last campaign is kept, seconds (90 days) |
| `initialUid` | `0` | Initial uid, if it needs to be supplied externally |
| `cookieDomain` | page domain | Cookie domain |
| `cookiePath` | `'/'` | Cookie path |
| `cookiePrefix` | `'rst4-'` | Cookie name prefix |
| `lcPrefix` | `'rst4:'` | Local storage key prefix |
| `activateWs`, `wsServer`, `wsPath` | `false`, `null`, `'/wss'` | WebSocket transport. Reserved, not used in the current version |
| `pixelSync` | `false` | Pixel interception. Reserved, not used in the current version |

### Trackers

Each tracker is enabled with an object of its settings or `true`; `false` disables it.

| Option | Default | Description |
|---|---|---|
| `trackActivity` | `{ zeroEvents: false, scrollEvents: true, domEvents: true }` | Activity and scrolling |
| `trackClicks` | `{ allClicks: false }` | Clicks |
| `trackForms` | `{}` | Forms and fields |
| `trackPages` | `false` | Reserved: automatic URL change tracking for SPAs is not implemented yet, call `page` manually |
| `trackRecord` | `{ autostart: false }` | Session recording (rrweb) |
| `browserEvents` | `{ unloadHandlers: true, visibilityHandlers: true }` | Page load / unload / visibility |

**`trackActivity`**

| Key | Default | Description |
|---|---|---|
| `flushInterval` | `5` | Period of the `activity` event, seconds |
| `zeroEvents` | `false` | Send `activity` even without user actions |
| `scrollEvents` | `true` | Send the `scroll` event when scrolling stops |
| `domEvents` | `true` | Count DOM events (clicks, keyboard, mouse movement) for `activity` |

**`trackClicks`**

| Key | Default | Description |
|---|---|---|
| `allClicks` | `false` | `false` — only link clicks (`link_click`), `true` — clicks on any element (`element_click`) |
| `ignoreClass` | `'rst-ignore'` | CSS class of elements whose clicks are not tracked |

**`trackForms`**

| Key | Default | Description |
|---|---|---|
| `trackValues` | `false` | Send field values as plain text (`evalue`) |
| `encryptionKey` | `null` | Public RSA key (base64 SPKI). When set, field values are encrypted in the browser (WebCrypto RSA-OAEP) and sent with `eenc: 1`. Plain text never leaves the browser; if encryption is unavailable the value is dropped |

**`trackRecord`**

| Key | Default | Description |
|---|---|---|
| `autostart` | `false` | `true` — recording starts on initialization, otherwise only via `rstat('record')` |
| `scriptUrl` | `null` | Full URL of the recording bundle if it is not hosted on the tracker server |
| `maskAllInputs` | `true` | Input values are not captured |
| `blockClass` | `'rst-block'` | Elements with this class are excluded from the recording entirely |
| `maskTextClass` | `'rst-mask'` | Element text is replaced with asterisks |
| `ignoreClass` | `'rst-ignore'` | Input events of the element are not recorded |
| `recordCanvas` | `false` | Record canvas |
| `checkoutEveryNms` | `120000` | Full DOM snapshot period, ms |
| `flushInterval` | `5` | Buffer flush period, seconds |
| `maxBatchBytes` | `40000` | Batch part size. Together with the envelope it must fit into the 64 KB beacon limit |

**`browserEvents`**

| Key | Default | Description |
|---|---|---|
| `unloadHandlers` | `true` | Send `page_unload` on `beforeunload` |
| `visibilityHandlers` | `true` | Send `page_visibility` on tab switching |

### Example

```js
rstat('configure', {
  server: 'stat.example.com',
  trackClicks: { allClicks: true },
  trackForms: { encryptionKey: 'MIIBIjANBgkq...' },
  trackRecord: { autostart: false, maskAllInputs: true }
});
rstat('page');
```

## API methods

All methods are called as `rstat('<method>', ...args)`. Before the library is loaded, calls
are queued and return `0`; after loading they return the method result.

### Sending data

**`rstat('page', [data], [options])`**
Page view. Sends the `page` event with performance data (`perf`) attached.
The library does not send it on its own: call it after `configure` and, in SPAs, on every
route change. Resets tracker counters (max scroll, etc.).

```js
rstat('page', { type: 'content', name: 'Contacts' });
```

**`rstat('event', name, [data], [options])`**
Custom event with an arbitrary `data` object.

```js
rstat('event', 'add_to_cart', { sku: 'A-100', qty: 2 });
```

**`rstat('identify', userId, [traits])`** / **`rstat('identify', traits)`**
User identification. `userId` and `traits` are saved in browser storage and added to the
`user` block of every subsequent message (`id` plus the `traits` keys). No separate message
is sent to the server.

```js
rstat('identify', 42, { plan: 'pro', email_hash: '...' });
```

**`rstat('request', service, name, [data])` → `Promise<response>`**
Request to an arbitrary backend service with a response. Always goes through fetch; the
response is parsed as JSON. The promise rejects on network error or timeout (10 s).

```js
const offer = await rstat('request', 'offers', 'get', { slot: 'hero' });
```

**`rstat('notify', service, name, [data])`**
Same as `request` but without waiting for a response (fire-and-forget via beacon).

**`rstat('sessionEvent')`**
Force sending the `session` event.

### Session recording

**`rstat('record', [options])`**
Start session recording. The rrweb bundle (`rrweb-record.js`) is loaded from the tracker
server only at this moment. `options` override `trackRecord` from the configuration.
A repeated call while recording is active is ignored. A call before initialization is deferred.

**`rstat('stopRecord')`** or **`rstat('record', false)`**
Stop recording and flush the remaining buffer. Recording can be started again afterwards.

### Callbacks

**`rstat('onReady', cb)`**
Called after the library is initialized (or immediately if it already is).

**`rstat('onEvent', cb)`**
`cb(name, data, options)` for every event before it is sent.

**`rstat('onMessage', cb)`**
`cb(msg)` with the complete message exactly as it is sent to the server.
Useful for debugging and custom integrations.

**`rstat('onInternalEvent', cb)`**
`cb(name, data)` for internal events: `dom_loaded`, `before_unload`, `visibility_change`.

**`rstat('onServerMessage', cb)`**
Messages from the server (reserved for the WebSocket channel).

### Utilities

| Method | Description |
|---|---|
| `rstat('getUid')` | Current visitor uid. Before initialization — a warning and `undefined` |
| `rstat('getSessNum')` | Current session number |
| `rstat('getLibInfo')` | `{ id: 'web-sdk', v, sv, st }` — library version (number, `5.2.1 → 5002001`), snippet version, start time |
| `rstat('isInitialized')` | `true` after initialization |
| `rstat('buildProjectId', domain)` | `[domain, projectId]` — normalized domain and its hash, used as the default `projectId` |
| `rstat('setCustomConfig', config)` | Save personal configuration overrides in browser storage. Applied on subsequent loads |
| `rstat('enableLogger')` | Enable verbose console logging. Can also be enabled with `window._rst4_logger = true` before loading |
| `rstat('set', name, obj)` | Put an object into the library registry |

### Event options

The third argument of `event` / `page` is a delivery options object:

| Option | Description |
|---|---|
| `request: true` | Send via fetch and return a promise with the server response |
| `transport_img: true` | Send via image pixel (used for `log`) |
| `outbound: true` | Marks a click on an external link (set automatically) |

## Events

All events go to the `track` service. The `data` field depends on the event.

### Automatic

| Event | Source | Data |
|---|---|---|
| `session` | SessionTracker | empty; the session is described in the `sess` block |
| `page` | `rstat('page')` | `data` from the call; the page is in the `page` block, timings in `perf` |
| `page_loaded` | `window.load` | empty; timings in `perf` |
| `page_unload` | `beforeunload` | empty |
| `page_visibility` | `visibilitychange` | `hidden` (0/1), `state` (`visible`/`hidden`), `dur` — ms the previous state lasted |
| `activity` | ActivityTracker, every `flushInterval` | `interval`, `iteration`, `active` and DOM event counters for the period: `click`, `mousemove`, `mousedown`, `mouseup`, `wheel`, `scroll`, `keydown`, `keyup`, `keypress`, `touchstart`, `touchmove`, `touchend`, `resize`, `focus`, `blur` |
| `scroll` | scrolling stopped | empty; the position is in the `scroll` block |
| `link_click` | click on `<a>` | `target` (see below), `href`, `text`, `outbound` |
| `element_click` | click on an element when `allClicks` | `target: { tag, type, name, cls, id, ... }` |
| `form_submit` | form submit | `event`, `fmthd`, `fact`, `fname`, `fcls`, `fid` |
| `field_focus`, `field_blur`, `field_change`, `field_invalid` | field events | `etag`, `etype`, `ename`, `eph`, `ecl`, `eid`, `evalue`, `eenc` + form data |
| `user_params` | internal, from GA4 / Yandex Metrika syncs | `ga4ClientId`, `ymId` — saved and added to the `user` block |
| `rec_start` | session recording started | `packed` (0/1) — fflate compression, `masked` (0/1) |
| `rec_batch` | session recording buffer | `seq`, `part`, `of`, `p`, `d` |

Every event except `session`, `page`, `page_loaded`, `user_params`, `rec_*` gets a `scroll`
block with the current scroll position. `identify` is handled locally and is not sent as
an event.

### `rec_batch`

`d` is a fragment of a JSON array of packed rrweb events. The array is serialized as a whole
and split into parts of `maxBatchBytes` characters. The server concatenates `d` by
`(uid, lib.st, seq)` in `part` order (`of` is the number of parts), parses the JSON and
unpacks each event (`p: 1` — fflate, `p: 0` — raw JSON).

## Message format

Every event is sent as a POST request to `https://<server><pathPrefix>/<urlMark>/t4k.json`
with a JSON body:

```json
{
  "service": "track",
  "name": "page",
  "data": {},
  "projectId": 1617632140,
  "uid": "6410748586712844288",
  "user": { "td": 0, "id": "42", "plan": "pro", "ga4ClientId": "2039255293.1537236640", "ymId": "1537242943246737376", "ts": 1757960000000, "tz": "Europe/Moscow", "tzo": 10800000 },
  "page": { "title": "Rockstat", "path": "/", "ref": "https://google.com/", "url": "https://example.com/?utm_source=g", "query": { "utm_source": "g" }, "domain": "example.com", "scheme": "https" },
  "sess": { "pageNum": 3, "eventNum": 17, "num": 2, "type": "campaign", "engine": "google", "refhost": "google.com", "marks": { "utm_source": "g" }, "hasMarks": true, "marksHash": 123456, "start": 1757960000000 },
  "char": { "ls": true, "ae": true, "pr": true, "sb": true, "ab": true, "wp": true },
  "browser": { "ts": 1757960000000, "tzOffset": -180, "w": 1440, "h": 415, "tw": 1440, "th": 900, "aw": 1440, "ah": 836, "if1": 0, "if2": 0, "nb": { "a": 1, "ch": 1, "l": 100, "ct": 0, "dt": -1 } },
  "perf": { "cs": 0, "ce": 0, "scs": -1, "rqs": 211, "rss": 1549, "rse": 1560, "dl": 1581, "di": 1812, "dc": -1 },
  "scroll": { "dh": 1148, "ch": 326, "to": 479, "cs": 100, "ms": 100 },
  "lib": { "id": "web-sdk", "v": 5002001, "sv": 5002001, "st": 1757960000000 }
}
```

| Block | Contents |
|---|---|
| `uid` | Visitor identifier. Stored in a cookie and local storage |
| `user` | `id` and traits from `identify`; `ga4ClientId` / `ymId` from the GA4 and Yandex Metrika syncs; `ts`, `tz`, `tzo` — client time and time zone; `td` — clock skew relative to the server |
| `page` | `url`, `path`, `query` (parsed query string including UTM, `gclid`, `yclid`), `ref`, `title`, `domain`, `scheme` |
| `sess` | Session, see below |
| `char` | Browser capabilities: `ls` localStorage, `ae` addEventListener, `pr` Promise, `sb` sendBeacon, `ab` atob, `wp` web push |
| `browser` | `w`/`h` — viewport, `tw`/`th` — screen, `aw`/`ah` — available area, `if1`/`if2` — iframe flags, orientation, platform, `nb` — battery, `ts`/`tzOffset` — client time. Plus Client Hints, network and memory data when available |
| `perf` | Navigation Timing (`cs` connectStart, `ce` connectEnd, `scs` secureConnectionStart, `rqs` requestStart, `rss`/`rse` responseStart/End, `dl` domLoading, `di` domInteractive, `dc` domComplete). Only for `page` and `page_loaded` |
| `scroll` | `dh` — document height, `ch` — viewport height, `to` — top offset, `cs` — current scroll percentage, `ms` — max scroll percentage on the page |
| `lib` | `id`, `v` — library version as a number `major * 1e6 + minor * 1e3 + patch`, `sv` — snippet version, `st` — library start time |
| `browser.nb` | Battery: `a` — API available, `ch` — charging, `l` — level in percent, `ct` / `dt` — seconds until fully charged / discharged, `-1` when no estimate is available |

The request query string carries `dig` — the body hash (cyrb53) and `td_trans` — the transport
used (`b` — beacon, `f` — fetch).

### Sessions

Events are grouped into sessions. A session starts with the first event and ends after
`sessionTimeout` seconds without events (30 minutes by default). A new significant source
(campaign, organic, partner) with different marks restarts the session early.

| `sess` field | Description |
|---|---|
| `num` | Visitor session number |
| `start` | Session start time |
| `pageNum`, `eventNum` | Page and event counters within the session |
| `type` | Source type: `campaign`, `organic`, `social`, `referral`, `partner`, `internal`, `direct`, `webview`, `unknown` |
| `engine` | Search engine or social network, when detected |
| `refhost` | Referrer host |
| `marks`, `hasMarks`, `marksHash` | Advertising marks from the query (`utm_*`, `gclid`, `yclid`, `openstat`, etc.), presence flag and hash of the set |

| Type | Condition |
|---|---|
| `campaign` | UTM marks, `gclid`, `yclid`, `openstat` or an ad network referrer |
| `organic` | Search engine referrer without advertising marks |
| `social` | Social network referrer without advertising marks |
| `partner` | Partner marks |
| `referral` | Referrer from another site |
| `internal` | Same-site referrer after the session timeout |
| `direct` | No referrer |
| `webview` | Opened inside an application |

The last campaign is kept for `lastCampaignExpires` seconds (90 days by default).

## Transport

- **Events**: `navigator.sendBeacon` first; if it refuses (queue full, body larger than
  64 KB) — `fetch` with `keepalive: true` and retries after 1 and 5 seconds.
- **`request`**: always `fetch`, response timeout 10 seconds, response parsed as JSON.
- **`log`**: library errors are sent to the `log` service via an image pixel
  `/<urlMark>/log.gif`.
- The `track` service name is mapped to the `t4k` path on the server.

## Session recording

rrweb is not part of `lib.js`. A separate bundle `rrweb-record.js` (rrweb record + fflate
packer) is loaded from `https://<server><pathPrefix>/public/rrweb-record.js` when
`rstat('record')` is called or when `trackRecord.autostart: true`.

All input values are masked by default. To exclude parts of the page use CSS classes:
`rst-block` — do not record the element, `rst-mask` — replace text with asterisks,
`rst-ignore` — do not record input in the field.

```js
rstat('record');                         // start
rstat('record', { recordCanvas: true }); // start with options
rstat('stopRecord');                     // stop
```

## Development

```bash
npm install
npm run build:dev   # dist/lib-dev.js + dist/rrweb-record.js
npm run build       # dist/lib.js (production)
npm run start:dev   # webpack --watch
```

### Demo

`demo/` contains a Vite + React application with a live event panel, a session recording
button and a tracker server stub that prints received events to the terminal.

```bash
npm run build:dev
DEMO_LIB=dev npm run demo   # http://localhost:5173, without DEMO_LIB=dev dist/lib.js is served
```

### Release

```bash
make bump-patch   # or bump-minor: updates package.json, src/Tracker.js, snippet,
                  # creates a commit and a vX.Y.Z tag (bump2version via uvx)
```

After the snippet version changes, update it in the documentation and ansible.

## About Rockstat

Is an open source platform for a web and product analytics.
It consists of a set of components: JavaScript tracking client for web applications;
server-side data collector; services for geo-coding and detecting client device type;
a new server deployment system.
[Read more](https://rockstat.ru/about)

![Rockstat sheme](https://rockstat.ru/media/rockstat_v3_arch.png?3)

## Useful links

- https://github.com/pierrec/js-cuint
- https://github.com/bryc/code
- https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html
- https://github.com/WICG/pending-beacon — on the unreliability of `unload` / `beforeunload`
  / `pagehide` / `visibilitychange` as a moment to send data

## Thanks

- [BrowserStack](https://www.browserstack.com): great tool for manual and automated testing in browser

## License

[LICENSE](LICENSE)
