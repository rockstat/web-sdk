# Browser trackinkg library for Rockstat analytics and marketing automation platform

It automaticaly tracks most of users actions and interratons: pages, clicks, forms, scroll, activity
and send data to server usign xhr/beacon/websocket/image transports.
Calcultating sessions based on local storage

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


Reliability Problem

The above methods all suffer from reliability problems, stemming from one core issue: There is not an ideal time in a page’s lifecycle to make the JavaScript call to send out the beacon.

- unload and beforeunload are unreliable, and outright ignored by several major browsers.
- pagehide and visibilitychange have issues on mobile platforms.

https://github.com/WICG/pending-beacon


## Thanks

- [BrowserStack](https://www.browserstack.com): great tool for manual and automated testing in browser


## License


[LICENSE](LICENSE)
