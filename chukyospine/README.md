# Tomomatsu Landing Page

EJSによる開発環境とビルドシステムを備えたランディングページプロジェクト

## 機能

- ✅ EJSテンプレートエンジンによる開発
- ✅ ホットリロード機能付き開発サーバー
- ✅ SCSS → CSS自動コンパイル
- ✅ JSONファイルによる変数管理
- ✅ header/footerコンポーネント
- ✅ 本番用ビルド（HTML/CSS/JS/画像一式出力）

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

## パッケージ一覧
- express- Node.jsのWebアプリケーションフレームワーク
- ejs - テンプレートエンジン
- chokidar - ファイル監視ライブラリ（ホットリロード機能用）
- socket.io - リアルタイム双方向通信ライブラリ
- sass - CSSプリプロセッサ
- fs-extra - ファイルシステム操作の拡張ライブラリ
- path - パス操作ユーティリティ

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

## 担当

古田
