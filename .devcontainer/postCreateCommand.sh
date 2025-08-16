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

echo make setup
make setup || true

prebuild_compound_core() {
  echo "Make root"
  make all
}

if [ -n "${GOOGLE_CREDENTIALS_FOR_GITHUB_CODESPACES:-}" ]; then
  prebuild_compound_core || true
fi
