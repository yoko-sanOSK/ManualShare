
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
`.env` ファイルを作成し、環境変数を入力してください。Vercelにデプロイする場合は、Vercelの管理画面で同じ環境変数を設定してください。

### 3. Firebase StorageのCORS設定 (必須)
ブラウザ（Vercel等のドメイン）からのアップロードを許可するために、CORS設定が必要です。これは **Firebaseの管理画面からは設定できない** ため、以下のいずれかの方法で実行してください。

#### 方法 A: Google Cloud Shell を使う (推奨・一番簡単)
1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス。
2. 右上のターミナルアイコン（Cloud Shell）をクリック。
3. 以下のコマンドで設定ファイルを作成：
   ```bash
   echo '[{"origin": ["*"],"method": ["GET", "POST", "PUT", "DELETE", "HEAD"],"responseHeader": ["Content-Type", "x-goog-resumable"],"maxAgeSeconds": 3600}]' > cors.json
   ```
4. バケットに適用（`YOUR_BUCKET_NAME` は Storage の `gs://...` の部分）：
   ```bash
   gsutil cors set cors.json gs://YOUR_BUCKET_NAME
   ```

#### 方法 B: 自分のPCのターミナルから行う (SDKが必要)
1. [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) をインストール。
2. ログインを実行：
   ```bash
   gcloud auth login
   ```
3. プロジェクト内の `firebase-cors.json` があるディレクトリで実行：
   ```bash
   gsutil cors set firebase-cors.json gs://YOUR_BUCKET_NAME
   ```

## 📦 デプロイ (Vercel)

Vercelのプロジェクト設定で以下の環境変数を必ず設定してください：
- `ADMIN_PASSWORD`: 管理画面へのログインパスワード。
- Firebase関連の環境変数一式（`.env.example` を参照）。

## 📄 ライセンス
Copyright (c) 2025 yoko-san. All rights reserved.
