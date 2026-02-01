# Getting Started

`story-to-block` is a build tool that bridges a Storybook component library with WordPress block themes. It reads a single configuration file and generates all CSS token files and WordPress-specific assets from one source of truth.

## What It Does

You define your design tokens once in `stb.config.json`. The generate command produces everything your component library and WordPress themes need:

```
your-project/
├── stb.config.json                  (you create this — single source of truth)
│
│   npx story-to-block generate
│
├── src/styles/
│   └── tokens.css                   (generated — CSS vars for Storybook dev)
│
└── dist/wp/
    ├── theme.json                   (generated — base theme.json layer)
    ├── tokens.wp.css                (generated — CSS vars mapped to --wp--preset--*)
    └── integrate.php                (generated — PHP filter hook)
```

`tokens.css` is generated from the config, ensuring your Storybook components, published React package, and WordPress assets all share the same values.

## Installation

```bash
npm install story-to-block --save-dev
```

## Creating the Config

Create `stb.config.json` in your project root. This file defines every design token your components use:

```json
{
  "prefix": "prefix",
  "tokensPath": "src/styles/tokens.css",
  "outDir": "dist/wp",
  "tokens": {
    "color": {
      "primary": {
        "value": "#0073aa",
        "name": "Primary",
        "slug": "primary"
      },
      "primary-hover": {
        "value": "#005a87"
      },
      "secondary": {
        "value": "#23282d",
        "name": "Secondary",
        "slug": "secondary"
      }
    },
    "spacing": {
      "xs":  { "value": "0.25rem", "slug": "20", "name": "2X-Small" },
      "sm":  { "value": "0.5rem",  "slug": "30", "name": "Small" },
      "md":  { "value": "1rem",    "slug": "40", "name": "Medium" }
    },
    "fontFamily": {
      "base": {
        "value": "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        "name": "System Sans",
        "slug": "body"
      }
    },
    "fontSize": {
      "sm":   { "value": "0.875rem", "slug": "small", "name": "Small" },
      "base": { "value": "1rem",     "slug": "medium", "name": "Medium" }
    },
    "fontWeight": {
      "normal": { "value": "400" },
      "bold":   { "value": "700" }
    },
    "lineHeight": {
      "tight":  { "value": "1.25" },
      "normal": { "value": "1.5" }
    },
    "radius": {
      "sm": { "value": "2px" },
      "md": { "value": "4px" },
      "lg": { "value": "8px" }
    },
    "shadow": {
      "sm": { "value": "0 1px 2px 0 rgb(0 0 0 / 0.05)" },
      "md": { "value": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)" }
    },
    "transition": {
      "fast":   { "value": "150ms ease" },
      "normal": { "value": "200ms ease" }
    },
    "zIndex": {
      "dropdown": { "value": "100" },
      "modal":    { "value": "300" }
    }
  }
}
```

### Config Fields

| Field | Required | Default | Description |
|-------|----------|---------|-------------|
| `prefix` | Yes | — | CSS variable prefix (e.g. `prefix` produces `--prefix-*`) |
| `tokensPath` | No | `src/styles/tokens.css` | Where to write the generated tokens CSS file for local development |
| `outDir` | No | `dist/wp` | Output directory for WordPress-specific generated files |
| `tokens` | Yes | — | Token definitions grouped by category |

### Token Properties

Each token requires a `value`. The optional `name` and `slug` fields control whether a token is visible in the WordPress editor UI.

| Property | Required | Description |
|----------|----------|-------------|
| `value` | Yes | The CSS value (color hex, rem, font stack, etc.) |
| `name` | No | Human-readable label shown in the WordPress editor UI |
| `slug` | No | WordPress preset slug. Required alongside `name` for theme.json output |

Tokens with `name` + `slug` are included in theme.json and mapped to `--wp--preset--*` variables. Tokens without them exist only as CSS variables with hardcoded values.

**Examples:**

- `"primary": { "value": "#0073aa", "name": "Primary", "slug": "primary" }` — appears in the WordPress editor color picker, generates a CSS variable, and maps to `--wp--preset--color--primary` in `tokens.wp.css`
- `"primary-hover": { "value": "#005a87" }` — generates a CSS variable only, not visible in the WordPress editor

## Running the Generator

```bash
npx story-to-block generate
```

This reads `stb.config.json` and produces:

