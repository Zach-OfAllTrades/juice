# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Juice (`@zach-ofalltrades/juice`) is a headless, framework-agnostic React component library built on Radix UI primitives. Components ship unstyled logic + a CSS file per component, themed entirely through CSS custom properties (design tokens) — never raw color/spacing values in component styles.

## Commands

- `npm run dev` / `npm run storybook` — Storybook dev server on port 6006 (this is the primary way to visually develop/inspect components)
- `npm run build` — full library build: `vite build` (JS/CSS bundles) → `tsc -p tsconfig.build.json` (declaration files) → copies `reset.css` and `tokens.css` into `dist/styles/`
- `npm run build:watch` — `vite build --watch`
- `npm run test` — run all tests once (Vitest)
- `npm run test:watch` — Vitest watch mode
- Run a single test file: `npx vitest run src/components/atoms/Button/Button.test.tsx`
- `npm run lint` — Biome lint on `./src`
- `npm run format` — Biome format (writes)
- `npm run check` — Biome check (lint + format) on `./src`
- `npm run changeset` — record a changeset for a pending change (see Releases below)

Oxlint (`.oxlintrc.json`) is also configured for React-specific rules (`react/rules-of-hooks`, `react/only-export-components`) but Biome (`biome.json`) is the primary formatter/linter driving `lint`/`format`/`check`.

## Architecture

### Atomic design structure

Components live under `src/components/{atoms,molecules,organisms}/`, one directory per component:

```
src/components/atoms/Button/
  Button.tsx          # component
  Button.css          # styles, referencing only tokens from src/tokens/tokens.css
  Button.stories.tsx  # Storybook story
  Button.test.tsx     # Vitest + Testing Library test (not all components have one)
  index.ts             # re-exports the component/types
```

Each tier (`atoms`, `molecules`, `organisms`) has a barrel `index.ts` that re-exports its components, and `src/index.ts` re-exports all three tiers as the package root.

Tier placement follows complexity/composition, not just visual size: atoms are single native-element wrappers (Button, Input, Checkbox, Radio, Badge, Skeleton, Textarea); molecules combine a couple of atoms or add structure (ButtonGroup, InputStack, ProgressBar, Tabs); organisms are complex, often Radix-powered compound components with their own internal state/portal behavior (Accordion, Card, Drawer, Dropdown, Form, Modal, Select).

### Multiple build entry points

`vite.config.ts` builds four separate entry bundles — `index`, `atoms`, `molecules`, `organisms` — matching the `exports` map in `package.json`. Consumers can import the whole library (`@zach-ofalltrades/juice`) or a single tier (`@zach-ofalltrades/juice/atoms`) for smaller bundles. `react`/`react-dom`/`react/jsx-runtime` are externalized (peer deps), and the build is not minified — that's left to consumers' bundlers.

When adding a new component, it must be re-exported from its tier's `index.ts` to be reachable from the corresponding entry bundle.

### Design tokens (`src/tokens/tokens.css`)

`tokens.css` is the public theming API: CSS custom properties (prefixed `--juice-`) for brand/neutral/semantic colors, spacing, radius, etc. Light mode is the default (`:root`); dark mode activates via `[data-juice-theme="dark"]` on `<html>` or any ancestor. Component `.css` files must reference these tokens rather than hardcoding values, so consuming apps can re-theme by overriding the custom properties on `:root`.

### Compound component pattern (organisms)

Radix-backed organisms (e.g. `Select`, `Dropdown`, `Accordion`) follow a consistent pattern: wrap each Radix primitive part in a `forwardRef` component with a `juice-*` class name, then export both the individual named parts (`SelectTrigger`, `SelectContent`, `SelectItem`, ...) and a simplified all-in-one component (`Select`) with a declarative `options` prop for the common case. The simplified component attaches the sub-parts as static properties (`Select.Root`, `Select.Trigger`, ...) so consumers can drop down to full composition when needed.

### Styling convention

Every component's className follows `juice-{component}` with BEM-ish modifiers, e.g. `juice-btn`, `juice-btn--primary`, `juice-btn--loading`. Class lists are built by filtering an array and joining, not template-string concatenation — follow this pattern for new components.

### CSS distribution

Consumers import CSS separately from JS: `@zach-ofalltrades/juice/reset`, `@zach-ofalltrades/juice/tokens`, `@zach-ofalltrades/juice/styles` (component styles, bundled by Vite from per-component `.css` imports into `dist/styles/juice.css`). `reset.css` and `tokens.css` are plain-copied into `dist/styles/` by the `build` script rather than going through the Vite CSS bundling.

## Releases

Uses Changesets (`.changeset/`, `baseBranch: main`). Publishes to GitHub Packages (`publishConfig.registry: https://npm.pkg.github.com`). `npm run release` runs `build` then `changeset publish`. `.github/workflows/publish.yml` handles CI publishing.
