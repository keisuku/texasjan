#!/usr/bin/env bash
set -uo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
browser_bin="${BROWSER_BIN:-}"

if [[ -z "$browser_bin" ]]; then
  for candidate in google-chrome-stable google-chrome chromium chromium-browser chrome; do
    if command -v "$candidate" >/dev/null 2>&1; then
      browser_bin="$(command -v "$candidate")"
      break
    fi
  done
fi

if [[ -z "$browser_bin" || ! -x "$browser_bin" ]]; then
  printf 'ERROR  Chromium/Chromeが見つかりません。BROWSER_BIN=/path/to/chrome を指定してください。\n' >&2
  exit 2
fi

chrome_args=(
  --headless
  --disable-gpu
  --allow-file-access-from-files
  --virtual-time-budget=120000
  --dump-dom
)

if [[ "$(id -u)" -eq 0 ]]; then
  chrome_args+=(--no-sandbox)
fi

browser_tests=(acceptance hands motion skins flow mobile scoring visual-events betting progressive-lock)
failures=0

printf 'BROWSER  %s\n' "$browser_bin"

for test_name in "${browser_tests[@]}"; do
  output_file="$(mktemp)"
  "$browser_bin" "${chrome_args[@]}" "file://${repo_root}/tests/${test_name}.html" >"$output_file" 2>&1 || true

  result_block="$(sed -n '/<pre[^>]*>/,/<\/pre>/p' "$output_file")"
  if [[ "$result_block" == *"FAIL  "* || "$result_block" == *"THROWN"* || "$result_block" == *"running"* ]]; then
    printf 'FAIL     %s\n' "$test_name"
    printf '%s\n' "$result_block" | sed -E 's/<[^>]+>/ /g; s/&gt;/>/g; s/&lt;/</g; s/&amp;/\&/g'
    failures=$((failures + 1))
  elif [[ "$result_block" == *"PASS  "* ]]; then
    printf 'PASS     %s\n' "$test_name"
  else
    printf 'FAIL     %s（結果を取得できません）\n' "$test_name"
    tail -20 "$output_file"
    failures=$((failures + 1))
  fi

  rm -f "$output_file"
done

node_tests=(tests/visual-shell.js tests/cosmetic-catalog.js tests/betting-integrity.js tests/hand-strategy.js tests/play-session.js tests/game-integration.cjs)
for test_file in "${node_tests[@]}"; do
  if node "${repo_root}/${test_file}"; then
    printf 'PASS     %s\n' "$test_file"
  else
    printf 'FAIL     %s\n' "$test_file"
    failures=$((failures + 1))
  fi
done

syntax_files=(betting-engine.js betting-ai.js mahjong-score.js skins/manifest.js pot-settlement.js hand-strategy.js play-session.js play-experience.js)
for source_file in "${syntax_files[@]}"; do
  if node --check "${repo_root}/${source_file}" >/dev/null; then
    printf 'PASS     syntax:%s\n' "$source_file"
  else
    printf 'FAIL     syntax:%s\n' "$source_file"
    failures=$((failures + 1))
  fi
done

if [[ "$failures" -gt 0 ]]; then
  printf 'RESULT   %d件失敗\n' "$failures"
  exit 1
fi

printf 'RESULT   全検査PASS\n'
