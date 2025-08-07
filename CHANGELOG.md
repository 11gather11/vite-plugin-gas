# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.5.0] - 2025-08-07

### ✨ New Features
- **Automatic Arrow Function Transformation**: Added GAS compatibility for arrow functions
  - Arrow functions are now automatically converted to function declarations
  - Uses esbuild's ES5 target for reliable transformation
  - No additional configuration required - works out of the box
  - Ensures compatibility with Google Apps Script runtime restrictions

### 🔧 Technical Improvements  
- **Enhanced Build Configuration**: Improved esbuild settings for GAS compatibility
  - Set `esbuild.target` and `build.target` to `es5` for maximum compatibility
  - Automatic transformation of modern JavaScript features to GAS-compatible code
  - Better integration with Vite's native transformation pipeline

### 📝 Code Examples
```javascript
// Before (TypeScript with arrow functions)
const processData = (data) => {
  return data.map(item => item * 2);
};

// After (GAS-compatible JavaScript)
function processData(data) {
  return data.map(function(item) {
    return item * 2;
  });
}
```

## [0.4.0] - 2025-08-07

### 💥 Breaking Changes
- **Removed `preserveComments` Feature**: Completely removed non-functional comment preservation feature
  - Removed `preserveComments` option from `GasPluginOptions` interface
  - Removed comment preservation logic from `applyGasViteConfig`
  - This feature was documented but not actually working (only preserved `/* @__PURE__ */` comments)
  - Users relying on this feature should use alternative comment preservation methods

### 🧪 Testing Excellence
- **Comprehensive Integration Testing**: Added 85 new tests for improved quality assurance
  - Added 47 plugin integration tests (`plugin-integration.test.ts`)
  - Added 38 end-to-end transformation pipeline tests (`end-to-end.test.ts`)
  - Integration tests cover complete plugin lifecycle (config, transform, generateBundle, writeBundle hooks)
  - E2E tests cover real-world GAS use cases (Google Sheets, Gmail automation scripts)
  - Total test count: 119 tests with 100% success rate

### 🔧 Technical Improvements
- **Enhanced Type Safety**: Fixed all TypeScript strict null check warnings
  - Added proper type guards for Vite plugin hook handling
  - Improved type safety for `ObjectHook` vs function hook scenarios
  - Fixed undefined possibility warnings with explicit null checks
- **Improved Error Handling**: Better handling of plugin hook execution
  - Graceful handling of both function and `ObjectHook` plugin hook types
  - Enhanced mock context implementation for comprehensive testing
  - Better error reporting in test scenarios

### 🎯 Code Quality
- **Zero TypeScript Warnings**: Achieved complete TypeScript strict mode compliance
- **Production-Ready Testing**: All 119 tests passing with comprehensive coverage
- **Clean Architecture**: Improved test organization with dedicated integration and E2E test suites

## [0.3.0] - 2025-08-04

### ✨ New Features
- **TypeScript Comment Preservation**: Comprehensive support for preserving comments during compilation
  - Preserves JSDoc comments (`/** ... */`)
  - Preserves line comments (`// ...`)
  - Preserves block comments (`/* ... */`)
  - Configurable via `preserveComments` option (default: `false`)

### ⚙️ New Configuration Options
- `preserveComments` (boolean, default: `false`): Preserve comments in TypeScript to JavaScript compilation

### 🔧 Technical Improvements
- **Enhanced esbuild Configuration**: Configures esbuild to preserve comments when enabled
- **Comprehensive Comment Support**: Works with all existing transformations (logger, GAS functions, module removal)
- **Backward Compatible**: Existing functionality unchanged when option is disabled

### 🧪 Testing & Quality
- **Extended Test Coverage**: 90 tests with 93.73% coverage (exceeds 90% requirement)
- **Comment Preservation Tests**: Comprehensive tests for all comment types and transformation scenarios
- **Enhanced CI/CD**: Improved test coverage exclusions for example files

