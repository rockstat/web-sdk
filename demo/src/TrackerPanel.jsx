import { useEffect, useState } from 'react';
import { subscribeEvents } from './tracker';

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

  useEffect(() => subscribeEvents(setEvents), []);

  // rst-block: панель исключена из записи экрана, иначе rrweb фиксирует
  // вывод собственных батчей и запись зацикливается
  return (
    <aside className={`tracker-panel rst-block ${open ? '' : 'collapsed'}`}>
      <div className="tracker-panel-head" onClick={() => setOpen(!open)}>
        <span>📡 События трекера ({events.length})</span>
        <span>{open ? '▼' : '▲'}</span>
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
