# Package Generator Guide

Quick and easy way to scaffold new packages in the Rineex monorepo following the
established structure and configuration standards.

## Usage

### Option 1: Using npm script (Recommended)

```bash
pnpm generate:package <package-name> [description]
```

### Option 2: Using Node.js directly

```bash
node scripts/generate-package.mjs <package-name> [description]
```

### Option 3: Using shell script

```bash
./scripts/generate-package.sh <package-name> [description]
```

## Examples

### Create a basic package

```bash
pnpm generate:package validation
```

### Create a package with description

```bash
pnpm generate:package validation "Input validation utilities"
```

### Create a more complex package

```bash
pnpm generate:package cache-manager "Redis and in-memory cache management"
```

## What Gets Generated

The generator creates a fully configured package with:

- **package.json** - Complete configuration with:
  - Proper npm scripts (build, test, lint, check-types)
  - ESM/CJS dual exports
  - TypeScript definitions
  - Workspace dependencies
  - Publishable metadata

- **TypeScript Configuration**
  - tsconfig.json
  - tsconfig.build.json (for builds)
  - Path aliases (@/\*)

- **Build Configuration**
  - tsup.config.ts (for bundling)
  - vitest.config.ts (for testing)
  - eslint.config.mjs (for linting)

- **Initial Files**
  - src/index.ts (empty export)
  - README.md (with installation and development instructions)

## Package Naming Rules

Package names must:

- Use lowercase letters, numbers, and hyphens
- Start and end with a letter or number
- Be unique in the packages directory

Examples: ✅ `auth-core`, `cache-manager`, `validation` ❌ `Auth-Core`,
`cache_manager`

## Next Steps After Generation

1. **Install dependencies**

   ```bash
   pnpm install
   ```

2. **Develop your package**
   - Add code to `packages/<name>/src/`
   - Export types/functions from `src/index.ts`
   - Create test files with `.spec.ts` suffix

3. **Common development commands**

   ```bash
   # For a specific package
   pnpm -F @rineex/<name> build
   pnpm -F @rineex/<name> test
   pnpm -F @rineex/<name> lint
   pnpm -F @rineex/<name> check-types

   # Or from the package directory
   cd packages/<name>
   pnpm build
   ```

4. **Publishing**
   - Add a changeset: `pnpm changeset`
   - Version and publish: `pnpm changeset:publish`

## Configuration Details

All generated packages use:

- **TypeScript**: v5.9.3
- **Build Tool**: tsup (for ESM/CJS bundling)
- **Test Runner**: vitest
- **Linter**: ESLint with @rineex/eslint-config
- **Node.js**: ES6 target, CommonJS module format
- **License**: Apache-2.0

## Package Structure

```
packages/<name>/
├── src/
│   └── index.ts
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── tsup.config.ts
├── vitest.config.ts
├── eslint.config.mjs
├── README.md
└── dist/               (generated after build)
```

## Tips

- Use descriptive package names that indicate their purpose
- Keep packages focused on a single responsibility
- Reference similar packages (like `ddd` or `auth-core`) as examples
- Test your package locally before publishing

## Troubleshooting

**Package already exists**

```
Error: Package directory already exists
```

Choose a different package name or remove the existing directory first.

**Invalid package name**

```
Error: Invalid package name. Use lowercase letters, numbers, and hyphens only.
```

Ensure your package name follows the naming rules above.

**Build fails after generation**

```bash
# Run pnpm install in the workspace root
cd /path/to/core
pnpm install
```

Then try building again: `pnpm -F @rineex/<name> build`
