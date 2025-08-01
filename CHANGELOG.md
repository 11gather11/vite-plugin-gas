# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/gather/vite-plugin-gas/compare/v0.0.1...HEAD
[0.0.1]: https://github.com/gather/vite-plugin-gas/releases/tag/v0.0.1
