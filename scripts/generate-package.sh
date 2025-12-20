#!/bin/bash

# Package Generator Script for Rineex
# Usage: ./scripts/generate-package.sh <package-name> [description]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PACKAGES_DIR="$(dirname "$SCRIPT_DIR")/packages"

if [ -z "$1" ]; then
  echo "Usage: ./scripts/generate-package.sh <package-name> [description]"
  echo "Example: ./scripts/generate-package.sh my-feature \"Feature package\""
  exit 1
fi

PACKAGE_NAME="$1"
DESCRIPTION="${2:-$PACKAGE_NAME package for Rineex core modules}"
PACKAGE_DIR="$PACKAGES_DIR/$PACKAGE_NAME"

# Validate package name
if ! [[ "$PACKAGE_NAME" =~ ^[a-z0-9]([a-z0-9-]*[a-z0-9])?$ ]]; then
  echo "Invalid package name. Use lowercase letters, numbers, and hyphens only."
  exit 1
fi

# Check if package already exists
if [ -d "$PACKAGE_DIR" ]; then
  echo "Package directory already exists: $PACKAGE_DIR"
  exit 1
fi

echo "📦 Creating package: @rineex/$PACKAGE_NAME"
echo "📁 Location: $PACKAGE_DIR"
echo ""

# Create directories
mkdir -p "$PACKAGE_DIR/src"
echo "✓ Created directory: $PACKAGE_NAME"
echo "✓ Created directory: $PACKAGE_NAME/src"

# Create package.json
cat > "$PACKAGE_DIR/package.json" << 'EOF'
{
  "name": "@rineex/PACKAGE_NAME",
  "version": "1.0.0",
  "description": "PACKAGE_DESCRIPTION",
  "author": "Rineex Team",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "scripts": {
    "test": "vitest run",
    "lint": "eslint 'src/**/*.ts'",
    "check-types": "tsc --noEmit",
    "build": "tsup"
  },
  "files": [
    "dist/**"
  ],
  "sideEffects": false,
  "devDependencies": {
    "@changesets/cli": "2.29.8",
    "@rineex/eslint-config": "workspace:*",
    "@rineex/typescript-config": "workspace:*",
    "@types/node": "24.10.4",
    "@vitest/ui": "4.0.16",
    "tslib": "2.8.1",
    "tsup": "8.5.1",
    "typescript": "5.9.3",
    "vite-tsconfig-paths": "6.0.2",
    "vitest": "4.0.16"
  },
  "keywords": [
    "rineex",
    "PACKAGE_NAME"
  ],
  "license": "Apache-2.0",
  "publishConfig": {
    "provenance": true,
    "access": "public",
    "registry": "https://registry.npmjs.org"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/rineex/core.git",
    "directory": "packages/PACKAGE_NAME"
  }
}
EOF

sed -i "s/PACKAGE_NAME/$PACKAGE_NAME/g" "$PACKAGE_DIR/package.json"
sed -i "s/PACKAGE_DESCRIPTION/$DESCRIPTION/g" "$PACKAGE_DIR/package.json"
echo "✓ Created package.json"

# Create tsconfig.json
cat > "$PACKAGE_DIR/tsconfig.json" << 'EOF'
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "noImplicitAny": false,
    "noUnusedLocals": false,
    "importHelpers": true,
    "removeComments": false,
    "noLib": false,
    "emitDecoratorMetadata": true,
    "esModuleInterop": true,
    "experimentalDecorators": true,
    "target": "es6",
    "sourceMap": false,
    "outDir": "./dist",
    "rootDir": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "lib": ["es7", "ES2021.WeakRef", "ES2022"],
    "types": ["node"]
  },
  "include": ["src/**/*", "tsup.config.ts", "vitest.config.ts"],
  "exclude": ["node_modules"]
}
EOF
echo "✓ Created tsconfig.json"

# Create tsconfig.build.json
cat > "$PACKAGE_DIR/tsconfig.build.json" << 'EOF'
{
  "extends": "./tsconfig.json",

  "include": ["src/**/*", "tsup.config.ts", "vitest.config.ts"],
  "exclude": ["node_modules", "dist", "test", "**/*.{spec,test}.ts"]
}
EOF
echo "✓ Created tsconfig.build.json"

# Create tsup.config.ts
cat > "$PACKAGE_DIR/tsup.config.ts" << 'EOF'
import { defineConfig } from 'tsup';

export default defineConfig(() => ({
  // eslint-disable-next-line n/no-process-env
  minify: process.env.CI === 'true',
  tsconfig: 'tsconfig.build.json',
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: true,
}));
EOF
echo "✓ Created tsup.config.ts"

# Create vitest.config.ts
cat > "$PACKAGE_DIR/vitest.config.ts" << 'EOF'
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['./src/**/*.spec.ts'],
    globals: true,
    root: './',
  },

  plugins: [tsconfigPaths()],
});
EOF
echo "✓ Created vitest.config.ts"

# Create eslint.config.mjs
cat > "$PACKAGE_DIR/eslint.config.mjs" << 'EOF'
import config from '@rineex/eslint-config/base';
import db from '@rineex/eslint-config/db';

export default [
  ...config,
  ...db,

  {
    rules: {
      '@typescript-eslint/consistent-type-definitions': ['off'],
      '@typescript-eslint/consistent-type-imports': 'off',
      '@typescript-eslint/no-extraneous-class': 'off',
    },
  },
  {
    rules: {
      'perfectionist/sort-imports': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'nestjs',
            'common',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          customGroups: {
            value: {
              nestjs: '@nestjs/*',
              common: '@/*',
            },
          },

          newlinesBetween: 'always',
          type: 'line-length',

          order: 'desc',
        },
      ],
      'perfectionist/sort-objects': [
        'error',
        {
          type: 'line-length',
          order: 'desc',
        },
      ],

      'perfectionist/sort-decorators': [
        'error',
        { type: 'line-length', order: 'desc' },
      ],
    },
  },
];
EOF
echo "✓ Created eslint.config.mjs"

# Create src/index.ts
cat > "$PACKAGE_DIR/src/index.ts" << EOF
/**
 * $PACKAGE_NAME Package for Rineex
 * $DESCRIPTION
 */

export {};
EOF
sed -i "s/\$PACKAGE_NAME/$PACKAGE_NAME/g" "$PACKAGE_DIR/src/index.ts"
sed -i "s/\$DESCRIPTION/$DESCRIPTION/g" "$PACKAGE_DIR/src/index.ts"
echo "✓ Created src/index.ts"

# Create README.md
cat > "$PACKAGE_DIR/README.md" << EOF
# $PACKAGE_NAME

$DESCRIPTION

## Installation

\`\`\`bash
pnpm add @rineex/$PACKAGE_NAME
\`\`\`

## Development

\`\`\`bash
# Build the package
pnpm build

# Run tests
pnpm test

# Lint code
pnpm lint

# Check types
pnpm check-types
\`\`\`

## License

Apache-2.0
EOF
echo "✓ Created README.md"

echo ""
echo "✅ Package created successfully!"
echo ""
echo "Next steps:"
echo "  1. Run: pnpm install"
echo "  2. Start developing in: packages/$PACKAGE_NAME/src"
echo "  3. Add exports to: packages/$PACKAGE_NAME/src/index.ts"
echo ""
echo "Useful commands:"
echo "  pnpm -F @rineex/$PACKAGE_NAME build    - Build the package"
echo "  pnpm -F @rineex/$PACKAGE_NAME test     - Run tests"
echo "  pnpm -F @rineex/$PACKAGE_NAME lint     - Lint code"
