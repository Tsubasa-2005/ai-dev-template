# Backend (FastAPI)

モジュール構成と開発の基本情報です。

## ディレクトリ構成

```
backend/
  app/
    api/            # ルーター層（エンドポイント定義）
      chat.py       # POST /chat: 外部AI APIにプロキシ
      health.py     # GET  /ping: ヘルスチェック
    core/           # アプリ設定・共通初期化
      config.py     # 環境変数読み込み・設定オブジェクト
      cors.py       # CORS ミドルウェア適用
    models/         # Pydantic モデル（入出力）
      chat.py       # ChatMessage/ChatRequest/ChatResponse
    services/       # ドメインロジック/外部API呼び出し
      ai_client.py  # 外部AI API呼び出し（OpenAI互換想定）
      typing.py     # 型エイリアス
    main.py         # アプリ組み立て（create_app, ルーター登録）
  Makefile          # venv作成/テスト実行
  requirements.txt
  requirements-dev.txt
  tests/
    test_ping.py    # /ping の最小テスト
```

## エンドポイント

- GET `/ping`
  - 200 OK / `{ "status": "ok" }`
- POST `/chat`
  - リクエスト
    ```json
    {
      "model": "gpt-4o-mini",
      "messages": [
        { "role": "system", "content": "You are a helpful assistant." },
        { "role": "user", "content": "Hello" }
      ]
    }
    ```
  - レスポンス（OpenAI 互換の応答から抽出）
    ```json
    { "model": "gpt-4o-mini", "reply": "Hello! How can I help you today?" }
    ```

## 環境変数（外部 AI 接続）

- `AI_API_BASE_URL` （既定: `https://api.openai.com/v1`）
- `AI_API_PATH` （既定: `/chat/completions`）
- `AI_API_KEY` （任意: 指定時は `Authorization: Bearer` を自動付与）

## 開発

- 依存セットアップ
  - VS Code タスク「Setup: Backend deps」または `make venv`
- 開発サーバー
  - タスク「Dev: FastAPI」または `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
- テスト
  - `make test`（pytest）

## CORS

開発ではワイルドカード（`*`）を許可しています。運用では `app/core/config.py` の `cors_allow_origins` を適切に制限してください。
