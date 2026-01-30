# Build Plan: story-to-block

## Overview

Build the `story-to-block` npm package that generates CSS token files and WordPress assets from a single JSON config. The package will be developed in a `story-to-block/` folder at the project root for prototyping, then moved to a standalone repo for publishing via GitHub Actions.

## Project Structure

```
storybook-starter/
├── story-to-block/              (the package we're building)
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── index.ts             (main entry — exports programmatic API)
│   │   ├── cli.ts               (CLI entry — npx story-to-block generate)
│   │   ├── config.ts            (reads + validates stb.config.json)
│   │   ├── generators/
│   │   │   ├── tokens-css.ts    (generates tokens.css)
│   │   │   ├── tokens-wp-css.ts (generates tokens.wp.css)
│   │   │   ├── theme-json.ts    (generates theme.json)
│   │   │   └── integrate-php.ts (generates integrate.php)
│   │   └── types.ts             (shared TypeScript types)
│   ├── templates/
│   │   └── integrate.php.tpl    (PHP template with placeholder)
│   └── tests/
│       ├── config.test.ts
│       ├── tokens-css.test.ts
│       ├── tokens-wp-css.test.ts
│       ├── theme-json.test.ts
│       └── integration.test.ts
├── stb.config.json              (config for this starter project)
├── docs/
├── src/
└── ...
```

## Phases

### Phase 1: Package Scaffold

Set up the `story-to-block/` folder as a buildable TypeScript package.

- [ ] Create `story-to-block/package.json`
  - name: `story-to-block`
  - type: module
  - bin: `./dist/cli.js`
  - main: `./dist/index.js`
  - types: `./dist/index.d.ts`
  - devDependencies: typescript, vitest
  - no runtime dependencies (Node built-ins only)
- [ ] Create `story-to-block/tsconfig.json`
  - Target ES2022, module NodeNext
  - outDir: dist
  - strict mode
- [ ] Create `story-to-block/src/types.ts`
  - `StbConfig` interface (prefix, tokensPath, outDir, tokens)
  - `TokenCategory` type (color, spacing, fontFamily, fontSize, etc.)
  - `TokenEntry` interface (value, name?, slug?)
  - `TokenGroup` type (Record<string, TokenEntry>)

### Phase 2: Config Reader

Read and validate `stb.config.json`.

- [ ] Create `story-to-block/src/config.ts`
  - `loadConfig(configPath?: string): StbConfig`
  - Defaults: `tokensPath = "src/styles/tokens.css"`, `outDir = "dist/wp"`
  - Validates required fields: `prefix`, `tokens`
  - Validates each token has a `value`
  - Validates `name` and `slug` appear together (not one without the other)
  - Clear error messages on validation failure
- [ ] Create `story-to-block/tests/config.test.ts`
  - Valid config loads correctly
  - Missing prefix throws
  - Token without value throws
  - Token with name but no slug throws
  - Defaults applied when fields omitted

### Phase 3: Token Generators

Each generator is a pure function: takes config in, returns string out.

#### 3a: tokens.css Generator

- [ ] Create `story-to-block/src/generators/tokens-css.ts`
  - `generateTokensCss(config: StbConfig): string`
  - Outputs `:root { }` block with all tokens as `--{prefix}-{category}-{key}: {value}`
  - Groups by category with CSS comments
  - Adds "auto-generated" header comment
  - Category-to-variable mapping:
    - color → `--prefix-color-{key}`
    - spacing → `--prefix-spacing-{key}`
    - fontFamily → `--prefix-font-family-{key}`
    - fontSize → `--prefix-font-size-{key}`
    - fontWeight → `--prefix-font-weight-{key}`
    - lineHeight → `--prefix-line-height-{key}`
    - radius → `--prefix-radius-{key}`
    - shadow → `--prefix-shadow-{key}`
    - transition → `--prefix-transition-{key}`
    - zIndex → `--prefix-z-{key}`
- [ ] Create `story-to-block/tests/tokens-css.test.ts`
  - Generates correct variable names
  - Groups tokens by category
  - Uses configured prefix
  - Includes header comment

#### 3b: tokens.wp.css Generator

- [ ] Create `story-to-block/src/generators/tokens-wp-css.ts`
  - `generateTokensWpCss(config: StbConfig): string`
  - Tokens with `name` + `slug` → `--{prefix}-{category}-{key}: var(--wp--preset--{wpCategory}--{slug}, {value})`
  - Tokens without → `--{prefix}-{category}-{key}: {value}` (hardcoded, same as tokens.css)
  - WordPress category mapping:
    - color (with slug) → `--wp--preset--color--{slug}`
    - spacing → `--wp--preset--spacing--{slug}`
    - fontFamily → `--wp--preset--font-family--{slug}`
    - fontSize (with slug) → `--wp--preset--font-size--{slug}`
    - fontWeight, lineHeight, radius, shadow, transition, zIndex → hardcoded only (no wp preset mapping)
  - Adds "auto-generated" header comment
- [ ] Create `story-to-block/tests/tokens-wp-css.test.ts`
  - Tokens with slug produce var() mapping
  - Tokens without slug produce hardcoded values
  - Correct WordPress preset paths per category
  - fontWeight/radius/etc. always hardcoded

#### 3c: theme.json Generator

