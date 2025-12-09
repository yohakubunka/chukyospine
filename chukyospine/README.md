# 中京スパインクリニック Landing Page

EJSによる開発環境とビルドシステムを備えたランディングページプロジェクト

## 機能

- EJSテンプレートエンジンによる開発
- ホットリロード機能付き開発サーバー
- SCSS → CSS自動コンパイル
- JSONファイルによる変数管理
- header/footerコンポーネント
- 本番用ビルド（HTML/CSS/JS/画像一式出力）

## セットアップ

```bash
# 依存関係をインストール
npm install
```

## 開発

開発サーバーを起動（ホットリロード有効）:

```bash
npm run dev
# または
npm start
```

ブラウザで `http://localhost:3000` にアクセス

## ビルド

本番用ファイルを生成:

```bash
npm run build
```

`dist/` フォルダに完成品が出力されます。このフォルダの内容をそのままFTPでサーバーにアップロードできます。

## 注意点（Next.jsではなくEJSベース）
- 本プロジェクトは Next.js ではありません。EJS + Express で静的ページを生成する構成です。`npm run dev` / `npm run build` のみ使用し、Next のコマンドや SSR/ISR はありません。
- ルーティングは静的前提で、言語切替は URL プレフィックス（/ja, /en, /zh）と `data/site.json` の文言で制御します。
- 文言や設定は `data/site.json` を更新して反映します。空の値はそのまま空で出力されるのでご注意ください。
- 開発中の出力は `public/`、本番配信用は `dist/` の内容を利用してください。

## パッケージ一覧
- express - Node.jsのWebアプリケーションフレームワーク
- ejs - テンプレートエンジン
- chokidar - ファイル監視ライブラリ（ホットリロード機能用）
- socket.io - リアルタイム双方向通信ライブラリ
- sass - CSSプリプロセッサ
- fs-extra - ファイルシステム操作の拡張ライブラリ
- path - パス操作ユーティリティ

## プロジェクト構造

```
├── src/
│   ├── pages/          # EJSページファイル
│   ├── components/     # EJSコンポーネント（header, footer）
│   └── assets/
│       ├── scss/       # SCSSファイル
│       ├── js/         # JavaScriptファイル
│       └── images/     # 画像ファイル
├── data/
│   └── site.json       # サイト変数（URL、テキストなど）
├── public/             # 開発時の静的ファイル出力先
├── dist/               # ビルド時の出力先
├── server.js           # 開発サーバー
└── build.js            # ビルドスクリプト
```

## 変数管理

`data/site.json` でサイト全体で使用する変数を管理:

```json
{
  "site": {
    "title": "サイトタイトル",
    "description": "サイト説明",
    "url": "https://example.com"
  },
  "navigation": [...],
  "contact": {...},
  "social": {...}
}
```

EJSファイル内で `<%= site.title %>` のように使用できます。
