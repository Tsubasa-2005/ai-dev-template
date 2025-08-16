#!/bin/bash
set -euo pipefail -o posix

echo "[postCreate] Installing dependencies if needed..."

echo Setup environment

asdfdir=~/.asdf
# shellcheck source=/dev/null
source $asdfdir/asdf.sh || true

append_shrc() {
  echo "$1" | tee --append ~/.bashrc ~/.zshrc > /dev/null
}

if [ ! -d .venv ]; then
  python3 -m venv .venv
fi
. .venv/bin/activate
python3 -m pip install --upgrade pip
if [ -f requirements.txt ]; then
  pip install -r requirements.txt
fi

if command -v make >/dev/null 2>&1 && [ -f Makefile ] && grep -Eq '^[[:space:]]*setup[[:space:]]*:' Makefile; then
  echo make setup
  make setup || true
else
  echo "Makefile or 'setup' target not found. Skipping make setup."
fi

prebuild_compound_core() {
  echo "Make root"
  if command -v make >/dev/null 2>&1 && [ -f Makefile ] && grep -Eq '^[[:space:]]*all[[:space:]]*:' Makefile; then
    make all
  else
    echo "Makefile or 'all' target not found at repo root. Skipping."
  fi
}

if [ -n "${GOOGLE_CREDENTIALS_FOR_GITHUB_CODESPACES:-}" ]; then
  prebuild_compound_core || true
fi
