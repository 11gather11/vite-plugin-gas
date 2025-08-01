# Release Guide

## Automated Release Workflow

This project uses GitHub Actions to automatically detect version changes in package.json and create releases.

## Release Process

### 1. Version Update

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
