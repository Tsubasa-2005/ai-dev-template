# syntax=docker/dockerfile:1
ARG VARIANT=bookworm
FROM mcr.microsoft.com/devcontainers/base:${VARIANT}

ARG VARIANT

# OS toolchain (curl, fontconfig) + Python toolchain + NotoSansJP install
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl fontconfig \
    python3 python3-pip python3-venv \
  && mkdir -p /usr/local/share/fonts/noto \
  && curl -L -o /usr/local/share/fonts/noto/NotoSansJP-wght.ttf "https://raw.githubusercontent.com/google/fonts/main/ofl/notosansjp/NotoSansJP%5Bwght%5D.ttf" \
  && fc-cache -fv \
  && fc-list | grep -i "Noto Sans JP" || true \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /workspaces/ai-dev-template
