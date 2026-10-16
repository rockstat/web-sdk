import { useEffect, useState } from 'react';
import { rstat, subscribeEvents, subscribeLibVersion } from './tracker';

// Живая лента событий SDK — видно, что уходит трекеру,
// включая зашифрованные значения полей (evalue + eenc)

// Длинные строки (батчи записи экрана) в ленте обрезаем
const truncate = (key, value) =>
  (typeof value === 'string' && value.length > 500)
    ? `${value.slice(0, 500)}… (${value.length} chars)`
    : value;

export default function TrackerPanel() {
  const [events, setEvents] = useState([]);
  const [open, setOpen] = useState(true);
  const [recording, setRecording] = useState(false);
  const [libVersion, setLibVersion] = useState(null);

  useEffect(() => subscribeEvents(setEvents), []);
  useEffect(() => subscribeLibVersion(setLibVersion), []);

  // Запись экрана стартует по требованию: rrweb дозагрузится отдельным бандлом
  const toggleRecord = (e) => {
    e.stopPropagation();
    rstat(recording ? 'stopRecord' : 'record');
    setRecording(!recording);
  };

  // rst-block: панель исключена из записи экрана, иначе rrweb фиксирует
  // вывод собственных батчей и запись зацикливается
  return (
    <aside className={`tracker-panel rst-block ${open ? '' : 'collapsed'}`}>
      <div className="tracker-panel-head" onClick={() => setOpen(!open)}>
        <span>
          📡 События трекера ({events.length})
          {/* __DEMO_LIB__ подставляет vite: lib.js или lib-dev.js */}
          <span className="tracker-lib" title="Версия загруженного SDK">
            {__DEMO_LIB__} {libVersion ? `v${libVersion}` : '…'}
          </span>
        </span>
        <span>
          <button type="button" className="tracker-rec" onClick={toggleRecord}>
            {recording ? '⏹ стоп записи' : '⏺ запись'}
          </button>
          {open ? '▼' : '▲'}
        </span>
      </div>
      {open && (
        <div className="tracker-panel-body">
          {events.length === 0 && (
            <p className="tracker-empty">Пока пусто — кликайте, заполняйте формы...</p>
          )}
          {events.map((ev, i) => (
            <details key={events.length - i} className="tracker-event">
              <summary className="tracker-event-head">
                <code>{ev.name}</code>
                <span className="tracker-ts">{ev.ts}</span>
              </summary>
              <pre>{JSON.stringify(ev.msg, truncate, 2)}</pre>
            </details>
          ))}
        </div>
      )}
    </aside>
  );
}
