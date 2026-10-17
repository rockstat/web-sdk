#!/usr/bin/env bash
# Синхронизация документации web-sdk с сайтом (../website).
#
#   docs-sync.sh --check     Stop-хук Claude Code: если src/, snippet/ или README.md
#                            изменились с последней синхронизации, не даёт завершить
#                            ответ и просит запустить субагента обновления документации.
#   docs-sync.sh --mark      Записать текущее состояние как синхронизированное.
#   docs-sync.sh --snippet   Скопировать snippet/snippet.html в блоки ```html на страницах сайта.
#   docs-sync.sh --status    Показать, расходится ли состояние с маркером.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SITE="${ROCKSTAT_WEBSITE_DIR:-$ROOT/../website}"
MARKER="$ROOT/.claude/docs-sync.state"
DOC_PAGES=(
  "pages/docs/guides/web-sdk/setup.mdx"
  "pages/docs/reference/web-sdk/snippet-and-configuration.mdx"
)

current_hash() {
  cd "$ROOT"
  { cat README.md snippet/snippet.html 2>/dev/null
    git ls-files -z src | xargs -0 cat 2>/dev/null
    git ls-files --others --exclude-standard -z src | xargs -0 cat 2>/dev/null
  } | shasum -a 256 | cut -c1-16
}

changed_files() {
  cd "$ROOT"
  { git status --porcelain -- src snippet README.md | awk '{print $NF}'
    git diff --name-only HEAD~1..HEAD -- src snippet README.md 2>/dev/null
  } | sort -u | tr '\n' ' '
}

case "${1:-}" in
  --mark)
    current_hash > "$MARKER"
    echo "docs-sync: marked $(cat "$MARKER")"
    ;;
  --status)
    cur=$(current_hash); last=$(cat "$MARKER" 2>/dev/null || echo none)
    [ "$cur" = "$cur" ] && echo "current=$cur marker=$last $([ "$cur" = "$last" ] && echo in-sync || echo OUT-OF-SYNC)"
    ;;
  --snippet)
    [ -d "$SITE" ] || { echo "docs-sync: website dir not found: $SITE" >&2; exit 1; }
    python3 - "$ROOT/snippet/snippet.html" "$SITE" "${DOC_PAGES[@]}" <<'PY'
import re, sys
snippet, site, pages = sys.argv[1], sys.argv[2], sys.argv[3:]
src = open(snippet).read()
script = src[src.index('<script>'):src.index('</script>') + len('</script>')]
for rel in pages:
    p = f"{site}/{rel}"
    s = open(p).read()
    m = re.search(r"```html\n<script>\n  !function.*?</script>\n```", s, re.S)
    if not m:
        print(f"docs-sync: snippet block not found in {rel}"); continue
    new = s[:m.start()] + "```html\n" + script + "\n```" + s[m.end():]
    if new != s:
        open(p, 'w').write(new); print(f"docs-sync: snippet updated in {rel}")
    else:
        print(f"docs-sync: snippet already up to date in {rel}")
PY
    ;;
  --check)
    input=$(cat || true)
    # Второй проход после блокировки: не зацикливаемся
    if [ "$(printf '%s' "$input" | jq -r '.stop_hook_active // false' 2>/dev/null)" = "true" ]; then exit 0; fi
    cur=$(current_hash); last=$(cat "$MARKER" 2>/dev/null || echo "")
    [ "$cur" = "$last" ] && exit 0
    [ -d "$SITE" ] || exit 0   # сайта рядом нет — молчим
    files=$(changed_files)
    reason="В web-sdk изменились файлы, влияющие на документацию: ${files:-src/ snippet/ README.md}. \
Запусти субагента (Agent, subagent_type general-purpose) с задачей: прочитать CLAUDE.md в $ROOT (раздел «Документация на сайте»), \
сравнить изменения (git diff) с страницами в $SITE/pages/docs/guides/web-sdk и $SITE/pages/docs/reference/web-sdk и обновить их; \
сниппет синхронизировать командой $ROOT/.claude/hooks/docs-sync.sh --snippet. \
Если документация не требует правок, так и скажи. После этого выполни $ROOT/.claude/hooks/docs-sync.sh --mark и завершай ответ."
    jq -n --arg r "$reason" '{decision:"block", reason:$r, systemMessage:"docs-sync: изменения web-sdk требуют проверки документации в ../website"}'
    ;;
  *)
    echo "usage: $0 --check | --mark | --snippet | --status" >&2; exit 2
    ;;
esac
