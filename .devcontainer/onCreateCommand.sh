#!/bin/bash
set -euo pipefail -o posix

reporoot=$(git rev-parse --show-toplevel)

asdfdir=/home/vscode/.asdf

if [ -n "${GOOGLE_CREDENTIALS_FOR_GITHUB_CODESPACES:-}" ]; then
  # Suppress progressbar output of `yarn install` in GitHub Codespaces
  export CI=true
fi

append_shrc() {
  echo "$1" | tee --append ~/.bashrc ~/.zshrc > /dev/null
}

setup_volume() {
  echo "Setup docker volume permissions"
  sudo chown -R vscode:vscode \
    $asdfdir \
    ~/.config
}

setup_asdf() {
  echo "Setup asdf"

  if [ ! -d "$asdfdir/.git" ]; then
    echo "Clone asdf repository to $asdfdir"
    git clone https://github.com/asdf-vm/asdf.git $asdfdir --branch v0.12.0
  fi
  # shellcheck source=/dev/null
  source $asdfdir/asdf.sh

  # Install asdf plugins for .tool-versions
  # `asdf plugin add` fails if the plugin is already installed
  cut -d' ' -f1 .tool-versions | grep -v '#' | xargs -n1 asdf plugin add || true
  asdf install
  asdf reshim

  append_shrc "export PUPPETEER_SKIP_DOWNLOAD=true"
  append_shrc ". $asdfdir/asdf.sh"
  append_shrc ". $asdfdir/completions/asdf.bash"
  direnv_hook_bash="$(direnv hook bash)"
  direnv_hook_zsh="$(direnv hook zsh)"
  echo "$direnv_hook_bash" >> ~/.bashrc
  echo "$direnv_hook_zsh" >> ~/.zshrc
}

setup_nodejs() {
  echo "Setup nodejs"
  # Enable to use yarn command
  corepack enable
  asdf reshim nodejs

  # Install dependencies of the main yarn workspaces
  yarn install --immutable

  asdf global nodejs "$(asdf current nodejs | awk '{print $2}')"
}

setup_python() {
  echo "Setup python"
  backend_dir="$reporoot/backend"
  if [ -d "$backend_dir" ]; then
    cd "$backend_dir"
    if [ ! -d .venv ]; then
      python3 -m venv .venv
    fi
    . .venv/bin/activate
    python3 -m pip install --upgrade pip
    if [ -f requirements.txt ]; then
      pip install -r requirements.txt
    fi
  else
    echo "backend directory not found. Skip python setup."
  fi
}

prebuild_compound_core() {
   echo "Make root"
  if command -v make >/dev/null 2>&1 && [ -f backend/Makefile ]; then
    make all -C backend
  else
    echo "'make' command not found or Makefile missing in backend. Skipping."
  fi
}

setup_volume
setup_asdf
setup_nodejs
setup_python

if [ -z "${GOOGLE_CREDENTIALS_FOR_GITHUB_CODESPACES:-}" ]; then
  prebuild_compound_core
fi
