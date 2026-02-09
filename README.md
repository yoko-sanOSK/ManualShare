# ManualShare (マニュアルシェア)

企業のナレッジ共有を効率化するためのインテリジェントなビジネスマニュアルプラットフォームです。

## 🚀 主な機能

- **高度なリッチテキストエディタ**: Tiptapベースのエディタを採用。太字、斜体、下線、リスト、引用、コードブロックに加え、画像の埋め込みやリンク挿入に対応。
- **マルチメディア管理**: サーバーサイド（Vercel Blob）経由でのセキュアな画像アップロード機能を搭載。
- **カテゴリー & 公開範囲管理**: 組織の構造に合わせた柔軟なコンテンツ整理と、閲覧権限の可視化。
- **管理者ダッシュボード**: パスワード認証により保護された専用画面で、マニュアルの作成・編集・削除を一括管理。
- **モダンなUI/UX**: ShadCN UI と Tailwind CSS を使用した、クリーンで直感的なレスポンシブデザイン。

## 🛠 技術スタック

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: ShadCN UI / Radix UI / Lucide React
- **Editor**: Tiptap (Headless Rich Text Editor)

### Backend / Infrastructure
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth (Admin Password Verification)
- **Storage**: Vercel Blob (Media Assets)
- **AI Integration**: Genkit (AI Summarization - Currently disabled)
- **Deployment**: Vercel / Firebase App Hosting

## 🏁 セットアップ

### 1. 環境変数の設定
`.env` ファイルを作成し、以下の情報を設定してください。

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# 認証設定
ACCESS_PASSWORD=test    # サイト閲覧用（ホーム画面）
ADMIN_PASSWORD=admin    # 記事管理用

# Vercel Blob (Production only)
BLOB_READ_WRITE_TOKEN=your_token
```

### 2. インストールと起動
```bash
npm install
npm run dev
```

## 🔒 セキュリティに関する重要事項

- パスワード（`ACCESS_PASSWORD`, `ADMIN_PASSWORD`）は、デプロイ時に必ず推測困難なものに変更してください。
- APIキーを公開リポジトリに含める場合は、Google Cloud Console で「ウェブサイトの制限」を設定し、特定のドメインからのアクセスのみを許可することを強く推奨します。

## 📄 ライセンス
Copyright (c) 2025 yoko-san. All rights reserved.