### 📖 Documentation
- **Updated README**: Added comprehensive documentation for comment preservation feature
- **Usage Examples**: Detailed examples showing input/output transformation with comments
- **Sample Files**: Added example files demonstrating comment preservation functionality

## [0.2.0] - 2025-08-04

### 🛤️ Major Features
- **Automatic Path Alias Resolution**: Complete solution for TypeScript path mapping issues
  - Auto-detects path aliases from `tsconfig.json` (`compilerOptions.paths` and `baseUrl`)
  - Reads existing Vite configuration aliases
  - Falls back to common patterns (`@` → `./src`, `~` → `./src`)
  - Eliminates "failed to resolve import" errors for path aliases like `@/module`

### ⚙️ New Configuration Options
- `enablePathAliases` (boolean, default: `true`): Enable/disable path alias handling
- `autoDetectPathAliases` (boolean, default: `true`): Auto-detect from tsconfig.json and project structure
- `pathAliases` (Record<string, string>): Custom path alias mappings

### 🔧 Technical Improvements
- **Enhanced Module Resolution**: Comprehensive path alias detection system
- **Better TypeScript Integration**: Seamless integration with TypeScript path mapping
- **Improved Error Handling**: Graceful fallbacks when configuration files are not found

### 🧪 Testing
- **Comprehensive Test Coverage**: 77 tests covering all functionality including new path alias features
- **Mock-based Testing**: Robust testing of file system operations and configuration parsing

## [0.1.17] - 2025-08-04

### 🚀 Major Features
- **Built-in TypeScript Support**: Completely eliminated the need for external TypeScript plugins
  - Leverages Vite's native esbuild for TypeScript compilation
  - Plugin now runs with `enforce: 'post'` to process JavaScript after TypeScript compilation
  - Users no longer need to install or configure `@rollup/plugin-typescript`
  - Automatic TypeScript support detection and configuration

### 🔧 Technical Improvements
- **Enhanced Transform Pipeline**: Switched from processing .ts files to .js files (post-compilation)
  - Improved compatibility with Vite's built-in TypeScript handling
  - Better integration with esbuild's TypeScript compilation
  - More reliable code transformation results
- **Advanced Import/Export Removal**: Implemented comprehensive regex patterns for module statement removal
  - Handles complex import patterns including default imports, named imports, and namespace imports
  - Improved export statement detection and removal
  - Better preservation of function content during transformation
- **Enhanced GAS Function Protection**: Improved preservation of Google Apps Script special functions
  - Added `@preserve` comments for minification protection
  - Better detection and handling of GAS trigger functions (onEdit, onOpen, etc.)
  - Enhanced function signature preservation

### 📝 Documentation & User Experience
- **Comprehensive README Overhaul**: Complete rewrite with clear usage instructions
  - Added "What NOT to do" section to prevent common configuration mistakes
  - Detailed troubleshooting guide for common issues
  - Clear migration instructions from external TypeScript plugins
  - Enhanced configuration examples and best practices
- **Better Error Messages**: Improved logging and error handling throughout the codebase
  - More descriptive warning messages for configuration issues
  - Better feedback for TypeScript support status
  - Enhanced file detection and processing logs

### 🧪 Code Quality & Testing
- **100% Lint Compliance**: Resolved all Biome linting warnings
  - Fixed `any` type usage with proper typed mock contexts
  - Improved type safety across test files
  - Enhanced code quality standards
- **Comprehensive Test Coverage**: Maintained 62/62 passing tests
  - Added new transform tests for post-compilation processing
  - Enhanced integration tests for TypeScript workflow
  - Improved mock contexts and test reliability
- **Enhanced Build Configuration**: Improved Vite configuration for better GAS compatibility
  - Better esbuild settings for ES2017 target
  - Improved sourcemap and external dependency handling
  - Enhanced rollup options for single-file output

