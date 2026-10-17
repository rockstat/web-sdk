# Rockstat Web SDK

Браузерная библиотека трекинга платформы Rockstat. Источник правды по поведению — `src/`,
по публичному API и формату сообщений — `README.md`, по сниппету — `snippet/snippet.html`.

## Документация на сайте

Документация живёт в соседнем репозитории `../website` (Next.js + MDX) и обновляется вместе
с библиотекой. При изменении чего-либо из левой колонки обнови страницы из правой:

| Что изменилось в web-sdk | Страницы в `../website/pages/docs/` |
|---|---|
| `snippet/snippet.html`, версия `_sv` | `guides/web-sdk/setup.mdx`, `reference/web-sdk/snippet-and-configuration.mdx` — блок ```html копируется байт в байт: `.claude/hooks/docs-sync.sh --snippet` |
| Опции `configure` (`src/Tracker.js` defaults, README «Configuration») | `structs/web-sdk-params.csv` (основные параметры), `reference/web-sdk/snippet-and-configuration.mdx` (таблицы трекеров) |
| Методы API (`src/Tracker.js`, README «API methods») | `reference/web-sdk/js-api.mdx` |
| Формат сообщения, блоки `page`/`sess`/`user`/`browser`/`perf`/`scroll`/`lib` (`src/data/*`, `src/Tracker.js`) | `reference/web-sdk/event-struct.mdx`, `structs/event-struct.csv` (колонка JavaScript; колонку ClickHouse не трогать) |
| Автоматические события и их `data` (`src/trackers/*`) | `reference/web-sdk/auto-track.mdx` |
| Сессии: типы, перезапуск, метки (`src/trackers/SessionTracker.js`, `src/functions/pageSource.js`) | `reference/web-sdk/sessions.mdx` |
| Транспорт (`src/Transport.js`) | `reference/web-sdk/transport.mdx` |
| Синхронизация id, `identify`, GA4/Метрика (`src/syncs/*`) | `reference/web-sdk/catch-pixel.mdx` |
| Общее описание, поддержка браузеров | `reference/web-sdk/overview.mdx` |

Меню документации: `../website/data/docs.yml`. Страницы на русском, компоненты `Tip`, `Info`,
`Alert`, `Expand`, `RenderTable` из `@app/components`; CSV с разделителем `;`.

Хук `Stop` (`.claude/settings.json`) сравнивает хеш `src/`, `snippet/`, `README.md` с маркером
`.claude/docs-sync.state`. Если они менялись, он не даёт завершить ответ, пока документация не
проверена субагентом и не выполнен `.claude/hooks/docs-sync.sh --mark`. Если правки документации
не нужны, всё равно выполни `--mark`.

## Разработка

- Сборка: `npm run build` (prod, `dist/lib.js`), `npm run build:dev`.
- Демо: `npm run demo`; настройки `DEMO_SERVER`, `DEMO_PROJECT_ID`, `DEMO_HTTPS`, `DEMO_LIB` берутся
  из переменных окружения или `.env` в корне. `.env` не коммитится.
- Релиз: `make bump-patch` / `make bump-minor` (bump2version обновляет package.json, `src/Tracker.js`,
  сниппет). После смены версии сниппета синхронизируй документацию и ansible.
- Коммиты без упоминания Claude в сообщении.
