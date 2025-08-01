# vite-plugin-gas

A Vite plugin for Google Apps Script development with TypeScript support.

## Features

- 🚀 **Multiple File Support** - Handles multiple TypeScript files with individual compilation
- 🔄 **Module Statement Removal** - Automatically removes import/export statements unsupported by GAS
- 🛡️ **GAS Function Protection** - Preserves special GAS functions (onEdit, onOpen, etc.) from optimization
- ⚡ **TypeScript Support** - Full TypeScript support with GAS API type definitions
- 🎯 **ES2017 Compatibility** - Optimized for Google Apps Script runtime
- 📁 **Auto-Detection** - Automatically detects TypeScript files in specified directories
- 🧹 **Smart File Filtering** - Automatically filters out empty files and comment-only files
- 🔍 **console.log Transform** - Optionally transforms console.log to Logger.log for GAS compatibility

## Installation

```bash
npm install vite-plugin-gas --save-dev
# or
pnpm add vite-plugin-gas -D
# or
yarn add vite-plugin-gas --dev
```

## Quick Start

### ✨ Auto-Detection Mode (Recommended)

The simplest way to use the plugin. It automatically detects TypeScript files in your source directories:

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import gas from 'vite-plugin-gas'

export default defineConfig({
  plugins: [
    gas({
      autoDetect: true,
      include: ['src', 'lib'],
      exclude: ['**/*.test.ts', '**/*.spec.ts'],
      outDir: 'dist',
      transformLogger: true
    })
  ]
})
```

### 📁 Project Structure Example

```
📁 Project Structure:
src/
├── main.ts           # → dist/main.js
├── utils/
│   ├── helper.ts     # → dist/utils/helper.js
│   └── common.ts     # → dist/utils/common.js
├── triggers.ts       # → dist/triggers.js
└── models/
    └── user.ts       # → dist/models/user.js
lib/
    └── api.ts        # → dist/lib/api.js
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `autoDetect` | `boolean` | `true` | Enable automatic TypeScript file detection |
| `include` | `string[]` | `['src']` | Directories to include when scanning for files |
| `exclude` | `string[]` | `['**/*.test.ts', '**/*.spec.ts']` | File patterns to exclude |
| `outDir` | `string` | `'dist'` | Output directory for compiled files |
| `transformLogger` | `boolean` | `true` | Replace console.log with Logger.log for GAS |

## Advanced Usage

### Manual Entry Configuration

If you prefer manual control over entry points:

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    gas({
      autoDetect: false  // Disable auto-detection
    })
  ],
  build: {
    rollupOptions: {
      input: {
        main: 'src/main.ts',
        triggers: 'src/triggers.ts',
        'utils/helper': 'src/utils/helper.ts'
      }
    }
  }
})
```

### Working with Clasp

This plugin works seamlessly with [clasp](https://github.com/google/clasp) for GAS deployment:

```json
// .clasp.json
{
  "scriptId": "your-script-id",
  "rootDir": "./dist"
}
```

```bash
# Build and deploy
npm run build
clasp push
```

### Handling Empty Files

The plugin gracefully handles various file states:
- ✅ Empty files (0 bytes)
- ✅ Whitespace-only files  
- ✅ Comment-only files
- ✅ Files with only type definitions
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
## Example

### Input (TypeScript)

```typescript
// src/main.ts
import { helper } from './utils/helper'

export function main() {
  console.log('Hello, GAS!')
  helper()
}

// src/utils/helper.ts
export function helper() {
  console.log('Helper function called')
}

// src/triggers.ts
function onOpen() {
  main()
}

function onEdit(e: GoogleAppsScript.Events.SheetsOnEdit) {
  console.log('Cell edited:', e.range.getA1Notation())
}
```

### Output (JavaScript)

```javascript
// dist/main.js
function helper() {
  Logger.log('Helper function called');
}

function main() {
  Logger.log('Hello, GAS!');
  helper();
}

// dist/utils/helper.js
function helper() {
  Logger.log('Helper function called');
}

// dist/triggers.js
function onOpen() {
  main();
}

function onEdit(e) {
  Logger.log('Cell edited:', e.range.getA1Notation());
}
```

## GAS Special Functions

The plugin automatically preserves these Google Apps Script special functions:

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

## Quality Assurance

This project maintains high quality standards:

### Development Standards
- **Test Coverage**: >90% maintained across all modules
- **camelCase Convention**: Consistent file naming throughout the project  

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT © [11gather11](https://github.com/11gather11)

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for details about changes in each version.
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
