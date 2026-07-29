import { useEffect, useState } from 'react';
import { subscribeEvents } from './tracker';

// Живая лента событий SDK — видно, что уходит трекеру,
// включая зашифрованные значения полей (evalue + eenc)
export default function TrackerPanel() {
  const [events, setEvents] = useState([]);
  const [open, setOpen] = useState(true);

  useEffect(() => subscribeEvents(setEvents), []);

  return (
    <aside className={`tracker-panel ${open ? '' : 'collapsed'}`}>
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
              <pre>{JSON.stringify(ev.msg, null, 2)}</pre>
            </details>
          ))}
        </div>
      )}
    </aside>
  );
}
