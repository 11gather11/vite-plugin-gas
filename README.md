# vite-plugin-gas

[![npm version](https://badge.fury.io/js/vite-plugin-gas.svg)](https://badge.fury.io/js/vite-plugin-gas)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-Plugin-646CFF.svg)](https://vitejs.dev/)
[![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-Compatible-34A853.svg)](https://developers.google.com/apps-script)

A Vite plugin for Google Apps Script development with TypeScript support.

## Features

- 🚀 **Built-in TypeScript Support** - Uses Vite's native esbuild for TypeScript compilation (no external TypeScript plugin required)
- 🛤️ **Auto Path Alias Resolution** - Automatically detects and configures path aliases from tsconfig.json, Vite config, and common patterns
- 🔄 **Module Statement Removal** - Automatically removes import/export statements unsupported by GAS
- ⚡ **Arrow Function Transformation** - Automatically converts arrow functions to function declarations for GAS library compatibility
- 🛡️ **GAS Function Protection** - Preserves special GAS functions (onEdit, onOpen, etc.) from optimization
- ⚡ **Zero Configuration** - Works out-of-the-box with minimal setup
- 🎯 **Modern JS Compatibility** - Optimized for Google Apps Script runtime with ES2017 target and automatic arrow function transformation
- 📁 **Auto-Detection** - Automatically detects TypeScript files in specified directories
- 🧹 **Smart File Filtering** - Automatically filters out empty files and comment-only files
- 🔍 **console.log Transform** - Optionally transforms console.log to Logger.log for GAS compatibility
- 📋 **appsscript.json Copy** - Automatically copies appsscript.json to output directory for deployment

## Installation

```bash
npm install vite-plugin-gas --save-dev
# or
pnpm add vite-plugin-gas -D
# or
yarn add vite-plugin-gas --dev
```

## Quick Start

### ✨ Simple Setup (Recommended)

No need for additional TypeScript plugins! This plugin leverages Vite's built-in TypeScript support:

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import gas from 'vite-plugin-gas'

export default defineConfig({
  plugins: [
    gas() // That's it! No additional TypeScript plugin needed
  ]
})
```
```

### 🎯 Advanced Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import gas from 'vite-plugin-gas'

export default defineConfig({
  plugins: [
    gas({
      // File detection
      autoDetect: true,
      include: ['src', 'lib'],
      exclude: ['**/*.test.ts', '**/*.spec.ts'],
      outDir: 'dist',
      
      // Code transformation
      transformLogger: true,
      copyAppsscriptJson: true,
      
      // Path aliases (auto-detected by default)
      enablePathAliases: true,
      autoDetectPathAliases: true,
      pathAliases: {
        '@': './src',
        '@lib': './lib',
        '~': './src'
      }
    })
  ]
})
})
```

### ❌ What NOT to do

**Before** (with this plugin, you no longer need this):

```typescript
// DON'T DO THIS - No longer needed!
import typescript from '@rollup/plugin-typescript'
import { defineConfig } from 'vite'
import gas from 'vite-plugin-gas'

export default defineConfig({
  plugins: [
    typescript(), // ❌ Not needed - vite-plugin-gas handles TypeScript
    gas(),
  ],
})
```

**After** (correct usage):

```typescript
// ✅ Simple and clean
import { defineConfig } from 'vite'
import gas from 'vite-plugin-gas'

export default defineConfig({
  plugins: [
    gas(), // ✅ Handles TypeScript automatically
  ],
})
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `autoDetect` | `boolean` | `true` | Enable automatic TypeScript file detection |
| `include` | `string[]` | `['src']` | Directories to include when scanning for files |
| `exclude` | `string[]` | `['**/*.test.ts', '**/*.spec.ts']` | File patterns to exclude |
| `outDir` | `string` | `'dist'` | Output directory for compiled files |
| `transformLogger` | `boolean` | `true` | Replace console.log with Logger.log for GAS |
| `copyAppsscriptJson` | `boolean` | `true` | Automatically copy appsscript.json to output directory |
| `enablePathAliases` | `boolean` | `true` | Enable automatic path aliases configuration |
| `autoDetectPathAliases` | `boolean` | `true` | Auto-detect path aliases from tsconfig.json and project structure |
| `pathAliases` | `Record<string, string>` | `{ '@': './src', '~': './src' }` | Custom path aliases for module resolution |

## How It Works

### TypeScript Compilation Process

1. **Vite's esbuild** compiles TypeScript to JavaScript with ES2017 target for modern GAS compatibility
   - Uses ES2017 features like async/await, const/let, and more
   - Preserves modern JavaScript features supported by GAS runtime
2. **vite-plugin-gas** processes both TypeScript and JavaScript files:
   - Converts arrow functions to function declarations for GAS library compatibility
   - Removes import/export statements
   - Transforms console.log to Logger.log (optional)
   - Preserves GAS special functions
   - Bundles dependencies

### Example Transformation

**Input (TypeScript):**
```typescript
// src/main.ts
import { helper } from './utils/helper'

// Arrow functions (automatically converted for GAS compatibility)
const processData = (data: any[]) => {
  return data.map(item => item * 2)
}

const greetUser = (name: string) => `Hello, ${name}!`

/**
 * Handle spreadsheet edit events
 * @param {GoogleAppsScript.Events.SheetsOnEdit} e - Edit event
 */
export function onEdit(e: GoogleAppsScript.Events.SheetsOnEdit) {
  // Log the edit event
  console.log('Edit detected')
  const processed = processData([1, 2, 3])
  helper.processEdit(e)
}

export function doGet(): GoogleAppsScript.HTML.HtmlOutput {
  console.log('GET request received')
  return HtmlService.createHtmlOutput('<h1>Hello GAS!</h1>')
}
```

**Output (JavaScript for GAS):**
```javascript
// dist/main.js

// Arrow functions converted to function declarations for GAS library compatibility
function processData(data) {
  return data.map(function(item) {
    return item * 2;
  });
}

function greetUser(name) {
  return "Hello, " + name + "!";
}

/**
 * Handle spreadsheet edit events
 * @param {GoogleAppsScript.Events.SheetsOnEdit} e - Edit event
 */
/* @preserve onEdit */ function onEdit(e) {
  // Log the edit event
  Logger.log('Edit detected');
  const processed = processData([1, 2, 3]);
  helper.processEdit(e);
}

/* @preserve doGet */ function doGet() {
  Logger.log('GET request received');
  return HtmlService.createHtmlOutput('<h1>Hello GAS!</h1>');
}

// helper functions are bundled here...
```

## 🛤️ Path Alias Auto-Detection

The plugin automatically detects and configures path aliases to resolve module imports correctly. This eliminates the common "failed to resolve import" errors when using TypeScript path mapping.

### Automatic Detection Sources

1. **tsconfig.json paths**: Reads `compilerOptions.paths` and `compilerOptions.baseUrl`
2. **Vite config aliases**: Detects existing `resolve.alias` configuration
3. **Common patterns**: Falls back to standard patterns like `@` → `./src`

### Example Configuration

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@lib/*": ["lib/*"],
      "@utils/*": ["src/utils/*"]
    }
  }
}
```

**Your code:**
```typescript
// src/main.ts
import { helper } from '@/utils/helper'
import { config } from '@lib/config'

export function doGet() {
  return helper.processRequest(config.apiKey)
}
```

**Result:** ✅ Imports resolve correctly, no manual Vite alias configuration needed!

### Manual Path Alias Configuration

If auto-detection doesn't cover your use case, configure manually:

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    gas({
      enablePathAliases: true,
      autoDetectPathAliases: true, // Keep auto-detection enabled
      pathAliases: {
        '@': './src',
        '@lib': './lib',
        '@shared': './shared',
        '~': './src' // Alternative alias
      }
    })
  ]
})
```

### Disabling Path Aliases

```typescript
gas({
  enablePathAliases: false // Completely disable path alias handling
})
```

## Troubleshooting

### Common Issues

**Error: "Transforming const to the configured target environment (es5) is not supported yet"**

✅ **Solution**: This plugin now uses ES2017 target and handles arrow function conversion automatically
- No need for ES5 target configuration
- Arrow functions are converted to function declarations for GAS library compatibility
- Modern JavaScript features are preserved for better performance

**Error: "X is not exported by Y"**

❌ **Before**: You needed `@rollup/plugin-typescript` to resolve this
✅ **After**: This plugin now handles TypeScript compilation automatically

**Path alias resolution errors (e.g., `@/module` not found)**

✅ **Solution**: The plugin automatically configures common path aliases (`@` and `~` pointing to `./src`)
```typescript
// Automatically supported imports
import { helper } from '@/utils/helper'
import { config } from '~/config'
```

**Custom path aliases**

✅ **Solution**: Configure custom aliases via plugin options
```typescript
gas({
  pathAliases: {
    '@': './src',
    '@lib': './lib',
    '@utils': './src/utils'
  }
})
```

**Missing imports after build**

✅ **Solution**: The plugin automatically bundles all dependencies into each output file

**GAS functions not working**

✅ **Solution**: Special GAS functions (onEdit, onOpen, etc.) are automatically preserved with `@preserve` comments

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

### Path Aliases Configuration

The plugin automatically configures path aliases for cleaner imports:

```typescript
// Default configuration
gas({
  enablePathAliases: true,  // Enable automatic path aliases
  pathAliases: {
    '@': './src',           // @/utils/helper -> src/utils/helper
    '~': './src'            // ~/config -> src/config
  }
})
```

**Custom aliases for complex projects:**

```typescript
gas({
  pathAliases: {
    '@': './src',
    '@lib': './lib',
    '@utils': './src/utils',
    '@models': './src/models',
    '@config': './config'
  }
})
```

**Usage in TypeScript files:**

```typescript
// src/main.ts
import { processData } from '@utils/processor'
import { UserModel } from '@models/user'
import { API_CONFIG } from '@config/api'

function onEdit(e: GoogleAppsScript.Events.SheetsOnEdit) {
  const userData = processData(e.range.getValue())
  const user = new UserModel(userData)
  // ... rest of your code
}
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

### appsscript.json Management

The plugin automatically copies your `appsscript.json` file to the output directory for seamless deployment:

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    gas({
      copyAppsscriptJson: true  // Default: true
    })
  ]
})
```

**Project Structure:**
```
project/
├── src/
│   ├── main.ts
│   └── utils.ts
├── appsscript.json      # Source manifest
└── dist/               # Build output
    ├── main.js
    ├── utils.js
    └── appsscript.json  # Automatically copied
```

**Benefits:**
- Ensures manifest file is always included in deployments
- Maintains consistency between source and build directories
- Works seamlessly with clasp deployment workflow
- Can be disabled if you prefer manual manifest management

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
