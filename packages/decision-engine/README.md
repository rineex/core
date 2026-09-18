# @rineex/decision-engine

A framework-independent, publishable foundation for composing decision rules and
evaluators in Rineex applications.

## Installation

```sh
pnpm add @rineex/decision-engine
```

## Usage

```ts
import { initDecisionEngine } from '@rineex/decision-engine';

const decisionEngine = initDecisionEngine({
  name: 'checkout',
  version: '1.0.0',
});
```
