# Fixtures Directory

This directory contains test data and sample files for testing.

## Structure

```
__fixtures__/
├── README.md               # This file
├── code-samples/           # Sample TypeScript/JavaScript code
│   ├── simple.ts          # Basic TypeScript code
│   ├── with-imports.ts    # Code with import statements
│   ├── gas-functions.ts   # GAS special functions
│   └── console-usage.ts   # Console.log usage examples
├── project-structures/     # Sample project configurations
│   ├── basic-project/     # Minimal project structure
│   ├── with-aliases/      # Project with path aliases
│   └── complex-project/   # Large project example
└── configs/               # Configuration files
    ├── vite.config.js     # Sample Vite configurations
    ├── tsconfig.json      # Sample TypeScript configurations
    └── appsscript.json    # Sample GAS manifest
```

## Usage

```typescript
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// Load fixture data
const sampleCode = readFileSync(
  join(__dirname, '__fixtures__/code-samples/simple.ts'),
  'utf-8'
)
```

## Best Practices

- Keep fixtures realistic and representative
- Use meaningful names
- Keep fixtures small and focused
- Document complex fixtures