- [ ] Create `story-to-block/src/generators/theme-json.ts`
  - `generateThemeJson(config: StbConfig): string`
  - Only includes tokens with `name` + `slug`
  - Category mapping:
    - color → `settings.color.palette[]` (`{ slug, color, name }`)
    - spacing → `settings.spacing.spacingSizes[]` (`{ slug, size, name }`)
    - fontFamily → `settings.typography.fontFamilies[]` (`{ slug, fontFamily, name }`)
    - fontSize → `settings.typography.fontSizes[]` (`{ slug, size, name }`)
  - Categories without native theme.json support go under `settings.custom`:
    - fontWeight → `settings.custom.fontWeight`
    - lineHeight → `settings.custom.lineHeight`
    - radius → `settings.custom.radius`
    - shadow → `settings.custom.shadow`
    - transition → `settings.custom.transition`
  - zIndex is excluded entirely
  - Outputs `$schema`, `version: 3`
  - Pretty-printed JSON (2-space indent)
- [ ] Create `story-to-block/tests/theme-json.test.ts`
  - Only named/slugged tokens included in palette/sizes
  - Unnamed tokens excluded
  - Custom categories placed under settings.custom
  - zIndex excluded entirely
  - Valid theme.json structure

#### 3d: integrate.php Generator

- [ ] Create `story-to-block/templates/integrate.php.tpl`
  - Static PHP template (no token data injected)
  - Contains the `wp_theme_json_data_default` filter
  - Reads `theme.json` from `__DIR__`
  - Includes `ABSPATH` guard and doc comment
- [ ] Create `story-to-block/src/generators/integrate-php.ts`
  - `generateIntegratePhp(): string`
  - Reads the template file and returns it
  - No token-specific content — this file is always the same

### Phase 4: CLI

Wire up the generators behind a CLI command.

- [ ] Create `story-to-block/src/cli.ts`
  - `#!/usr/bin/env node` shebang
  - Parses `generate` command (only command for v1)
  - Optional `--config <path>` flag (defaults to `./stb.config.json`)
  - Optional `--dry-run` flag (outputs to stdout instead of writing files)
  - Calls `loadConfig()` → runs all generators → writes files
  - Writes to:
    - `{tokensPath}` (tokens.css for local dev)
    - `{outDir}/tokens.wp.css`
    - `{outDir}/theme.json`
    - `{outDir}/integrate.php`
  - Creates output directories if they don't exist
  - Logs which files were written
  - Exits with code 1 on error
- [ ] Create `story-to-block/src/index.ts`
  - Exports programmatic API: `generate(configPath?: string)`
  - Also exports individual generators for advanced use

### Phase 5: Integration with Storybook Starter

Wire `story-to-block` into this project to validate it works.

- [ ] Create `stb.config.json` at the project root
  - Migrate token values from existing `src/styles/tokens.css`
  - Set prefix to `prefix`
  - Set tokensPath to `src/styles/tokens.css`
  - Set outDir to `dist/wp`
- [ ] Update `package.json` scripts
  - Add `"generate": "node story-to-block/dist/cli.js generate"`
  - Update `"dev"` to `"npm run generate && storybook dev -p 6006"`
  - Update `"build"` to `"npm run generate && npm run build:lib && npm run build:css"`
- [ ] Update `package.json` exports
  - Add `"./wp/*": "./dist/wp/*"`
- [ ] Verify `src/styles/tokens.css` matches current hand-written version after generation
- [ ] Verify Storybook dev server works with generated tokens
- [ ] Verify Vite build output includes `dist/wp/` files
- [ ] Add `src/styles/tokens.css` note in file: `/* Auto-generated by story-to-block — do not edit manually */`
- [ ] Add `dist/wp/` to `.gitignore` (generated output)

### Phase 6: Tests

- [ ] Write unit tests for all generators (listed in Phase 3)
- [ ] Write config validation tests (listed in Phase 2)
- [ ] Create `story-to-block/tests/integration.test.ts`
  - Full end-to-end: load a test config → generate all files → verify outputs
  - Verify tokens.css contains all variables
  - Verify tokens.wp.css has correct var() mappings
  - Verify theme.json only contains named tokens
  - Verify integrate.php matches template
- [ ] Add test script to `story-to-block/package.json`: `"test": "vitest"`

### Phase 7: Prepare for Standalone Repo

Steps for when the package is ready to move out.

- [ ] Finalize `story-to-block/package.json` for publishing
  - Set `files: ["dist", "templates"]`
  - Add `engines: { node: ">=20" }`
  - Add keywords, description, license, repository
- [ ] Add `story-to-block/README.md` (can reference PACKAGE.md content)
- [ ] Move to standalone repo
- [ ] Set up GitHub Actions for:
  - CI: lint + test on PR
  - Publish: npm publish on tag/release
- [ ] Update this project to install `story-to-block` from npm instead of local path
- [ ] Remove `story-to-block/` folder from this repo

## Build Order

```
Phase 1 (scaffold) → Phase 2 (config) → Phase 3a-3d (generators) → Phase 4 (CLI)
                                                                        ↓
Phase 6 (tests) ←──────────────────────────────────────── Phase 5 (integration)
                                                                        ↓
                                                           Phase 7 (standalone repo)
```

## Key Decisions

- **Zero runtime dependencies.** The package uses only Node.js built-ins (fs, path, process). No chalk, no commander, no lodash.
- **Pure generator functions.** Each generator takes config in and returns a string. File I/O is handled only in the CLI layer. This makes testing straightforward.
- **TypeScript with ESM.** Matches the Storybook starter's setup. Compiled to `dist/` for consumption.
- **Template for PHP.** `integrate.php` is a static file copied from a template. No token data is injected into it — it reads `theme.json` at runtime.
- **Prototype locally, publish separately.** Build inside this repo for fast iteration, move to standalone repo when stable.
