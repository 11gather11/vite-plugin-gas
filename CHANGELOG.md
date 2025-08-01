# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/11gather11/vite-plugin-gas/compare/v0.0.5...HEAD
[0.0.5]: https://github.com/11gather11/vite-plugin-gas/releases/tag/v0.0.5
[0.0.4]: https://github.com/11gather11/vite-plugin-gas/releases/tag/v0.0.4
[0.0.3]: https://github.com/11gather11/vite-plugin-gas/releases/tag/v0.0.3
[0.0.2]: https://github.com/11gather11/vite-plugin-gas/releases/tag/v0.0.2
[0.0.1]: https://github.com/11gather11/vite-plugin-gas/releases/tag/v0.0.1