### 💥 Breaking Changes
- **External TypeScript Plugin Removal**: Users must remove `@rollup/plugin-typescript` from their configuration
  - Plugin now handles TypeScript compilation internally via Vite's esbuild
  - Simplified plugin configuration - just add `gas()` plugin
- **Transform Pipeline Change**: Plugin now processes JavaScript files instead of TypeScript files
  - This change is internal and should not affect end users
  - Improves compatibility with Vite's compilation process

### 🔄 Migration Guide
**Before (v0.1.16 and earlier):**
```typescript
import typescript from '@rollup/plugin-typescript'
import gas from 'vite-plugin-gas'

export default defineConfig({
  plugins: [typescript(), gas()]
})
```

**After (v0.1.17+):**
```typescript
import gas from 'vite-plugin-gas'

export default defineConfig({
  plugins: [gas()] // That's it!
})
```

## [0.1.16] - 2025-08-01

### 🚀 New Features
- **Automatic appsscript.json Copying**: Added `copyAppsscriptJson` option to automatically copy appsscript.json to build output directory
  - Configurable via plugin options (default: `true`)
  - Integrated with Vite's `writeBundle` hook for seamless deployment preparation
  - Includes proper error handling and logging for copy operations

### 🧪 Testing & Quality
- **Enhanced Test Coverage**: Achieved >97% test coverage with comprehensive testing suite
  - Added complete test coverage for `fileDetector.ts` with filesystem mocking
  - Added `writeBundle` hook testing with proper plugin context simulation
  - Enhanced `appsscriptCopier` testing with edge case coverage
- **TypeScript Integration**: Added `type-check` script for development workflow
  - Integrated TypeScript compilation checking in package.json scripts
  - Updated CI/CD pipeline to use consistent type checking commands
- **Code Quality**: Fixed all TypeScript type errors and improved type safety
  - Updated test files to include new `copyAppsscriptJson` property in option types
  - Ensured full compatibility with `Required<GasPluginOptions>` interface

### 🛠️ Developer Experience
- **Improved Documentation**: Enhanced code documentation and inline comments
- **Quality Assurance**: All 63 tests passing with comprehensive validation
- **CI/CD Consistency**: Standardized GitHub Actions workflow commands

## [0.1.15] - 2025-08-01

### 🚀 Multiple File Input Support
- **Fixed Build Error**: Resolved `inlineDynamicImports` conflict with multiple entry files
- **ES Module Output**: Changed output format from IIFE to ES modules for better Vite compatibility
- **GAS Optimization**: Added `treeshake: false`, `minify: false`, and `target: 'es2017'` for GAS compatibility
- **Empty File Filtering**: Added automatic filtering of empty and comment-only TypeScript files
- **Integration Tests**: Added comprehensive tests for multiple file scenarios and edge cases
- **Lefthook Integration**: Integrated Git hooks for automated quality assurance

### 🧪 Testing Improvements
- **Coverage**: Maintained >90% test coverage with 47+ total tests
- **Integration Testing**: Added end-to-end tests for multiple file transformations
- **Edge Case Handling**: Added tests for minimal functions, constants-only files, and comment-only files
- **GAS Function Tests**: Enhanced testing for GAS special function preservation across multiple files

### 🛠️ Developer Experience
- **Git Hooks**: Added lefthook for pre-commit linting and pre-push testing
- **Quality Gates**: Automated formatting, linting, type checking, and testing
- **Build Optimization**: Streamlined build process with better empty file handling
- **Documentation**: Updated README and documentation with comprehensive examples

## [0.1.10] - 2025-08-01

### 🔧 Module System Improvements
- **Dual Package Support**: Added support for both ESModule and CommonJS formats
  - ESModule: `dist/index.js` with `dist/index.d.ts`
  - CommonJS: `dist/index.cjs` with `dist/index.d.cts`
