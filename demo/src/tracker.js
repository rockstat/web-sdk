// Тонкая обёртка над глобальным rstat4 (очередь работает до загрузки lib.js)
export const rstat = (...args) => window.rstat4 && window.rstat4(...args);

// Живая лента событий трекера для дебаг-панели:
// onMessage отдаёт полное сообщение в том виде, в котором оно уходит на сервер
const listeners = new Set();
const buffer = [];

rstat('onMessage', (msg) => {
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
