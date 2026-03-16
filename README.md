# ManualShare (マニュアルシェア)

ManualShareは、企業や組織のナレッジ共有を効率化・整理するための、インテリジェントなビジネスマニュアルプラットフォームです。

社内に散在しがちな業務マニュアル、運用ガイド、プロトコルなどのナレッジを、1つのプラットフォームに集約し、直感的なUIで閲覧・検索できます。
リッチテキストエディタを用いた見やすいマニュアルの作成、カテゴリー機能による整理、パスワード認証による安全なアクセス管理を実現しており、情報を必要とする人がすぐに適切なナレッジへたどり着ける環境を提供します。

---

## 🚀 主な機能と特徴

### 1. 整理されたナレッジハブ
カテゴリー別にマニュアルを分類でき、直感的な検索とフィルター機能で目的のドキュメントをすばやく見つけ出すことができます。

### 2. 高度なリッチテキストエディタ
Tiptapベースの高機能エディタを採用しています。太字、斜体、リスト、引用などの基本的な装飾に加え、見出し構造の整理、画像のインライン埋め込み、YouTube動画などのメディアリンクの挿入など、表現力豊かなマニュアル作成が可能です。

### 3. セキュアなメディア管理
アップロードされた画像やメディアファイルは、サーバーサイド（Vercel Blob）を経由して安全に保存・管理されます。コンテンツの肥大化を防ぎつつ、快適な表示速度を保ちます。

### 4. 管理者専用ダッシュボードとアクセス制御
サイト全体の閲覧（一般ユーザー用）と、マニュアルの作成・編集・削除を行う管理画面（管理者用）それぞれに、パスワード認証を設定できます。社外秘の情報を守りつつ、運用をスムーズに行えます。

### 5. モダンでレスポンシブなUI/UX
ShadCN UIとTailwind CSSを用いたクリーンなデザインで、PCだけでなくスマートフォンやタブレットからでも快適に閲覧・操作できます。

---

## 📂 プロジェクトのディレクトリ構成と役割

このプロジェクト（フロントエンド及びバックエンドの一部）は、Next.js (App Router) をベースに構築されており、ソースコードは主に `src/` ディレクトリ配下に整理されています。

```text
.
├── src/
│   ├── ai/          # AI関連機能（Genkit等）の設定やフローを定義（現在は無効化）
│   ├── app/         # Next.js App RouterのページコンポーネントとAPI/Server Actions
│   │   ├── actions/ # サーバーサイドで実行される処理（パスワード認証ロジック等）
│   │   ├── help/    # ヘルプページ
│   │   ├── manuals/ # マニュアル詳細画面などのルーティング
│   │   ├── settings/# 管理者用ダッシュボード（マニュアル作成・編集・管理）
│   │   ├── layout.tsx # アプリケーション全体のレイアウト設定
│   │   └── page.tsx   # ホーム画面（ナレッジハブ・マニュアル一覧）
│   ├── components/  # 再利用可能なReactコンポーネント群
│   │   ├── layout/  # ヘッダー、フッター、サイドバーなどのレイアウト要素
│   │   ├── manual/  # マニュアルのカード表示やエディタUIなどの専用コンポーネント
│   │   └── ui/      # ShadCN UIベースの汎用UI部品（ボタン、入力フォーム、ダイアログ等）
│   ├── firebase/    # Firebase (Firestore, Auth等) の初期化とクライアント/サーバー連携ロジック
│   ├── hooks/       # カスタムReactフック（トースト通知機能、レスポンシブ判定など）
│   └── lib/         # アプリケーション全体で使用するユーティリティ関数やモックデータ
├── public/          # 静的アセット（画像ファイル、ファビコンなど）
├── docs/            # 開発者向けの追加ドキュメント
├── apphosting.yaml  # Firebase App Hosting の設定ファイル
└── tailwind.config.ts # Tailwind CSSのデザイン・テーマ設定
```

---

## 🛠 技術スタック

*   **Frontend**: Next.js 15 (App Router), React 19, TypeScript
*   **Styling**: Tailwind CSS
*   **UI Components**: ShadCN UI, Radix UI, Lucide React (アイコン)
*   **Rich Text Editor**: Tiptap
*   **Database**: Firebase Firestore
*   **Media Storage**: Vercel Blob
*   **Deployment**: Vercel / Firebase App Hosting

---

## 🏁 環境構築とセットアップ

開発環境を手元に構築するための手順です。

### 1. 環境変数の設定

プロジェクトのルートディレクトリに `.env` または `.env.local` ファイルを作成し、FirebaseとVercel Blobの接続情報を記述します。

```env
# Firebase Configuration (Firebase Consoleから取得)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# アクセス認証用パスワード（環境に合わせて任意の文字列を設定）
ACCESS_PASSWORD=test    # サイト閲覧用（ホーム画面アクセス用）
ADMIN_PASSWORD=admin    # 記事管理用（/settings アクセス用）

# Vercel Blob Token (画像アップロード機能を使用する場合)
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

### 2. パッケージのインストールと起動

Node.js環境（v20以上推奨）で以下のコマンドを実行し、依存関係をインストールしてから開発サーバーを起動します。

```bash
# 依存パッケージのインストール
npm install

# 開発サーバーの起動 (デフォルトで http://localhost:9002 が開きます)
npm run dev
```

起動後、ブラウザで `http://localhost:9002` にアクセスしてください。

---

## 🔒 セキュリティに関する重要事項

*   **パスワードの変更**: 環境変数 `ACCESS_PASSWORD`（一般閲覧用）および `ADMIN_PASSWORD`（管理者用）は、本番環境へのデプロイ時には必ず**推測困難な強力なパスワード**に変更してください。
*   **APIキーの保護**: Firebaseの各種APIキーを公開リポジトリ（GitHubなど）にそのままコミットしないよう、`.env` ファイルは常に `.gitignore` に含めてください（初期状態で設定済みです）。
*   **ドメイン制限**: 本番環境で運用する際は、Google Cloud Console にて「ウェブサイトの制限」を設定し、デプロイ先の特定のドメインからのアクセスのみを許可することで、APIキーの不正利用を防ぐことを強く推奨します。

---

## 📄 ライセンス

Copyright (c) 2025 yoko-san. All rights reserved.