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

# Minimal Python setup: use repo root resolved by git and install backend requirements
reporoot="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
venv_dir="${reporoot}/.venv"
py="${venv_dir}/bin/python"

if [ ! -d "${venv_dir}" ]; then
  echo "Creating venv at ${venv_dir}"
  python3 -m venv "${venv_dir}"
fi

"${py}" -m pip install --upgrade pip setuptools wheel

if [ -f "${reporoot}/backend/requirements.txt" ]; then
  "${py}" -m pip install -r "${reporoot}/backend/requirements.txt"
fi
if [ -f "${reporoot}/backend/requirements-dev.txt" ]; then
  "${py}" -m pip install -r "${reporoot}/backend/requirements-dev.txt"
fi

# Ensure Git LFS is installed and hooks are set up
if command -v git-lfs >/dev/null 2>&1; then
  echo "git-lfs found: $(git lfs version || true)"
  # Install/refresh hooks globally and for this repo (safe if already set)
  git lfs install --skip-repo || true
  git lfs install --force || true
else
  echo "git-lfs not found in PATH. Attempting install..."
  if command -v apt-get >/dev/null 2>&1; then
    sudo apt-get update -y && sudo apt-get install -y git-lfs || true
  elif command -v apk >/dev/null 2>&1; then
    sudo apk add --no-cache git-lfs || true
  elif command -v dnf >/dev/null 2>&1; then
    sudo dnf install -y git-lfs || true
  elif command -v yum >/dev/null 2>&1; then
    sudo yum install -y git-lfs || true
  fi
  if command -v git-lfs >/dev/null 2>&1; then
    git lfs install --skip-repo || true
    git lfs install --force || true
  else
    echo "Failed to install git-lfs; pushes to LFS-enabled repos may fail until it's installed."
  fi
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
