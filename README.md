# ManualMaster (マニュアルマスター)

企業のナレッジ共有を効率化するためのインテリジェントなビジネスマニュアルプラットフォームです。

## 🚀 主な機能

- **高度なリッチテキストエディタ**: Tiptapベースのエディタで画像や動画を簡単に埋め込み。
- **マルチメディア対応**: サーバーサイド経由でのセキュアなメディアアップロード（CORS設定不要）。
- **カテゴリー管理**: 組織に合わせた柔軟なコンテンツ整理。
- **管理者保護**: パスワード認証によるセキュアな記事管理。

## 🛠 技術スタック

- **Frontend**: Next.js 15 (App Router), TypeScript
- **Styling**: Tailwind CSS, ShadCN UI
- **Backend**: Firebase (Firestore, Storage)
- **Deployment**: Vercel

## 🏁 セットアップ

### 1. 環境変数の設定
`.env.example` を参考に `.env` ファイルを作成し、Firebaseの認証情報を入力してください。

### 2. インストールと起動
```bash
npm install
npm run dev
```

## 🔒 セキュリティに関する重要事項

APIキーが露出した場合は、直ちに [Google Cloud Console](https://console.cloud.google.com/apis/credentials) でキーを削除し、新しいキーを発行してください。新しいキーには「ウェブサイトの制限」を設定し、特定のドメインからのリクエストのみを許可することを強く推奨します。

## 📄 ライセンス
Copyright (c) 2025 yoko-san. All rights reserved.
