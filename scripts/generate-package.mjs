#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);

if (args.length < 1) {
  console.error(
    'Usage: node generate-package.mjs <package-name> [description]',
  );
  console.error(
    'Example: node generate-package.mjs my-feature "Feature package"',
  );
  process.exit(1);
}

const packageName = args[0];
const description = args[1] || `${packageName} package for Rineex core modules`;

// Validate package name
if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(packageName)) {
  console.error(
    'Invalid package name. Use lowercase letters, numbers, and hyphens only.',
  );
  process.exit(1);
}

const packagesDir = path.resolve(__dirname, '../packages');
const packageDir = path.join(packagesDir, packageName);

// Check if package already exists
if (fs.existsSync(packageDir)) {
  console.error(`Package directory already exists: ${packageDir}`);
  process.exit(1);
}

console.log(`📦 Creating package: @rineex/${packageName}`);
console.log(`📁 Location: ${packageDir}\n`);

// Create directory structure
const dirs = [packageDir, path.join(packageDir, 'src')];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✓ Created directory: ${path.relative(packagesDir, dir)}`);
  }
});

// Package.json template
const packageJson = {
  name: `@rineex/${packageName}`,
  version: '1.0.0',
  description,
  author: 'Rineex Team',
  main: './dist/index.js',
  module: './dist/index.mjs',
  types: './dist/index.d.ts',
  scripts: {
    'test': 'vitest run',
    'lint': "eslint 'src/**/*.ts'",
    'check-types': 'tsc --noEmit',
    'build': 'tsup',
  },
  files: ['dist/**'],
  sideEffects: false,
  devDependencies: {
    '@changesets/cli': '2.29.8',
    '@rineex/eslint-config': 'workspace:*',
    '@rineex/typescript-config': 'workspace:*',
    '@types/node': '24.10.4',
    '@vitest/ui': '4.0.16',
    'tslib': '2.8.1',
    'tsup': '8.5.1',
    'typescript': '5.9.3',
    'vite-tsconfig-paths': '6.0.2',
    'vitest': '4.0.16',
  },
  keywords: ['rineex', packageName.replace(/-/g, '-')],
  license: 'Apache-2.0',
  publishConfig: {
    provenance: true,
    access: 'public',
    registry: 'https://registry.npmjs.org',
  },
  repository: {
    type: 'git',
    url: 'https://github.com/rineex/core.git',
    directory: `packages/${packageName}`,
  },
};

// Write package.json
fs.writeFileSync(
  path.join(packageDir, 'package.json'),
  JSON.stringify(packageJson, null, 2) + '\n',
);
console.log('✓ Created package.json');

// tsconfig.json
const tsconfig = {
  compilerOptions: {
    module: 'commonjs',
    declaration: true,
    noImplicitAny: false,
    noUnusedLocals: false,
    importHelpers: true,
    removeComments: false,
    noLib: false,
    emitDecoratorMetadata: true,
    esModuleInterop: true,
    experimentalDecorators: true,
    target: 'es6',
    sourceMap: false,
    outDir: './dist',
    rootDir: '.',
    paths: {
      '@/*': ['./src/*'],
    },
    lib: ['es7', 'ES2021.WeakRef', 'ES2022'],
    types: ['node'],
  },
  include: ['src/**/*', 'tsup.config.ts', 'vitest.config.ts'],
  exclude: ['node_modules'],
};

fs.writeFileSync(
  path.join(packageDir, 'tsconfig.json'),
  JSON.stringify(tsconfig, null, 2) + '\n',
);
console.log('✓ Created tsconfig.json');

// tsconfig.build.json
const tsconfigBuild = {
  extends: './tsconfig.json',
  include: ['src/**/*', 'tsup.config.ts', 'vitest.config.ts'],
  exclude: ['node_modules', 'dist', 'test', '**/*.{spec,test}.ts'],
};

fs.writeFileSync(
  path.join(packageDir, 'tsconfig.build.json'),
  JSON.stringify(tsconfigBuild, null, 2) + '\n',
);
console.log('✓ Created tsconfig.build.json');

// tsup.config.ts
const tsupConfig = `import { defineConfig } from 'tsup';

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
`;

fs.writeFileSync(path.join(packageDir, 'tsup.config.ts'), tsupConfig);
console.log('✓ Created tsup.config.ts');

// vitest.config.ts
const vitestConfig = `import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['./src/**/*.spec.ts'],
    globals: true,
    root: './',
  },

  plugins: [tsconfigPaths()],
});
`;

fs.writeFileSync(path.join(packageDir, 'vitest.config.ts'), vitestConfig);
console.log('✓ Created vitest.config.ts');

// eslint.config.mjs
const eslintConfig = `import config from '@rineex/eslint-config/base';
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
            'builtin', // Node.js built-in modules (e.g., 'fs', 'path')
            'external', // External dependencies (e.g., 'react', 'lodash')
            'nestjs',
            'common', // Your custom group for '@/common/*'
            'internal', // Other internal imports (e.g., '~/components/Button')
            'parent', // Parent directory imports (e.g., '../utils')
            'sibling', // Same directory imports (e.g., './config')
            'index', // Index file imports (e.g., './')
          ],
          customGroups: {
            value: {
              nestjs: '@nestjs/*',
              common: '@/*', // Matches imports like '@/common/utils', '@/common/helpers', etc.
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
`;

fs.writeFileSync(path.join(packageDir, 'eslint.config.mjs'), eslintConfig);
console.log('✓ Created eslint.config.mjs');

// src/index.ts
const indexTs = `/**
 * ${packageName} Package for Rineex
 * ${description}
 */

export {};
`;

fs.writeFileSync(path.join(packageDir, 'src', 'index.ts'), indexTs);
console.log('✓ Created src/index.ts');

// README.md
const readmeContent = `# ${packageName}

${description}

## Installation

\`\`\`bash
pnpm add @rineex/${packageName}
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
`;

fs.writeFileSync(path.join(packageDir, 'README.md'), readmeContent);
console.log('✓ Created README.md');

console.log(`\n✅ Package created successfully!\n`);
console.log(`Next steps:`);
console.log(`  1. Run: pnpm install`);
console.log(`  2. Start developing in: packages/${packageName}/src`);
console.log(`  3. Add exports to: packages/${packageName}/src/index.ts`);
console.log(`\nUseful commands:`);
console.log(`  pnpm -F @rineex/${packageName} build    - Build the package`);
console.log(`  pnpm -F @rineex/${packageName} test     - Run tests`);
console.log(`  pnpm -F @rineex/${packageName} lint     - Lint code`);
