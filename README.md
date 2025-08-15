# ai-dev-template

## 開発環境（Dev Container + monorepo）

このテンプレートは VS Code Dev Containers 上で、FastAPI(backend) と Next.js(frontend) を monorepo で開発するための最小構成です。

### セットアップ手順

1. VS Code でリポジトリを開く
2. コマンドパレットから「Dev Containers: Reopen in Container」を実行
3. コンテナ起動後、自動で依存のインストールが走ります
   - Node: ルートに `package.json` があるため `yarn install` が走ります
   - Python: `backend/.venv` が作成され、`backend/requirements.txt` があれば自動インストール

### 起動

- Backend(FastAPI): `.vscode/tasks.json` の `Dev: FastAPI` を実行 → http://localhost:8000
- Frontend(Next.js): `.vscode/tasks.json` の `Dev: Next.js` を実行 → http://localhost:3000
- 両方同時: `Dev: All`

### 構成

- `backend/`
  - `app/main.py` : FastAPI エントリポイント
  - `requirements.txt`
- `frontend/`
  - Next.js(App Router)
  - `package.json`
- `.devcontainer/`
  - `Dockerfile` : Python ツールチェーン導入（OS レベル）
  - `docker-compose.yml` : 作業ディレクトリは `/workspaces/monorepo`
  - `onCreateCommand.sh` : asdf/Node の初期化、backend venv 作成 + 依存導入
  - `postCreateCommand.sh` : backend 依存導入の再チェック、`make setup` があれば実行
- `.vscode/tasks.json` : 開発用タスク

### よくある質問

- Python の仮想環境はどこ？
  - `backend/.venv` です。VS Code の Python インタープリタは devcontainer 設定で自動指定されています。
- フロントの依存が不足する/型エラーが出る
  - コンテナ内で `yarn install` が実行されるため、完了を待ってからエディタの型エラーが解消されます。

## 任意の改善（おすすめ）

- ルートに ESLint/Prettier を固定
  - `devDependencies` として `prettier` を追加し、CI で `prettier --check .` を回す
- Python ツール
  - `ruff`, `black`, `pytest.ini` を `backend/` に追加
- API の CORS 設定を環境変数化
  - 例: `ALLOWED_ORIGINS` を `.env` から読み込む
- CI/CD
  - `lint`, `type-check`, `test` を GitHub Actions に定義

---

このままコンテナを再オープンすれば、`Dev: All` でフロントとバックが同時起動できます。
