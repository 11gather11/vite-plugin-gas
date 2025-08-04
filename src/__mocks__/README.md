# Mocks Directory

This directory contains shared mock implementations for testing.

## Structure

```
__mocks__/
├── README.md               # This file
├── node_modules/           # Node.js module mocks
│   ├── fs.ts              # File system mock
│   └── tinyglobby.ts      # Glob library mock
├── vite.ts                # Vite plugin context mock
├── tsconfig.ts            # TypeScript config mock
└── gasProject.ts          # GAS project structure mock
```

## Usage

```typescript
// Automatic mocking (place in __mocks__ next to actual module)
vi.mock('tinyglobby') // Uses __mocks__/tinyglobby.ts

// Manual mocking
import { createMockViteContext } from '../__mocks__/vite'
```

## Best Practices

- Keep mocks simple and focused
- Use TypeScript for type safety
- Document mock behavior
- Keep mocks close to real implementation behavior
