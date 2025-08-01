# Release Notes - vite-plugin-gas v0.1.15

## 🎉 What's New in v0.1.15

### 🚀 Major Improvements

#### Multiple File Input Support - STABLE
After resolving the `inlineDynamicImports` conflict, the plugin now fully supports multiple TypeScript files with zero configuration:

```typescript
// Before: Single file limitation
// After: Multiple files work seamlessly
src/
├── main.ts           → dist/main.js
├── utils/helper.ts   → dist/utils_helper.js
├── models/user.ts    → dist/models_user.js
└── api/client.ts     → dist/api_client.js
```

#### Smart File Filtering
The plugin now automatically filters out problematic files:
- Empty files (completely empty)
- Whitespace-only files
- Comment-only files without executable code

This prevents build errors and improves bundle quality.

#### ES Module Output Format
Changed from IIFE to ES module format for better Vite compatibility while maintaining GAS compatibility through transformation.
- Pre-push: Build validation + comprehensive testing
- Maintains >90% test coverage (47 total tests)

### 🧪 Testing Improvements

#### Comprehensive Integration Tests
- Added end-to-end tests for multiple file scenarios
- Empty/whitespace file handling validation
- GAS special function preservation across multiple files
- Include/exclude pattern validation for complex project structures

#### Quality Metrics
- **Test Coverage**: 95%+ maintained
- **Total Tests**: 47 (up from 40)
- **Integration Tests**: 7 new test scenarios
- **Zero Warnings**: Strict TypeScript and linting compliance

### 📋 Configuration Updates

#### Recommended vite.config.ts
```typescript
import { defineConfig } from 'vite'
import gas from 'vite-plugin-gas'

export default defineConfig({
  plugins: [
    gas({
      autoDetect: true,
      include: ['src', 'lib'],
      exclude: ['**/*.test.ts', '**/*.spec.ts'],
      outDir: 'dist'
    })
  ]
})
```

#### Works with Your Existing Setup
This release is designed to be compatible with existing configurations like:
```typescript
// Your existing manual config still works
const files = glob.sync('src/**/*.ts')
const input = {}
files.forEach((file) => {
  const name = path.relative('src', file.slice(0, -path.extname(file).length))
  input[name] = path.resolve(__dirname, file)
})
```

### 🎯 Migration Guide

#### From v0.1.10 to v0.1.15

**No Breaking Changes** - This is a bug fix release that maintains API compatibility.

If you were experiencing build errors with multiple files:
1. Update to v0.1.15: `npm install vite-plugin-gas@latest`
2. Your existing configuration will work without changes
3. Build errors should be resolved automatically

#### New Project Setup
```bash
npm install vite-plugin-gas --save-dev
```

### 🔗 Integration

#### Works Seamlessly With
- **Clasp**: Deploy to Google Apps Script with `clasp push`
- **TypeScript**: Full type support with GAS API definitions
- **Vite**: Optimized for Vite 5.0+ with modern tooling
- **Git Workflows**: Automated quality checks via lefthook

### 📊 Performance

- **Build Speed**: Improved by removing unnecessary inlining operations
- **Output Size**: Optimized for GAS with proper tree-shaking disabled
- **Memory Usage**: Reduced memory footprint during large project builds

### 🐛 Bug Fixes

- Fixed `inlineDynamicImports` conflict with multiple entry files
- Resolved TypeScript strict mode compatibility issues
- Corrected output format for GAS runtime compatibility
- Fixed empty file processing edge cases

### 📈 Quality Metrics

- **Zero TypeScript Warnings**: Maintains strict type safety
- **95%+ Test Coverage**: Comprehensive test suite
- **Automated QA**: Git hooks ensure quality at every commit
- **Documentation**: Complete English documentation with examples

---

## Installation

```bash
npm install vite-plugin-gas@0.1.15 --save-dev
```

## Quick Verification

After updating, verify the fix works:

```bash
npm run build  # Should complete without inlineDynamicImports error
```

For detailed usage examples and configuration options, see the [README.md](README.md).

---

**Full Changelog**: [v0.1.10...v0.1.15](https://github.com/11gather11/vite-plugin-gas/compare/v0.1.10...v0.1.15)

```bash
# Patch release (1.0.0 → 1.0.1)
npm run version:patch

# Minor release (1.0.0 → 1.1.0)  
npm run version:minor

# Major release (1.0.0 → 2.0.0)
npm run version:major
```

### 2. Push Changes

```bash
git push origin main
```

When a version change is detected, the following processes are automatically executed:

1. **Quality Checks**: Lint, format, build execution
2. **GitHub Release Creation**: Tag and release notes generation
3. **npm Publishing**: Automatic publishing to npm registry
4. **Release Notes Update**: CHANGELOG excerpts and npm links

## Release Types

- **Patch (x.x.X)**: Bug fixes, small improvements
- **Minor (x.X.x)**: New features, backward-compatible changes
- **Major (X.x.x)**: Breaking changes, major API changes

## Pre-releases

To create pre-release versions:

```bash
# Alpha version
npm version 1.1.0-alpha.1

# Beta version  
npm version 1.1.0-beta.1

# RC version
npm version 1.1.0-rc.1
```

Pre-release versions are automatically marked as "prerelease".

## Required Configuration

### GitHub Secrets

Configure the following secrets in your repository settings:

- `NPM_TOKEN`: Access token for npm package publishing

### How to Get npm Token

1. Login to [npmjs.com](https://www.npmjs.com)
2. Profile → Access Tokens → Generate New Token
3. Select "Automation"
4. Add the generated token to GitHub Secrets settings

## Notes

- Releases are only executed when pushing to the main branch
- Releases are only created when the package.json version has changed from the previous version
- If CHANGELOG exists, the relevant version content is included in release notes
- Manual npm publish is not required (it's automated)

## Troubleshooting

### Release Not Created

1. Check if package.json version has changed
2. Confirm push was made to main branch
3. Check GitHub Actions Workflows tab for errors

### npm Publishing Fails

1. Verify NPM_TOKEN is correctly configured
2. Check if package name conflicts with existing packages
3. Verify npm account permissions

## Setup (One-time)

### 1. GitHub Repository Setup
1. Create a new repository on GitHub: `https://github.com/gather/vite-plugin-gas`
2. Push your code to the repository
3. Configure repository secrets (see Required Configuration above)

### 2. npm Package Setup
1. Ensure you have an npm account and are logged in
2. Verify the package name in package.json is available
3. Configure the NPM_TOKEN secret in GitHub

## Example Release Flow

```bash
# Make your changes
git add .
git commit -m "feat: add new transformation feature"

# Update version based on change type
npm run version:minor  # for new features

# Push to trigger release
git push origin main

# GitHub Actions will automatically:
# 1. Detect version change
# 2. Run tests and build
# 3. Create GitHub release with tag
# 4. Publish to npm
# 5. Update release notes with npm link
```

Your package will be available at: `https://www.npmjs.com/package/vite-plugin-gas`
