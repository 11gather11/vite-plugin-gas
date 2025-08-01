# vite-plugin-gas 要件定義

## プロジェクト概要

Google Apps Script (GAS) プロジェクトの開発をViteで支援するプラグイン

## 目的

- モダンなフロントエンド開発環境でGASを開発可能にする
- TypeScriptでGASプロジェクトを構築し、効率的な開発フローを提供する
- GAS特有の制約に対応した最適化とビルドプロセスを提供する

## 対象ユーザー

- [ ] GAS開発者でモダンな開発環境を使いたい人
- [ ] TypeScriptでGASを開発したい人
- [ ] チーム開発でGASプロジェクトを管理したい人
- [ ] clasp（GAS CLI）を使用している開発者

## 機能要件

### Phase 1: 基本機能
- [ ] **ディレクトリベースの個別ファイル変換**
  - 指定ディレクトリ内のTypeScriptファイルを個別にコンパイル
  - ファイル構造を保持した出力
  - import/export文の完全削除

- [ ] **GAS互換JavaScript出力**
  - ES5互換のJavaScriptコードの生成
  - GAS環境での実行可能な形式
  - グローバルスコープでの関数定義
  - GAS特殊関数の保護（onEdit、onOpen、doGet等をminify時に削除しない）

- [ ] **型定義サポート**
  - GAS固有のAPIの型定義
  - グローバル変数（SpreadsheetApp, DriveApp等）の型サポート

### Phase 2: 開発体験向上
- [ ] **開発環境改善**
  - ホットリロード対応
  - エラー表示の改善
  - デバッグサポート

- [ ] **テスト環境**
  - ローカルでのユニットテスト
  - GAS APIのモック機能
  - テストカバレッジ

### Phase 3: デプロイメント支援
- [ ] **自動デプロイ**
  - Google Apps Script APIとの連携
  - プロジェクトファイルの自動アップロード
  - バージョン管理

- [ ] **clasp連携**
  - 既存のclaspプロジェクトとの互換性
  - .clasprc.jsonの自動生成
  - appsscript.jsonの管理

## 技術仕様

### 環境要件
- **Node.js**: 18.0.0+
- **Vite**: 7.0.0+（peerDependency）
- **TypeScript**: 5.0.0+

### 出力仕様
- **ターゲット**: ES5（GAS互換）
- **モジュール形式**: IIFE（即時実行関数）またはGAS互換形式
- **ファイル構成**: 単一ファイル または 複数ファイル（GASプロジェクト構造に従う）

### プラグイン設定
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import gas from 'vite-plugin-gas'

export default defineConfig({
  plugins: [
    gas({
      // 設定オプション
      target: 'es5',
      entryDir: 'src',
      outputDir: 'dist',
      removeModuleStatements: true
    })
  ]
})
```

## 制約事項

### GAS環境の制限
- [ ] ES6モジュール非対応
- [ ] 一部のJavaScript機能の制限
- [ ] グローバルスコープでの実行
- [ ] 外部ライブラリの制限

### 技術的制約
- [ ] Viteのバンドル結果をGAS形式に変換する必要
- [ ] source mapの対応検討
- [ ] Tree shakingの最適化
- [ ] GAS特殊関数（onEdit、onOpen、doGet等）の保護設定

## 参考プロジェクト・技術

- [ ] [@google/clasp](https://github.com/google/clasp) - GAS CLI
- [ ] [gas-webpack-plugin](https://github.com/fossamagna/gas-webpack-plugin) - WebpackでのGAS対応
- [ ] [esbuild-gas-plugin](https://github.com/mahaker/esbuild-gas-plugin) - esbuildでのGAS対応

## 開発計画

### マイルストーン

#### v0.1.0 - MVP（最小実用版）
- [ ] 基本的なTypeScript → GAS変換
- [ ] ディレクトリベースの個別ファイル出力
- [ ] import/export文の削除
- [ ] 基本的なViteプラグインとしての動作
- [ ] GAS特殊関数の保護（minify対応）

#### v0.2.0 - 開発体験改善
- [ ] 複数ファイル対応
- [ ] エラーメッセージの改善
- [ ] 基本的な型定義提供

#### v0.3.0 - 実用版
- [ ] clasp連携
- [ ] テスト環境サポート
- [ ] ドキュメント整備

#### v1.0.0 - 安定版
- [ ] 全機能の実装完了
- [ ] パフォーマンス最適化
- [ ] 十分なテストカバレッジ

## 次のアクション

1. [ ] MVP仕様の詳細化
2. [ ] プラグインアーキテクチャの設計
3. [ ] 基本的な変換ロジックの実装
4. [ ] テスト環境のセットアップ

---

**作成日**: 2025年8月1日  
**最終更新**: 2025年8月1日
