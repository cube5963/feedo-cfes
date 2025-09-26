# Feedo - アンケートフォーム作成・管理システム

Next.js と Supabase を使用したアンケートフォーム作成・管理システムです。

## 主な機能

### 📝 フォーム作成機能
- **多様な質問タイプ**: ラジオボタン、チェックボックス、テキスト入力、星評価、スライダー、二択質問
- **ドラッグ&ドロップ**: 質問の順序を簡単に変更
- **リアルタイムプレビュー**: 作成中のフォームをリアルタイムで確認

### 📱 アンケート回答機能
- **レスポンシブデザイン**: スマートフォンでの回答に最適化
- **プログレスバー**: 回答の進捗を視覚的に表示
- **自動保存**: 「次の質問へ」ボタンを押すたびに回答を自動保存
- **回答データ管理**: Supabaseを使用した安全なデータ保存

### 📊 統計・分析機能
- **リアルタイム統計**: 回答データの集計と可視化
- **質問別分析**: 各質問タイプに応じた詳細な統計表示
- **グラフ表示**: 選択肢の分布、星評価の平均値、スライダーの統計など

## ページ構成

### プロジェクト管理
- `/project` - プロジェクト一覧
- `/project/create` - 新規プロジェクト作成
- `/project/[id]` - プロジェクト編集・管理（質問編集、統計表示、設定）

### アンケート機能
- `/preview/[projectid]/[questionid]` - フォームプレビュー
- `/answer/[projectid]/[questionid]` - アンケート回答（新機能）

### 認証
- `/account/signin` - ログイン
- `/account/signup` - 新規登録

## データベース構造

### 主要テーブル
- **Form** - フォーム情報
- **Section** - 質問情報  
- **Answer** - 回答データ
- **SectionOptions** - 質問の選択肢データ

### 既存テーブル構造

**Answerテーブル** (回答データ)：
- `AnswerUUID` (UUID, Primary Key)
- `FormUUID` (UUID, Foreign Key → Form.FormUUID)  
- `SectionUUID` (UUID, Foreign Key → Section.SectionUUID)
- `Answer` (Text) - JSON形式で回答データを保存
- `CreatedAt` (Timestamp)
- `UpdatedAt` (Timestamp)

> **注意**: 既存のSupabaseテーブル構造を使用しています。新しいテーブル作成は不要です。

## 技術スタック

- **フロントエンド**: Next.js 14 (App Router)
- **UI**: Material-UI (MUI)
- **データベース**: Supabase (PostgreSQL)
- **認証**: Supabase Auth
- **スタイリング**: Emotion (MUI内蔵)
- **TypeScript**: 型安全性の確保

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local` ファイルを作成し、Supabaseの設定を追加：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. データベース確認

Supabase Studioで以下のテーブルが存在することを確認：
- Form, Section, Answer, SectionOptions テーブル（既存）
- 必要に応じてRLSポリシーの設定

```bash
npm install
# または
yarn install
```

### 2. 環境変数の設定

`.env.local` ファイルを作成し、Supabaseの設定を追加:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. データベースセットアップ

Supabaseダッシュボードで以下のSQLを実行:

```bash
# Responseテーブルの作成
psql -f database/create_response_table.sql
```

### 4. 開発サーバーの起動

### 4. 開発サーバーの起動

```bash
npm run dev
# または
yarn dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてアプリケーションを確認できます。

## 使用方法

### アンケートの作成から回答・分析まで

1. **プロジェクト作成**: `/project/create` で新しいアンケートプロジェクトを作成
2. **質問作成**: プロジェクト編集画面で質問を追加・編集
3. **プレビュー**: 「プレビュー」ボタンでフォームの見た目を確認
4. **回答収集**: 「アンケート回答」ボタンから回答ページにアクセス
5. **統計確認**: プロジェクト管理画面の「統計」タブで回答データを分析

### 質問タイプ

- **ラジオボタン**: 単一選択質問
- **チェックボックス**: 複数選択質問  
- **テキスト入力**: 自由記述質問
- **星評価**: 1-5星または1-10星での評価
- **スライダー**: 数値範囲での評価
- **二択質問**: はい/いいえの選択

## 新機能の詳細

### アンケート回答機能
- PreviewページとUIが同一だが、回答データを自動保存
- 「次の質問へ」ボタンで回答を即座にデータベースに保存
- 回答完了時に全ての回答を確実に保存

### 統計・分析機能
- 回答者数、質問数、平均回答数の概要表示
- 質問タイプ別の詳細統計:
  - 選択肢質問: 各選択肢の選択率とグラフ表示
  - 星評価: 平均評価と評価分布
  - スライダー: 平均値、最小値、最大値
  - テキスト: 回答数と回答例の表示
  - 二択: はい/いいえの集計

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
