# vite-plugin-gas API リファレンス

## インストール

```bash
npm install vite-plugin-gas --save-dev
# または
pnpm add vite-plugin-gas -D
# または
yarn add vite-plugin-gas --dev
```

## 基本的な使用方法

### vite.config.ts
```typescript
import { defineConfig } from 'vite'
import gas from 'vite-plugin-gas'

export default defineConfig({
  plugins: [
    gas({
      // 基本設定
      target: 'es5',
      entryDir: 'src',
      outputDir: 'dist'
    })
  ]
})
```

## 設定オプション

### GasPluginOptions

| オプション | 型 | デフォルト | 説明 |
|-----------|--------|----------|------|
| `target` | `'es5' \| 'es2015'` | `'es5'` | JavaScript出力ターゲット |
| `entryDir` | `string` | `'src'` | 入力ディレクトリ（TSファイルを再帰的にスキャン） |
| `outputDir` | `string` | `'dist'` | 出力ディレクトリ |
| `compatCheck` | `boolean` | `true` | GAS互換性チェックを有効にする |
| `replaceLogger` | `boolean` | `false` | console.log → Logger.log 変換 |
| `removeModuleStatements` | `boolean` | `true` | import/export文を削除 |
| `preserveGasFunctions` | `boolean` | `true` | GAS特殊関数をminify時に保護 |
| `minify` | `boolean` | `false` | コードの最小化 |
| `sourceMap` | `boolean` | `false` | ソースマップ生成（将来対応予定） |

### 詳細設定

```typescript
export default defineConfig({
  plugins: [
    gas({
      target: 'es5',
      entryDir: 'src',
      outputDir: 'dist',
      
      // GAS互換性オプション
      compatCheck: true,
      replaceLogger: true,
      removeModuleStatements: true,
      preserveGasFunctions: true,
      
      // 出力オプション
      minify: process.env.NODE_ENV === 'production',
      
      // 高度なオプション（将来対応予定）
      clasp: {
        enabled: false,
        configFile: '.clasp.json',
        deploy: false
      },
      
      // 変換オプション
      transform: {
        removeComments: true,
        replaceConsole: true,
        strictMode: false
      }
    })
  ]
})
```

## プロジェクト構造例

### 推奨ディレクトリ構造
```
my-gas-project/
├── src/
│   ├── main.ts          # メイン処理
│   ├── triggers.ts      # トリガー関数
│   ├── utils/
│   │   └── helpers.ts   # ユーティリティ関数
│   └── modules/
│       ├── sheets.ts    # Google Sheets操作
│       └── drive.ts     # Google Drive操作
├── dist/                # ビルド出力（個別ファイル）
│   ├── main.js
│   ├── triggers.js
│   ├── helpers.js
│   ├── sheets.js
│   └── drive.js
├── vite.config.ts       # Vite設定
├── tsconfig.json        # TypeScript設定
└── package.json
```

### サンプルコード

#### src/main.ts
```typescript
// import文は変換時に削除される
import { logMessage } from './utils/helpers'
import { createSpreadsheet } from './modules/sheets'

function main() {
  logMessage('GAS application started')
  
  const sheet = createSpreadsheet('My New Sheet')
  sheet.getRange('A1').setValue('Hello, GAS!')
}
```

#### src/triggers.ts
```typescript
import { main } from './main'
import { logMessage } from './utils/helpers'

// GAS用のグローバル関数として公開
function onOpen() {
  main()
}

// スプレッドシート編集時のトリガー
function onEdit(e: GoogleAppsScript.Events.SheetsOnEdit) {
  logMessage(`Cell ${e.range.getA1Notation()} was edited`)
}

// 時間駆動トリガー用
function scheduledFunction() {
  logMessage('Scheduled function executed')
}

// Web アプリ用
function doGet(e: GoogleAppsScript.Events.DoGet) {
  return HtmlService.createHtmlOutput('Hello, World!')
}

// API エンドポイント用
function doPost(e: GoogleAppsScript.Events.DoPost) {
  return ContentService.createTextOutput('Data received')
}
```

#### src/modules/sheets.ts
```typescript
export function createSpreadsheet(name: string): GoogleAppsScript.Spreadsheet.Spreadsheet {
  return SpreadsheetApp.create(name)
}

export function getActiveSheet(): GoogleAppsScript.Spreadsheet.Sheet {
  return SpreadsheetApp.getActiveSheet()
}

export function writeToCell(range: string, value: any): void {
  const sheet = getActiveSheet()
  sheet.getRange(range).setValue(value)
}
```