- **Package Exports**: Implemented proper `exports` field in package.json for modern module resolution
- **Build System**: Migrated from TypeScript compiler to tsup for better dual package generation
- **Natural TypeScript**: Removed need for `.js` extensions in TypeScript import statements
- **Custom Build Script**: Added `scripts/build.ts` following vite-plugin-pwa patterns

### 🚀 Developer Experience
- **Module Compatibility**: Fixed ESModule resolution issues that caused import errors
- **Build Tools**: Added rimraf and esno for better build pipeline management
- **Type Generation**: Automatic generation of both `.d.ts` and `.d.cts` type definitions

### 📦 Dependencies
- **Added**: `tsup@^8.5.0` for dual package building
- **Added**: `rimraf@^6.0.1` for clean directory operations
- **Added**: `esno@^4.8.0` for TypeScript execution

## [0.1.0] - 2025-08-01

### ✨ Major Improvements
- 🚀 **Complete TypeScript Architecture**: Implemented comprehensive, type-safe plugin architecture with clean separation of concerns
- 🧪 **Zero Warning Policy**: Achieved complete elimination of TypeScript and linting warnings with 94.94% test coverage (39 tests)
- 📝 **camelCase File Naming**: Migrated entire codebase to consistent camelCase naming convention for improved maintainability
- 🤖 **Advanced CI/CD Pipeline**: Implemented enterprise-grade GitHub Actions workflows with automated quality gates

### 🔧 Technical Enhancements
- **Core Architecture**: Introduced `GasConfigProcessor` and `GasTransformer` classes with clear responsibilities
- **Type Safety**: Eliminated all `any` types with proper runtime type checking and validation
- **Testing Excellence**: Comprehensive test suite with 94.94% coverage including unit, integration, and edge case testing
- **GitHub Actions**:
  - Multi-node CI testing (18, 20, 22)
  - Automated PR quality checks
  - 90%+ coverage requirement enforcement  
  - Weekly dependency updates
  - Automated npm publishing with provenance

### 📦 Developer Experience
- **File Naming**: All source files now use camelCase convention (`gasConfigProcessor.ts`, `fileDetector.ts`, etc.)
- **Error Handling**: Comprehensive error handling with proper runtime checks
- **Documentation**: Updated README with development requirements and quality standards
- **Linting**: Biome configuration with zero-warning enforcement

### 🎯 Quality Standards
- **Zero Warnings**: Complete elimination of TypeScript and linting warnings
- **Test Coverage**: 94.94% statement coverage (exceeding 90% requirement)  
- **Type Safety**: Strict TypeScript configuration with no `any` types
- **Code Quality**: Comprehensive GitHub Actions workflows enforcing quality gates

## [0.0.5] - 2025-08-01

### Fixed
- 🐛 **Build Error Fix**: Fixed "Invalid value for option output.inlineDynamicImports" error when using multiple entry points
- 🔧 **Rollup Configuration**: Properly configured output options to prevent conflicts with multiple inputs
- 📦 **Library Mode**: Disabled library mode for individual file compilation

### Technical
- Set `inlineDynamicImports: false` for multi-entry builds
- Added proper `outDir` configuration
- Improved build compatibility with Vite/Rollup defaults

## [0.0.4] - 2025-08-01

### Added  
- 🚀 **Auto-Detection Feature**: Automatically detects all `.ts` files in the entry directory
- 🔍 **Smart Entry Points**: No need to manually configure input files in Vite
- 📁 **Directory Structure Preservation**: Maintains folder structure in output file names
- 📦 **tinyglobby Integration**: Added file globbing capabilities for TypeScript file detection

### Changed
- ♻️ **Simplified Configuration**: Users no longer need to manually specify each TypeScript file
- 🎯 **Improved Developer Experience**: Just specify `entryDir` and the plugin handles the rest
- 📚 **Updated Documentation**: Enhanced README with auto-detection examples

