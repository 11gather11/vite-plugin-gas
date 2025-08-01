# vite-plugin-gas

A Vite plugin for Google Apps Script development with TypeScript support.

## Features

- 🚀 **Individual file compilation** - Compiles each TypeScript file separately for GAS compatibility
- 🔄 **Module statement removal** - Removes import/export statements that are not supported in GAS
- 🛡️ **GAS function protection** - Protects special GAS functions (onEdit, onOpen, etc.) from being minified
- ⚡ **TypeScript support** - Full TypeScript support with GAS API type definitions
- 🎯 **ES5 compatibility** - Targets ES5 for maximum GAS compatibility

## Installation

```bash
npm install vite-plugin-gas --save-dev
# or
pnpm add vite-plugin-gas -D
# or
yarn add vite-plugin-gas --dev
```

## Usage

### ✨ Auto-Detection Mode (Recommended)

最もシンプルな使用方法です。プラグインが自動的に `src/` ディレクトリ内のTSファイルを検出します：

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import gas from 'vite-plugin-gas'

export default defineConfig({
  plugins: [
    gas({
      entryDir: 'src',  // TSファイルを検索するディレクトリ
      target: 'es5'     // GAS互換のためES5推奨
    })
  ]
})
```

```
📁 Project Structure:
src/
├── main.ts       # → dist/main.js
├── utils.ts      # → dist/utils.js
├── triggers.ts   # → dist/triggers.js
└── lib/
    └── helper.ts # → dist/lib_helper.js
```

### 🔧 Manual Configuration

手動でエントリーポイントを指定したい場合：

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [gas()],
  build: {
    rollupOptions: {
      input: {
        main: 'src/main.ts',
        utils: 'src/utils.ts'
      }
    }
  }
})
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `target` | `'es5' \| 'es2015'` | `'es5'` | JavaScript output target |
| `entryDir` | `string` | `'src'` | Input directory to scan for TypeScript files |
| `outputDir` | `string` | `'dist'` | Output directory |
| `compatCheck` | `boolean` | `true` | Enable GAS compatibility checks |
| `replaceLogger` | `boolean` | `false` | Replace console.log with Logger.log |
| `removeModuleStatements` | `boolean` | `true` | Remove import/export statements |
| `preserveGasFunctions` | `boolean` | `true` | Protect GAS special functions from minification |

### Project Structure

```
my-gas-project/
├── src/
│   ├── main.ts          # Main functions
│   ├── triggers.ts      # GAS trigger functions
│   └── utils/
│       └── helpers.ts   # Utility functions
├── dist/                # Build output (individual files)
│   ├── main.js
│   ├── triggers.js
│   └── helpers.js
├── vite.config.ts
└── package.json
```

### Example Code

#### Input (TypeScript)

```typescript
// src/main.ts
import { logMessage } from './utils/helpers'

function main() {
  logMessage('Hello, GAS!')
}

// src/triggers.ts
function onOpen() {
  main()
}

function onEdit(e: GoogleAppsScript.Events.SheetsOnEdit) {
  console.log('Cell edited:', e.range.getA1Notation())
}
```

#### Output (JavaScript)

```javascript
// dist/main.js
function logMessage(message) {
  Logger.log(message);
}

function main() {
  logMessage('Hello, GAS!');
}

// dist/triggers.js
/* @preserve onOpen */ function onOpen() {
  main();
}

/* @preserve onEdit */ function onEdit(e) {
  Logger.log('Cell edited:', e.range.getA1Notation());
}
```

## Protected GAS Functions

The plugin automatically protects these GAS special functions from minification:

- `onOpen()` - Triggered when a spreadsheet/document is opened
- `onEdit(e)` - Triggered when a spreadsheet is edited
- `onSelectionChange(e)` - Triggered when selection changes
- `onFormSubmit(e)` - Triggered when a form is submitted
- `doGet(e)` - HTTP GET request handler
- `doPost(e)` - HTTP POST request handler
- `onInstall(e)` - Triggered when an add-on is installed

## Scripts

```json
{
  "scripts": {
    "build": "vite build",
    "dev": "vite build --watch",
    "deploy": "npm run build && clasp push"
  }
}
```

## Requirements

- Node.js 18.0.0 or higher
- Vite 5.0.0 or higher

## Development Requirements

This project follows strict development standards:

### Code Quality Standards
- **Zero Warning Policy**: No TypeScript warnings or linting warnings are tolerated
- **Type Safety**: Strict TypeScript configuration with no `any` types
- **Test Coverage**: Minimum 90% test coverage required (currently achieving 94.94%)
- **Error Handling**: Comprehensive error handling with proper runtime type checking

### File Naming Convention
- **camelCase**: All source files use camelCase naming convention
- Examples:
  - `gasConfigProcessor.ts` (not `gas-config-processor.ts`)
  - `fileDetector.ts` (not `file-detector.ts`)
  - `viteConfig.ts` (not `vite-config.ts`)

### Testing Standards
- All new features must include comprehensive tests
- Tests must cover both success and error cases
- Mock external dependencies appropriately
- Maintain high test coverage (90%+ required)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
