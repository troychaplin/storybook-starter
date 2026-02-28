# story-to-block

Generate WordPress `theme.json`, CSS token mappings, and PHP integration hooks from a single JSON config. Designed for Storybook component libraries that need to work in WordPress block themes.

## Quick Setup

```bash
npm install story-to-block --save-dev
```

**1. Create `stb.config.json`** in your project root:

```json
{
  "prefix": "mylib",
  "color": {
    "primary": { "value": "#0073aa", "name": "Primary" },
    "primary-hover": { "value": "#005a87", "cssOnly": true }
  },
  "spacing": {
    "sm": { "value": "0.5rem", "slug": "30", "name": "Small" },
    "md": { "value": "1rem", "slug": "40", "name": "Medium" }
  },
  "fontFamily": {
    "inter": {
      "value": "Inter, sans-serif",
      "fontFace": [
        { "weight": "400", "style": "normal", "src": "inter-400-normal.woff2" }
      ]
    }
  },
  "fontSize": {
    "small": { "fluid": { "min": "0.875rem", "max": "1rem" } },
    "medium": { "fluid": { "min": "1rem", "max": "1.125rem" } }
  }
}
```

**2. Generate:**

```bash
npx story-to-block generate
```

**3. Add the Storybook preset** to `.storybook/main.ts`:

```ts
addons: [
  '@storybook/addon-docs',
  '../story-to-block/dist/preset.js',
],
```

The preset auto-injects `tokens.css`, `fonts.css`, `reset.scss`, and `content.scss` into Storybook. No manual imports needed in `preview.ts`.

**4. Use tokens in components:**

```scss
.mylib-card {
  padding: var(--mylib--spacing-md);
  border-radius: var(--mylib--radius-md);
  font-size: var(--mylib--font-size-medium);
}
```

**5. Add to your build scripts:**

```json
{
  "scripts": {
    "generate": "story-to-block generate",
    "dev": "npm run generate && storybook dev -p 6006",
    "build": "npm run generate && npm run build:lib && npm run build:css"
  }
}
```

## What It Generates

```
stb.config.json
    │
    │   story-to-block generate
    │
    ├──► src/styles/tokens.css              CSS variables (Storybook / React)
    ├──► src/styles/fonts.css               @font-face declarations
    ├──► src/styles/_content-generated.scss  Base typography from baseStyles
    │
    ├──► dist/wp/theme.json                 WordPress theme.json base layer
    ├──► dist/wp/tokens.wp.css              CSS variables mapped to --wp--preset--*
    └──► dist/wp/integrate.php              PHP filter for wp_theme_json_data_default
```

| File | When generated | Purpose |
|------|----------------|---------|
| `tokens.css` | Always | CSS custom properties with hardcoded values |
| `fonts.css` | When `fontFace` is defined | `@font-face` declarations |
| `_content-generated.scss` | When `baseStyles` is defined | Body and heading typography using `:where()` |
| `theme.json` | Always | WordPress settings and styles |
| `tokens.wp.css` | When `wpThemeable: true` | CSS vars mapped to `--wp--preset--*` with fallbacks |
| `integrate.php` | Always | PHP hook to inject theme.json as a WordPress default layer |

## Config Reference

### Fields

| Field | Required | Default | Description |
|-------|----------|---------|-------------|
| `prefix` | Yes | — | CSS variable prefix (`mylib` produces `--mylib--*`) |
| `tokensPath` | No | `src/styles/tokens.css` | Output path for the generated tokens file |
| `outDir` | No | `dist/wp` | Output directory for WordPress files |
| `wpThemeable` | No | `false` | Generates `tokens.wp.css` with `--wp--preset--*` mappings |
| `baseStyles` | No | — | Element typography for body, headings, and caption |

### Token Categories

| Category | CSS Variable Pattern | WordPress Mapping |
|----------|---------------------|-------------------|
| `color` | `--prefix--color-*` | `settings.color.palette` |
| `gradient` | `--prefix--gradient-*` | `settings.color.gradients` |
| `spacing` | `--prefix--spacing-*` | `settings.spacing.spacingSizes` |
| `fontFamily` | `--prefix--font-family-*` | `settings.typography.fontFamilies` |
| `fontSize` | `--prefix--font-size-*` | `settings.typography.fontSizes` |
| `shadow` | `--prefix--shadow-*` | `settings.shadow.presets` |
| `layout` | `--prefix--layout-*` | `settings.layout` |
| `fontWeight` | `--prefix--font-weight-*` | `settings.custom` (CSS only) |
| `lineHeight` | `--prefix--line-height-*` | `settings.custom` (CSS only) |
| `radius` | `--prefix--radius-*` | `settings.custom` (CSS only) |
| `transition` | `--prefix--transition-*` | `settings.custom` (CSS only) |
| `zIndex` | `--prefix--z-*` | Excluded from theme.json |

### Token Syntax

**Object syntax** registers the token as a WordPress preset (visible in the Site Editor). The `slug` and `name` are auto-derived from the key:

```json
{ "color": { "primary": { "value": "#0073aa", "name": "Primary" } } }
```

**String shorthand** creates a CSS variable only (no WordPress preset):

```json
{ "fontWeight": { "bold": "700" } }
```

**`cssOnly` flag** on an object entry skips preset registration while keeping the object format:

```json
{ "color": { "primary-hover": { "value": "#005a87", "cssOnly": true } } }
```

**Fluid font sizes** generate responsive `clamp()` values:

```json
{ "fontSize": { "small": { "fluid": { "min": "0.875rem", "max": "1rem" } } } }
```

### Base Styles

The `baseStyles` section generates base typography for body, headings, and captions. Values that match a token key resolve to the corresponding CSS variable:

```json
{
  "baseStyles": {
    "body": { "fontFamily": "inter", "fontSize": "medium", "fontWeight": "400", "lineHeight": "1.6" },
    "heading": { "fontFamily": "inter" },
    "h1": { "fontSize": "4.5rem", "fontWeight": "500" },
    "h2": { "fontSize": "3rem", "fontWeight": "500" },
    "caption": { "fontSize": "small", "fontStyle": "italic", "fontWeight": "300" }
  }
}
```

This produces `_content-generated.scss` with `body {}` and `:where()` rules for Storybook/React, and a `styles` block in theme.json for WordPress. See [Base Styles](../docs/story-to-block/BASE-STYLES.md) for the full design rationale.

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

Individual generators:

```ts
import {
  loadConfig,
  generateTokensCss,
  generateTokensWpCss,
  generateThemeJson,
  generateFontsCss,
  generateContentScss,
  generateIntegratePhp,
} from 'story-to-block';
```

## Documentation

| Guide | Description |
|-------|-------------|
| [Getting Started](../docs/story-to-block/GETTING-STARTED.md) | Full config reference, token syntax, build setup |
| [Token Architecture](../docs/story-to-block/TOKEN-ARCHITECTURE.md) | How tokens flow from config to each platform |
| [Base Styles](../docs/story-to-block/BASE-STYLES.md) | Content scope typography and `:where()` approach |
| [Theme Integration](../docs/story-to-block/THEME-INTEGRATION.md) | WordPress theme setup with integrate.php and tokens.wp.css |
| [Plugin Integration](../docs/story-to-block/PLUGIN-INTEGRATION.md) | WordPress block plugin with component CSS and block.json |
| [Editor Styles](../docs/story-to-block/EDITOR-STYLES.md) | Loading styles in the WordPress block editor iframe |

## Development

```bash
npm install
npm run build    # Compile TypeScript
npm test         # Run tests
```

## License

MIT
