# story-to-block

Generate WordPress `theme.json`, CSS token mappings, and PHP integration hooks from a single JSON config. Designed for Storybook component libraries that need to work in WordPress block themes.

## What It Does

You define design tokens once in `stb.config.json`. The generator produces:

- **`tokens.css`** — CSS variables with hardcoded values (for Storybook and React/Next.js)
- **`tokens.wp.css`** — CSS variables mapped to `--wp--preset--*` with fallbacks (for WordPress)
- **`theme.json`** — WordPress theme.json base layer with colors, spacing, fonts, and custom values
- **`fonts.css`** — @font-face declarations (when fontFace is defined)
- **`integrate.php`** — PHP filter that loads theme.json via `wp_theme_json_data_default`

```
stb.config.json  →  story-to-block generate  →  src/styles/tokens.css
                                                src/styles/fonts.css
                                                dist/wp/tokens.wp.css
                                                dist/wp/theme.json
                                                dist/wp/integrate.php
                                                dist/wp/assets/fonts/
```

## Installation

```bash
npm install story-to-block --save-dev
```

## Quick Start

### 1. Create the config

Create `stb.config.json` in your project root. Categories are defined at the top level — no wrapper needed:

```json
{
  "prefix": "mylib",
  "color": {
    "primary": "#0073aa",
    "primary-hover": "#005a87"
  },
  "spacing": {
    "md": { "value": "1rem", "slug": "40", "name": "Medium" }
  },
  "fontSize": {
    "base": { "value": "1rem", "fluid": { "min": "0.875rem", "max": "1rem" } }
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

### Token Categories

Categories are defined at the top level of the config:

| Category | CSS Variable | Example |
|----------|-------------|---------|
| `color` | `--prefix-color-*` | `--mylib-color-primary` |
| `gradient` | `--prefix-gradient-*` | `--mylib-gradient-sunset` |
| `spacing` | `--prefix-spacing-*` | `--mylib-spacing-md` |
| `fontFamily` | `--prefix-font-family-*` | `--mylib-font-family-base` |
| `fontSize` | `--prefix-font-size-*` | `--mylib-font-size-lg` |
| `fontWeight` | `--prefix-font-weight-*` | `--mylib-font-weight-bold` |
| `lineHeight` | `--prefix-line-height-*` | `--mylib-line-height-normal` |
| `radius` | `--prefix-radius-*` | `--mylib-radius-md` |
| `shadow` | `--prefix-shadow-*` | `--mylib-shadow-sm` |
| `transition` | `--prefix-transition-*` | `--mylib-transition-fast` |
| `zIndex` | `--prefix-z-*` | `--mylib-z-modal` |
| `layout` | `--prefix-layout-*` | `--mylib-layout-content-size` |

### Token Syntax

#### String Shorthand

For simple tokens, use a string value directly:

```json
{
  "color": {
    "primary": "#0073aa",
    "secondary": "#23282d"
  },
  "fontWeight": {
    "normal": "400",
    "bold": "700"
  }
}
```

#### Object Syntax

For tokens with additional properties:

```json
{
  "fontSize": {
    "small": {
      "value": "1rem",
      "fluid": { "min": "0.875rem", "max": "1rem" }
    }
  }
}
```

### Auto-derived Fields

The `slug` and `name` are automatically derived from the token key:

- **slug**: Uses the key directly (e.g., `"primary"` → slug `"primary"`)
- **name**: Title-cases the key (e.g., `"primary-hover"` → name `"Primary Hover"`)

Override when needed:

```json
{
  "color": {
    "primary": { "value": "#0073aa", "name": "Primary Brand Color" }
  },
  "spacing": {
    "md": { "value": "1rem", "slug": "40", "name": "Medium" }
  }
}
```

### Token Properties

| Property | Required | Description |
|----------|----------|-------------|
| `value` | Yes | The CSS value |
| `name` | No | Human-readable label (auto-derived from key) |
| `slug` | No | WordPress preset slug (auto-derived from key) |
| `fluid` | No | Fluid typography settings (fontSize only) |
| `fontFace` | No | Font file definitions (fontFamily only) |

### Font Families with Local Fonts

Define font families with `fontFace` to generate @font-face CSS and theme.json entries:

```json
{
  "fontFamily": {
    "inter": {
      "value": "Inter, sans-serif",
      "fontFace": [
        { "weight": "400", "style": "normal", "src": "inter-400-normal.woff2" },
        { "weight": "700", "style": "normal", "src": "inter-700-normal.woff2" }
      ]
    },
    "system": "-apple-system, BlinkMacSystemFont, sans-serif"
  }
}
```

Font files should be placed at `public/fonts/{slug}/{filename}` (e.g., `public/fonts/inter/inter-400-normal.woff2`). For WordPress themes, copy the font files into `assets/fonts/{slug}/` alongside `theme.json`.

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
  generateFontsCss,
  generateIntegratePhp,
} from 'story-to-block';

const config = loadConfig('./stb.config.json');
const css = generateTokensCss(config);
const wpCss = generateTokensWpCss(config);
const themeJson = generateThemeJson(config);
const fontsCss = generateFontsCss(config);
const php = generateIntegratePhp();
```

## WordPress Integration

### How tokens.wp.css Works

All tokens map to WordPress preset variables with fallbacks:

```css
/* Token → maps to --wp--preset--* */
--mylib-color-primary: var(--wp--preset--color--primary, #0073aa);

/* Custom categories → hardcoded value */
--mylib-font-weight-bold: 700;
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
| `color` | `--wp--preset--color--{slug}` | Color picker |
| `gradient` | `--wp--preset--gradient--{slug}` | Gradient picker |
| `spacing` | `--wp--preset--spacing--{slug}` | Spacing controls |
| `fontFamily` | `--wp--preset--font-family--{slug}` | Font picker |
| `fontSize` | `--wp--preset--font-size--{slug}` | Size picker |
| `shadow` | `--wp--preset--shadow--{slug}` | Shadow picker |
| `fontWeight` | `settings.custom.fontWeight` | CSS only |
| `lineHeight` | `settings.custom.lineHeight` | CSS only |
| `radius` | `settings.custom.radius` | CSS only |
| `transition` | `settings.custom.transition` | CSS only |
| `zIndex` | *(excluded from theme.json)* | CSS only |
| `layout` | `settings.layout` | Layout controls |

## Development

```bash
npm install
npm run build    # Compile TypeScript
npm test         # Run tests
```

## License

MIT