#### src/utils/helpers.ts
```typescript
export function logMessage(message: string): void {
  console.log(`[${new Date().toISOString()}] ${message}`)
}

export function formatDate(date: Date): string {
  return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss')
}
```

## 変換結果例

### 変換前 (TypeScript/ES6)

#### src/main.ts
```typescript
import { logMessage } from './utils/helpers'
import { createSpreadsheet } from './modules/sheets'

function main() {
  logMessage('Application started')
  const sheet = createSpreadsheet('Test Sheet')
}
```

#### src/utils/helpers.ts
```typescript
export function logMessage(message: string): void {
  console.log(`[${new Date().toISOString()}] ${message}`)
}
```

### 変換後 (GAS互換JavaScript)

#### dist/main.js
```javascript
// import文は削除される

function main() {
  logMessage('Application started');
  var sheet = createSpreadsheet('Test Sheet');
}
```

#### dist/helpers.js
```javascript
// export文は削除される

function logMessage(message) {
  Logger.log("[" + new Date().toISOString() + "] " + message);
}
```

**注意**: 各ファイルが個別に変換されるため、GAS上で関数を呼び出すには、すべてのファイルをプロジェクトに含める必要があります。

## GAS特殊関数の保護

### 保護される関数一覧
プラグインは以下のGAS特殊関数をminify時に自動的に保護します：

#### トリガー関数
- `onOpen()` - スプレッドシート/ドキュメントを開いた時
- `onEdit(e)` - スプレッドシートが編集された時
- `onSelectionChange(e)` - 選択範囲が変更された時
- `onFormSubmit(e)` - フォームが送信された時

#### Web アプリ関数
- `doGet(e)` - HTTP GET リクエスト処理
- `doPost(e)` - HTTP POST リクエスト処理

#### アドオン関数
- `onInstall(e)` - アドオンがインストールされた時
- `onOpen(e)` - アドオンが有効化された時

### 設定例
```typescript
gas({
  preserveGasFunctions: true, // デフォルトで有効
  minify: true,
  
  // カスタム保護関数を追加（将来対応予定）
  customPreserveFunctions: ['myCustomTrigger', 'apiHandler']
})
```

## GAS型定義の使用

### 自動的に含まれる型定義
プラグインには以下の型定義が含まれています：

```typescript
// 自動的に利用可能
declare const SpreadsheetApp: GoogleAppsScript.Spreadsheet.SpreadsheetApp
declare const DriveApp: GoogleAppsScript.Drive.DriveApp
declare const MailApp: GoogleAppsScript.Mail.MailApp
declare const Logger: GoogleAppsScript.Base.Logger
declare const Utilities: GoogleAppsScript.Utilities.Utilities
// その他のGAS API...
```

### 追加の型定義
```bash
npm install @types/google-apps-script --save-dev
```

## コマンドライン使用

### package.json scripts
```json
{
  "scripts": {
    "build": "vite build",
    "dev": "vite build --watch",
    "deploy": "npm run build && clasp push"
  }
}
```

## トラブルシューティング

### よくある問題

#### 1. モジュールが見つからない
```
Error: Cannot resolve module './utils/helpers'
```
**解決方法**: エントリーファイルのパスとインポートパスを確認

#### 2. GAS互換性エラー
```
Warning: Arrow functions are not supported in ES5 target
```
**解決方法**: `target: 'es5'` の場合、アロー関数を通常の関数に変更

#### 3. グローバル変数の型エラー
```
Error: Cannot find name 'SpreadsheetApp'
```
**解決方法**: `@types/google-apps-script` をインストール

## 制限事項

### 現在サポートされていない機能
- [ ] 動的インポート (`import()`)
- [ ] WebAssembly
- [ ] Worker threads
- [ ] ES6 Classes (ES5ターゲット時)
- [ ] Async/Await (ES5ターゲット時)

### GAS環境の制限
- 実行時間制限（6分）
- メモリ制限
- 外部URL呼び出し制限
- ファイルサイズ制限

---

**バージョン**: v0.1.0  
**最終更新**: 2025年8月1日
