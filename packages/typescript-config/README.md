# @rineex/typescript-config

Private shared TypeScript configuration for this workspace.

`base.json` enables strict, bundler-oriented TypeScript defaults.
`react-library.json` extends it for React libraries with DOM and JSX support.
Consume these files from workspace package `tsconfig.json` files; this package
does not provide a runtime API.
