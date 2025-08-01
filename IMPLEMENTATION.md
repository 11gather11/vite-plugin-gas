# vite-plugin-gas 実装計画

## アーキテクチャ設計

### プラグイン構造
```
src/
├── index.ts              # プラグインエントリーポイント
├── types/
│   ├── index.ts         # 型定義
│   └── gas.d.ts         # GAS API型定義
├── transform/
│   ├── index.ts         # 変換処理のメイン
│   ├── module-transform.ts  # ESモジュール → GAS変換
│   └── code-transform.ts    # コード最適化
├── build/
│   ├── index.ts         # ビルド処理
│   └── output.ts        # 出力形式の制御
├── utils/
│   ├── gas-compat.ts    # GAS互換性チェック
│   └── logger.ts        # ログ出力
└── clasp/
    ├── index.ts         # clasp連携
    └── config.ts        # clasp設定管理
```

## MVP実装詳細（v0.1.0）

### 1. プラグイン基本構造

```typescript
// src/index.ts
import type { Plugin } from 'vite'

export interface GasPluginOptions {
  target?: 'es5' | 'es2015'
  format?: 'gas' | 'iife'
  entryFile?: string
  outputFile?: string
}

export default function gasPlugin(options: GasPluginOptions = {}): Plugin {
  return {
    name: 'vite-plugin-gas',
    // プラグイン実装
  }
}
```

### 2. 変換処理の核心機能

#### 2.1 ESモジュール変換
- **個別ファイル出力**: 指定ディレクトリ内の各TSファイルを個別のJSファイルとして出力
- **import/export削除**: GAS環境では使用できないため完全に削除
- **依存関係の展開**: インポートされた関数やクラスを同一ファイル内に展開
- **グローバルスコープ化**: 全ての関数・変数をグローバルスコープで定義

#### 2.2 GAS互換性対応
- `console.log` → `Logger.log` 変換（オプション）
- 使用不可能なAPI/機能の検出と警告
- GAS固有のグローバル変数の型チェック
- **GAS特殊関数の保護**: onEdit、onOpen、doGet等の関数名をminify時に保護

### 3. 最小限の設定オプション

```typescript
export interface GasPluginOptions {
  // 出力ターゲット（GASはES5互換が安全）
  target?: 'es5' | 'es2015'
  
  // エントリーディレクトリ（TSファイルを個別にコンパイル）
  entryDir?: string
  
  // 出力ディレクトリ
  outputDir?: string
  
  // GAS互換性チェックを有効にするか
  compatCheck?: boolean
  
  // console.log → Logger.log 変換
  replaceLogger?: boolean
  
  // import/exportを削除するか
  removeModuleStatements?: boolean
  
  // GAS特殊関数を保護するか（minify時に削除されないようにする）
  preserveGasFunctions?: boolean
}
```

## 実装優先度

### 🔴 高優先度（MVP必須）
1. **基本的なViteプラグイン構造**
2. **ディレクトリベースの個別ファイル変換**
3. **import/export文の完全削除**
4. **TypeScript → JavaScript変換**
5. **GAS特殊関数の保護機能**
6. **基本的なエラーハンドリング**

### 🟡 中優先度（v0.2.0）
1. **TypeScript型定義提供**
2. **依存関係の自動解決と展開**
3. **設定オプションの拡充**
4. **開発時のウォッチモード対応**

### 🟢 低優先度（v0.3.0以降）
1. **clasp連携**
2. **自動デプロイ**
3. **テストユーティリティ**
4. **パフォーマンス最適化**

## 技術調査項目

### 調査済み
- [ ] Viteプラグインの基本構造
- [ ] Rollupの変換フック
- [ ] TypeScriptコンパイラAPI

### 要調査
- [ ] GASでサポートされるJavaScript機能の詳細
- [ ] 既存のgas-webpack-pluginの実装方法
- [ ] Viteのバンドル結果の構造
- [ ] source map対応の可能性

## テスト計画

### 単体テスト
- [ ] 変換ロジックのテスト
- [ ] 設定オプションのテスト
- [ ] エラーハンドリングのテスト

### 統合テスト
- [ ] 実際のViteプロジェクトでの動作確認
- [ ] GAS環境での実行テスト
- [ ] パフォーマンステスト

### E2Eテスト
- [ ] サンプルプロジェクトでの動作確認
- [ ] clasp連携のテスト（後のバージョン）

## 開発環境セットアップ

### 必要なツール
- [ ] TypeScript
- [ ] Vite（開発・テスト用）
- [ ] Jest or Vitest（テスト）
- [ ] ESLint + Prettier
- [ ] Rollup（変換処理の理解用）

### サンプルプロジェクト
テスト用のGASプロジェクトを作成
- Google Sheets操作
- Drive API使用
- 複数ファイルの依存関係

## リリース計画

### v0.1.0-alpha（2週間後目標）
- 基本的な変換機能
- 単純なプロジェクトでの動作確認

### v0.1.0-beta（4週間後目標）
- エラーハンドリング改善
- ドキュメント作成
- 基本的なテストカバレッジ

### v0.1.0（6週間後目標）
- 安定版リリース
- npm公開
- 使用例とサンプル提供

---

**作成日**: 2025年8月1日  
**最終更新**: 2025年8月1日
