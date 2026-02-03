
# ManualMaster (マニュアルマスター)

ManualMasterは、企業のナレッジ共有を効率化するために設計された、モダンでインテリジェントなビジネスマニュアルプラットフォームです。

## 🚀 主な機能

- **リッチテキストエディタ**: Tiptapベースのエディタにより、画像や動画を含む視覚的なマニュアルを簡単に作成できます。
- **マルチメディア対応**: 画像やMP4動画のアップロード・埋め込みをサポート。
- **カテゴリー・公開範囲管理**: 組織に合わせた柔軟なコンテンツ整理と閲覧権限の設定。
- **管理者保護**: パスワード認証によるセキュアな記事管理機能。

## 🛠 テクノロジースタック

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, ShadCN UI
- **Backend/BaaS**: Firebase (Firestore, Authentication, Storage)

## 🏁 セットアップ手順

### 1. 依存関係のインストール
```bash
npm install
```

### 2. 環境変数の設定
`.env` ファイルを作成し、Firebaseコンソールから取得した設定値を入力してください（`.env.example` 参照）。

### 3. Firebase StorageのCORS設定 (必須)
ブラウザからのアップロードを許可するために、以下の手順でCORS設定を行ってください。

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセスし、プロジェクトを選択します。
2. 右上のターミナルアイコン（Cloud Shell）を開きます。
3. プロジェクト内の `firebase-cors.json` の内容をコピーして、Cloud Shell上でファイルを作成します：
   ```bash
   nano cors.json
   # 内容を貼り付けて Ctrl+O, Enter, Ctrl+X で保存
   ```
4. 以下のコマンドを実行してバケットに適用します（`YOUR_BUCKET_NAME` は Firebase Storage の `gs://...` の部分です）：
   ```bash
   gsutil cors set cors.json gs://YOUR_BUCKET_NAME
   ```

## 📦 デプロイ (Vercel)

Vercelのプロジェクト設定で以下の環境変数を必ず設定してください：
- `ADMIN_PASSWORD`: 管理画面へのログインパスワード。
- Firebase関連の環境変数一式（`NEXT_PUBLIC_FIREBASE_API_KEY` 等）。

## 📄 ライセンス
Copyright (c) 2025 yoko-san. All rights reserved.