### Technical
- Added `tinyglobby` dependency for file pattern matching
- Implemented `detectTypeScriptFiles()` function
- Added automatic Vite configuration through `config` hook
- Enhanced logging to show detected files

## [0.0.3] - 2025-08-01

### Added  
- 🚀 **Auto-Detection Feature**: Automatically detects all `.ts` files in the entry directory
- 🔍 **Smart Entry Points**: No need to manually configure input files in Vite
- 📁 **Directory Structure Preservation**: Maintains folder structure in output file names
- 📦 **tinyglobby Integration**: Added file globbing capabilities for TypeScript file detection

### Changed
- ♻️ **Simplified Configuration**: Users no longer need to manually specify each TypeScript file
- 🎯 **Improved Developer Experience**: Just specify `entryDir` and the plugin handles the rest
- 📚 **Updated Documentation**: Enhanced README with auto-detection examples

### Technical
- Added `tinyglobby` dependency for file pattern matching
- Implemented `detectTypeScriptFiles()` function
- Added automatic Vite configuration through `config` hook
- Enhanced logging to show detected files

## [0.0.2] - 2025-08-01

### Fixed
- Fixed repository URLs in package.json for proper npm provenance
- Updated GitHub Actions workflows to use packageManager from package.json
- Resolved pnpm version conflicts in CI/CD

### Changed
- Removed rimraf dependency in favor of Node.js native fs.rmSync
- Updated pnpm setup in GitHub Actions workflows

## [0.0.1] - 2025-08-01

### Added
- Initial release of vite-plugin-gas
- Individual TypeScript file compilation for Google Apps Script
- Import/export statement removal for GAS compatibility
- GAS special function protection during minification
- Console.log to Logger.log transformation (optional)
- ES5 target compilation for maximum GAS compatibility
- TypeScript support with full type checking
- Configurable plugin options
- Comprehensive documentation and examples

### Features
- ✅ Directory-based individual file transformation
- ✅ Import/export statement removal
- ✅ GAS special function preservation (onEdit, onOpen, doGet, etc.)
- ✅ TypeScript to JavaScript compilation
- ✅ ES5 compatibility mode
- ✅ Configurable logger replacement
- ✅ Development and production build support

[Unreleased]: https://github.com/11gather11/vite-plugin-gas/compare/v0.4.0...HEAD
[0.4.0]: https://github.com/11gather11/vite-plugin-gas/releases/tag/v0.4.0
[0.3.1]: https://github.com/11gather11/vite-plugin-gas/releases/tag/v0.3.1
[0.3.0]: https://github.com/11gather11/vite-plugin-gas/releases/tag/v0.3.0
[0.2.0]: https://github.com/11gather11/vite-plugin-gas/releases/tag/v0.2.0
[0.1.18]: https://github.com/11gather11/vite-plugin-gas/releases/tag/v0.1.18
[0.1.17]: https://github.com/11gather11/vite-plugin-gas/releases/tag/v0.1.17
[0.1.16]: https://github.com/11gather11/vite-plugin-gas/releases/tag/v0.1.16
[0.1.15]: https://github.com/11gather11/vite-plugin-gas/releases/tag/v0.1.15
[0.1.10]: https://github.com/11gather11/vite-plugin-gas/releases/tag/v0.1.10
[0.1.0]: https://github.com/11gather11/vite-plugin-gas/releases/tag/v0.1.0
[0.0.5]: https://github.com/11gather11/vite-plugin-gas/releases/tag/v0.0.5
[0.0.4]: https://github.com/11gather11/vite-plugin-gas/releases/tag/v0.0.4
[0.0.3]: https://github.com/11gather11/vite-plugin-gas/releases/tag/v0.0.3
[0.0.2]: https://github.com/11gather11/vite-plugin-gas/releases/tag/v0.0.2
[0.0.1]: https://github.com/11gather11/vite-plugin-gas/releases/tag/v0.0.1