| Generated File | Location | Purpose |
|----------------|----------|---------|
| `tokens.css` | `src/styles/tokens.css` | CSS variables with hardcoded values, used by Storybook during development |
| `theme.json` | `dist/wp/theme.json` | WordPress theme.json base layer with colors, spacing, fonts, and custom values |
| `tokens.wp.css` | `dist/wp/tokens.wp.css` | CSS variables mapping `--prefix-*` to `--wp--preset--*` with hardcoded fallbacks |
| `integrate.php` | `dist/wp/integrate.php` | PHP filter that loads theme.json via `wp_theme_json_data_default` |

## Using Generated Tokens in Components

After running the generator, `src/styles/tokens.css` contains all your CSS variables:

```css
/* Auto-generated by story-to-block — do not edit manually */

:root {
  /* Colors */
  --prefix-color-primary: #0073aa;
  --prefix-color-primary-hover: #005a87;
  --prefix-color-secondary: #23282d;
  /* ... */

  /* Spacing */
  --prefix-spacing-xs: 0.25rem;
  --prefix-spacing-sm: 0.5rem;
  --prefix-spacing-md: 1rem;
  /* ... */
}
```

Your Storybook preview imports this file as normal:

```ts
// .storybook/preview.ts
import '../src/styles/tokens.css';
import '../src/styles/reset.css';
```

Component CSS files reference the variables directly:

```css
/* Card.css */
.prefix-card {
  background-color: var(--prefix-color-background);
  border: 1px solid var(--prefix-color-border);
  border-radius: var(--prefix-radius-lg);
  padding: var(--prefix-spacing-md);
}
```

Nothing about how you write component CSS changes. The only difference is that `tokens.css` is generated from the config instead of written by hand.

## Updating Tokens

To change a design token value:

1. Edit `stb.config.json`
2. Run `npx story-to-block generate`
3. All outputs update — `tokens.css`, `tokens.wp.css`, `theme.json`

To add a new token, add it to the appropriate category in the config and run the generator. Then reference `--prefix-{category}-{key}` in your component CSS.

## Changing the Prefix

Update `prefix` in `stb.config.json` and run the generator. This updates all CSS variable names in the generated files.

Component CSS files and class names (e.g. `.prefix-card`) are not affected by the generator — those require a manual find-and-replace. The prefix in the config controls CSS variable names only.

## Build Scripts

Add the generate step to your project's build pipeline:

```json
{
  "scripts": {
    "generate": "story-to-block generate",
    "dev": "npm run generate && storybook dev -p 6006",
    "build": "npm run generate && npm run build:lib && npm run build:css && npm run build:wp",
    "build:lib": "vite build",
    "build:css": "node scripts/build-css.js",
    "build:wp": "story-to-block generate"
  }
}
```

The generate step runs before both `dev` and `build` to ensure `tokens.css` exists when Storybook or Vite needs it. The `build:wp` step re-runs after `build:css` because Vite's `emptyDirBeforeWrite` clears the `dist/` directory.

## Publishing the Library

When publishing your component library to npm, include the WordPress assets in your package exports:

```json
{
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./styles.css": "./dist/styles.css",
    "./css/*": "./dist/css/*",
    "./wp/*": "./dist/wp/*"
  },
  "files": ["dist"]
}
```

After publishing, the package contains everything a consumer needs:

```
node_modules/your-component-library/
├── dist/
│   ├── index.js              # React components (ES module)
│   ├── index.d.ts            # TypeScript declarations
│   ├── styles.css            # Bundled CSS (all components + tokens)
│   ├── css/
│   │   ├── tokens.css        # CSS vars with hardcoded values
│   │   ├── reset.css         # Base styles (optional)
│   │   ├── Card.css          # Individual component CSS
│   │   └── Button.css
│   └── wp/
│       ├── theme.json        # WordPress theme.json base layer
│       ├── tokens.wp.css     # CSS vars mapped to --wp--preset--*
│       └── integrate.php     # PHP filter hook
```

## CLI Reference

```bash
# Generate from default config (./stb.config.json)
npx story-to-block generate

# Generate from a custom config path
npx story-to-block generate --config path/to/config.json

# Preview output without writing files
npx story-to-block generate --dry-run
```

## What This Package Does NOT Do

- It does not modify your component TSX or CSS files
- It does not scaffold blocks, `block.json`, or PHP render templates
- It does not change how components reference CSS variables — they use `--prefix-*` everywhere
- It does not require WordPress to build or develop components
