// Тонкая обёртка над глобальным rstat4 (очередь работает до загрузки lib.js)
export const rstat = (...args) => window.rstat4 && window.rstat4(...args);

// Живая лента событий трекера для дебаг-панели:
// onMessage отдаёт полное сообщение в том виде, в котором оно уходит на сервер
const listeners = new Set();
const buffer = [];

// lib.v в сообщениях — semver, упакованный в число (packSemVer в SDK): 5002001 → 5.2.1
export const unpackSemVer = (v) =>
  `${Math.floor(v / 1000000)}.${Math.floor(v / 1000) % 1000}.${v % 1000}`;

// Версия загруженного lib.js: берётся из первого сообщения трекера
let libVersion = null;
const versionListeners = new Set();

export const subscribeLibVersion = (cb) => {
  versionListeners.add(cb);
  cb(libVersion);
  return () => versionListeners.delete(cb);
};

rstat('onMessage', (msg) => {
  if (!libVersion && msg.lib && msg.lib.v) {
    libVersion = unpackSemVer(msg.lib.v);
    versionListeners.forEach((cb) => cb(libVersion));
  }
  const entry = { ts: new Date().toLocaleTimeString(), name: msg.name, msg };
  buffer.unshift(entry);
  if (buffer.length > 50) buffer.pop();
  listeners.forEach((cb) => cb([...buffer]));
});

export const subscribeEvents = (cb) => {
  listeners.add(cb);
  cb([...buffer]);
  return () => listeners.delete(cb);
};
