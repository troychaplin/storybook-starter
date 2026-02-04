# Build Plan: story-to-block

> **Note:** This was the original implementation plan. The package is now fully implemented with the features described below plus additional functionality added over time.

## Current Features

The `story-to-block` package generates:

- **`tokens.css`** — CSS variables with hardcoded values
- **`tokens.wp.css`** — CSS variables mapped to `--wp--preset--*` with fallbacks
- **`theme.json`** — WordPress theme.json base layer
- **`fonts.css`** — @font-face declarations (when fontFace defined)
- **`integrate.php`** — PHP filter for `wp_theme_json_data_default`
- **Font file copying** — Copies fonts from source to output

## Config Format

The config uses a simplified format with categories at the top level:

```json
{
  "prefix": "starter",
  "tokensPath": "src/styles/tokens.css",
  "fontsPath": "public/fonts",
  "outDir": "dist/wp",

  "layout": {
    "content-size": "768px",
    "wide-size": "1280px"
  },

  "color": {
    "primary": "#0073aa",
    "primary-hover": "#005a87"
  },

  "gradient": {
    "sunset": {
      "value": "linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)",
      "slug": "custom-gradient-1"
    }
  },

  "fontFamily": {
    "inter": {
      "value": "Inter, sans-serif",
      "fontFace": [
        { "weight": "400", "style": "normal", "src": "inter-400-normal.woff2" }
      ]
    },
    "system": "-apple-system, BlinkMacSystemFont, sans-serif"
  },

  "fontSize": {
    "small": { "value": "1rem", "fluid": { "min": "0.875rem", "max": "1rem" } }
  },

  "shadow": {
    "natural": "6px 6px 9px rgba(0, 0, 0, 0.2)"
  },

  "fontWeight": {
    "normal": "400",
    "bold": "700"
  }
}
```

### Key Simplifications

1. **No `tokens` wrapper** — Categories at top level
2. **String shorthand** — `"normal": "400"` expands to `{ "value": "400" }`
3. **Auto-derived fields** — `slug` and `name` derived from key
4. **Flat color categories** — `color` and `gradient` as separate top-level keys

## Supported Token Categories

| Category | theme.json Path | Editor UI |
|----------|----------------|-----------|
| `color` | `settings.color.palette` | Color picker |
| `gradient` | `settings.color.gradients` | Gradient picker |
| `spacing` | `settings.spacing.spacingSizes` | Spacing controls |
| `fontFamily` | `settings.typography.fontFamilies` | Font picker |
| `fontSize` | `settings.typography.fontSizes` | Size picker |
| `shadow` | `settings.shadow.presets` | Shadow picker |
| `layout` | `settings.layout` | Layout controls |
| `fontWeight` | `settings.custom.fontWeight` | CSS only |
| `lineHeight` | `settings.custom.lineHeight` | CSS only |
| `radius` | `settings.custom.radius` | CSS only |
| `transition` | `settings.custom.transition` | CSS only |
| `zIndex` | *(excluded)* | CSS only |

## Project Structure

```
story-to-block/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts             # Main entry — exports programmatic API
│   ├── cli.ts               # CLI entry — npx story-to-block generate
│   ├── config.ts            # Reads + validates stb.config.json
│   ├── types.ts             # TypeScript types and registry
│   └── generators/
│       ├── tokens-css.ts    # Generates tokens.css
│       ├── tokens-wp-css.ts # Generates tokens.wp.css
│       ├── theme-json.ts    # Generates theme.json
│       ├── fonts-css.ts     # Generates fonts.css
│       └── integrate-php.ts # Generates integrate.php
├── templates/
│   └── integrate.php.tpl    # PHP template
└── tests/
    ├── config.test.ts
    ├── tokens-css.test.ts
    ├── tokens-wp-css.test.ts
    ├── theme-json.test.ts
    ├── fonts-css.test.ts
    └── integration.test.ts
```

## Key Design Decisions

- **Zero runtime dependencies** — Uses only Node.js built-ins
- **Pure generator functions** — Each generator takes config in, returns string out
- **TypeScript with ESM** — Compiled to `dist/` for consumption
- **Registry-driven** — `CATEGORY_REGISTRY` defines behavior for all categories
- **Template for PHP** — `integrate.php` is static, reads `theme.json` at runtime
