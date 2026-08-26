# Juice

**A headless, framework-agnostic React component library.** Unstyled logic, accessible-by-default primitives, and a themeable design token layer, built on [Radix UI](https://www.radix-ui.com/).

[![CI](https://github.com/Zach-OfAllTrades/juice/actions/workflows/ci.yml/badge.svg)](https://github.com/Zach-OfAllTrades/juice/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6)
![React](https://img.shields.io/badge/React-%3E%3D18-61dafb)

📖 **[View the component catalog on Storybook →](https://zach-ofalltrades.github.io/juice/)**

## Why Juice

Most component libraries force a tradeoff: ship your own design and fight to re-theme it, or build everything from scratch on top of unstyled primitives. Juice tries to split the difference —

- **Headless where it matters.** Behavior, accessibility, and keyboard interaction come from [Radix UI](https://www.radix-ui.com/) primitives; nothing is reinvented.
- **Themeable, not skinned.** Every component references CSS custom properties from a single [token contract](./src/tokens/tokens.css) — never a hardcoded color or spacing value. Re-theme the whole library by overriding tokens on `:root`.
- **Light/dark for free.** Flip `[data-juice-theme="dark"]` on `<html>` (or any ancestor) and every component follows — no per-component dark-mode logic to write.
- **Import only what you use.** Four build entry points (`index`, `atoms`, `molecules`, `organisms`) map to the package's `exports` map, so a consumer pulling in just `Button` isn't bundling `DateTimePicker`.

## Features

- 26 components across atoms, molecules, and organisms — from `Button` and `Input` to compound, Radix-powered `Select`, `DatePicker`, and `Modal`
- Full TypeScript, `strict` mode, exported prop types for every component
- Accessible by default — tested against [`@storybook/addon-a11y`](https://storybook.js.org/addons/@storybook/addon-a11y), with every intentional ARIA-pattern deviation documented inline
- Compound component pattern for complex organisms (`Select.Root`, `Select.Trigger`, `Select.Content`, …) alongside a simplified, declarative API for the common case
- 183 tests (Vitest + Testing Library), CI-enforced on every push and pull request

## Installation

Juice publishes to **GitHub Packages**, not the public npm registry. Add this to your project's `.npmrc`:

```
@zach-ofalltrades:registry=https://npm.pkg.github.com
```

Then install:

```bash
npm install @zach-ofalltrades/juice
```

> GitHub Packages requires authentication to install even public packages — see [GitHub's docs](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry) for setting up a read-scoped token.

## Quick start

```tsx
// App entry point — import once
import '@zach-ofalltrades/juice/reset'; // optional, scoped reset
import '@zach-ofalltrades/juice/tokens'; // required — the design token contract
import '@zach-ofalltrades/juice/styles'; // required — component styles

import { Button } from '@zach-ofalltrades/juice';

function App() {
  return (
    <Button variant="primary" onClick={() => console.log('saved')}>
      Save changes
    </Button>
  );
}
```

### Tree-shaking by tier

```tsx
// Pull in just one tier's bundle instead of the whole library
import { Button } from '@zach-ofalltrades/juice/atoms';
import { Tabs } from '@zach-ofalltrades/juice/molecules';
import { Select } from '@zach-ofalltrades/juice/organisms';
```

## Theming

Every component reads from the token contract in [`src/tokens/tokens.css`](./src/tokens/tokens.css). Override any subset on `:root` in your app:

```css
:root {
  --juice-color-brand: hsl(260 85% 55%);
  --juice-radius-md: 4px;
}
```

Dark mode is a single attribute — no separate dark stylesheet to maintain:

```html
<html data-juice-theme="dark">
  <!-- every Juice component now resolves dark-mode token values -->
</html>
```

## Component catalog

| Tier          | Components                                                                                                       |
| ------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Atoms**     | Badge, Button, Checkbox, Heading, Input, Radio, Skeleton, Text, Textarea, Tooltip                                 |
| **Molecules** | ButtonGroup, InputStack, ProgressBar, Row, Tabs                                                                   |
| **Organisms** | Accordion, Card, ConfirmDialog, DatePicker, DateTimePicker, Drawer, Dropdown, Form, Modal, Select, TimePicker     |

Browse every component interactively, with live prop controls and a light/dark toggle, at **[zach-ofalltrades.github.io/juice](https://zach-ofalltrades.github.io/juice/)** — or run it locally with `npm run storybook`.

## Development

```bash
git clone https://github.com/Zach-OfAllTrades/juice.git
cd juice
npm install

npm run storybook   # dev server on :6006 — the primary way to develop components
npm run test         # run the test suite once
npm run test:watch  # Vitest watch mode
npm run check        # Biome lint + format check
npm run build         # full library build (JS, CSS, and .d.ts files into dist/)
```

Every push and pull request runs lint, typecheck, tests, and a full build via [GitHub Actions](./.github/workflows/ci.yml).

See [`CLAUDE.md`](./CLAUDE.md) for architectural details — the atomic-design directory layout, the compound component pattern used by Radix-backed organisms, and the multi-entry build setup.

## Tech stack

React 19 · TypeScript · Radix UI · Vite (library mode) · Vitest + Testing Library · Storybook · Biome · Changesets

## License

[MIT](./LICENSE) © Zach Rose
