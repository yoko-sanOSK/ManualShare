
# ManualMaster (マニュアルマスター)

ManualMasterは、企業のナレッジ共有を効率化するために設計された、モダンでインテリジェントなビジネスマニュアルプラットフォームです。リッチテキストエディタ、メディア管理、およびセキュアな記事管理機能を提供します。

## 🚀 主な機能

- **リッチテキストエディタ**: Tiptapベースのエディタにより、画像や動画を含む視覚的なマニュアルを簡単に作成できます。
- **マルチメディア対応**: 画像やMP4動画のアップロード・埋め込みをサポート。
- **カテゴリー・公開範囲管理**: 組織に合わせた柔軟なコンテンツ整理と閲覧権限の設定。
- **検索・フィルタリング**: キーワード検索とカテゴリーフィルターによる高速な情報アクセス。
- **管理者保護**: パスワード認証によるセキュアな記事管理機能。
- **レスポンスデザイン**: Tailwind CSSとShadCN UIによる、PC・モバイル双方に最適化されたUI。

## 🛠 テクノロジースタック

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, ShadCN UI, Lucide Icons
- **Backend/BaaS**: Firebase (Firestore, Authentication, Storage)
- **Editor**: Tiptap (Rich Text Editor)

## 🏁 セットアップ手順

### 1. リポジトリのクローン
```bash
git clone https://github.com/YOUR_USERNAME/manual-master.git
cd manual-master
```

### 2. 依存関係のインストール
```bash
npm install
```

### 3. 環境変数の設定
ルートディレクトリに `.env` ファイルを作成し、以下の情報を設定してください。

```env
# 管理画面アクセス用パスワード
ADMIN_PASSWORD=admin

# Firebase設定 (src/firebase/config.ts に記述がある場合は省略可能ですが、Vercel等の環境では設定を推奨します)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. 開発サーバーの起動
```bash
npm run dev
```
ブラウザで `http://localhost:3000` を開きます。

## 📦 デプロイ (Vercel)

Vercelにデプロイする場合、プロジェクト設定の「Environment Variables」に以下の変数を必ず追加してください：

1. **`ADMIN_PASSWORD`**: 管理画面へのログインパスワード。
2. (推奨) **Firebase関連の環境変数**: `NEXT_PUBLIC_FIREBASE_API_KEY` 等、`.env.example` にある項目。

## 📄 ライセンス
Copyright (c) 2025 yoko-san. All rights reserved.
