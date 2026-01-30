# story-to-block

Generate WordPress `theme.json`, CSS token mappings, and PHP integration hooks from a single JSON config. Designed for Storybook component libraries that need to work in WordPress block themes.

## What It Does

You define design tokens once in `stb.config.json`. The generator produces:

- **`tokens.css`** — CSS variables with hardcoded values (for Storybook and React/Next.js)
- **`tokens.wp.css`** — CSS variables mapped to `--wp--preset--*` with fallbacks (for WordPress)
- **`theme.json`** — WordPress theme.json base layer with colors, spacing, fonts, and custom values
- **`integrate.php`** — PHP filter that loads theme.json via `wp_theme_json_data_default`

```
stb.config.json  →  story-to-block generate  →  src/styles/tokens.css
                                                dist/wp/tokens.wp.css
                                                dist/wp/theme.json
                                                dist/wp/integrate.php
```

## Installation

```bash
npm install story-to-block --save-dev
```

## Quick Start

### 1. Create the config

Create `stb.config.json` in your project root:

```json
{
  "prefix": "mylib",
  "tokens": {
    "color": {
      "primary": {
        "value": "#0073aa",
        "name": "Primary",
        "slug": "primary"
      },
      "primary-hover": {
        "value": "#005a87"
      }
    },
    "spacing": {
      "md": { "value": "1rem", "slug": "40", "name": "Medium" }
    },
    "fontSize": {
      "base": { "value": "1rem", "slug": "medium", "name": "Medium" }
    }
  }
}
```

### 2. Generate

```bash
npx story-to-block generate
```

### 3. Use in your components

```css
.mylib-card {
  background: var(--mylib-color-background);
  padding: var(--mylib-spacing-md);
  border: 1px solid var(--mylib-color-border);
}
```

### 4. Add to your build

```json
{
  "scripts": {
    "generate": "story-to-block generate",
    "dev": "npm run generate && storybook dev -p 6006",
    "build": "npm run generate && npm run build:lib && npm run build:css"
  }
}
```

## Configuration

### Config Fields

| Field | Required | Default | Description |
|-------|----------|---------|-------------|
| `prefix` | Yes | — | CSS variable prefix (e.g. `mylib` produces `--mylib-*`) |
| `tokensPath` | No | `src/styles/tokens.css` | Output path for the development tokens CSS file |
| `outDir` | No | `dist/wp` | Output directory for WordPress-specific files |
| `tokens` | Yes | — | Token definitions grouped by category |

### Token Categories

| Category | CSS Variable | Example |
|----------|-------------|---------|
| `color` | `--prefix-color-*` | `--mylib-color-primary` |
| `spacing` | `--prefix-spacing-*` | `--mylib-spacing-md` |
| `fontFamily` | `--prefix-font-family-*` | `--mylib-font-family-base` |
| `fontSize` | `--prefix-font-size-*` | `--mylib-font-size-lg` |
| `fontWeight` | `--prefix-font-weight-*` | `--mylib-font-weight-bold` |
| `lineHeight` | `--prefix-line-height-*` | `--mylib-line-height-normal` |
| `radius` | `--prefix-radius-*` | `--mylib-radius-md` |
| `shadow` | `--prefix-shadow-*` | `--mylib-shadow-sm` |
| `transition` | `--prefix-transition-*` | `--mylib-transition-fast` |
| `zIndex` | `--prefix-z-*` | `--mylib-z-modal` |

### Token Properties

Each token requires a `value`. Tokens with `name` and `slug` are exposed to the WordPress editor UI. Tokens without them exist only as CSS variables.

```json
{
  "primary": {
    "value": "#0073aa",
    "name": "Primary",
    "slug": "primary"
  }
}
```

| Property | Required | Description |
|----------|----------|-------------|
| `value` | Yes | The CSS value |
| `name` | No | Human-readable label for the WordPress editor |
| `slug` | No | WordPress preset slug. Required alongside `name` |

`name` and `slug` must appear together. A token with `name` but no `slug` (or vice versa) will produce a validation error.

## CLI

```
story-to-block generate [options]

Options:
  --config <path>   Path to config file (default: ./stb.config.json)
  --dry-run         Output to stdout instead of writing files
```

## Programmatic API

```ts
import { generate } from 'story-to-block';

const result = generate('./stb.config.json');
// result.files: Array<{ path: string; size: number }>
```

Individual generators are also exported:

```ts
import {
  loadConfig,
  generateTokensCss,
  generateTokensWpCss,
  generateThemeJson,
  generateIntegratePhp,
} from 'story-to-block';

const config = loadConfig('./stb.config.json');
const css = generateTokensCss(config);
const wpCss = generateTokensWpCss(config);
const themeJson = generateThemeJson(config);
const php = generateIntegratePhp();
```

## WordPress Integration

### How tokens.wp.css Works

Tokens with `name` + `slug` map to WordPress preset variables with fallbacks:

```css
/* Token with slug → maps to --wp--preset--* */
--mylib-color-primary: var(--wp--preset--color--primary, #0073aa);

/* Token without slug → hardcoded value */
--mylib-color-primary-hover: #005a87;
```

When a theme overrides `primary` in its `theme.json`, `--wp--preset--color--primary` changes and `--mylib-color-primary` automatically picks up the new value.

### How integrate.php Works

The generated PHP file hooks into `wp_theme_json_data_default` — the lowest priority layer in the WordPress theme.json cascade:

1. WordPress core defaults
2. **Library base layer** (integrate.php injects here)
3. Parent theme `theme.json`
4. Child theme `theme.json`
5. User Global Styles

A theme's `theme.json` automatically overrides library defaults.

### Using in WordPress

The `integrate.php` and `theme.json` files must be **copied into your theme** — `node_modules` does not exist on production servers. Copy both files into a directory in your theme (e.g. `inc/story-to-block/`) and include via `require_once`:

```php
require_once get_template_directory() . '/inc/story-to-block/integrate.php';
```

Similarly, copy `tokens.wp.css` and component CSS files into your theme's assets directory and enqueue them with `wp_register_style` / `wp_enqueue_style`.

### WordPress Token Mapping

| Category | WordPress Mapping | Editor UI |
|----------|------------------|-----------|
| Color (with slug) | `--wp--preset--color--{slug}` | Color picker |
| Color (without slug) | Hardcoded | Not visible |
| Spacing | `--wp--preset--spacing--{slug}` | Spacing controls |
| Font Family | `--wp--preset--font-family--{slug}` | Font picker |
| Font Size (with slug) | `--wp--preset--font-size--{slug}` | Size picker |
| Font Size (without slug) | Hardcoded | Not visible |
| Font Weight | Hardcoded | Not visible |
| Line Height | Hardcoded | Not visible |
| Radius | Hardcoded | Not visible |
| Shadow | Hardcoded | Not visible |
| Transition | Hardcoded | Not visible |
| Z-Index | Hardcoded | Not visible |

Font Weight, Line Height, Radius, Shadow, and Transition are placed under `settings.custom` in `theme.json`, which generates `--wp--custom--*` variables but doesn't surface in editor UI controls. Z-Index is excluded from `theme.json` entirely.

## Development

```bash
npm install
npm run build    # Compile TypeScript
npm test         # Run tests
```

## License

MIT
