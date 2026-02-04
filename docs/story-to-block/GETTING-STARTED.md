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
│   ├── tokens.css                   (generated — CSS vars for Storybook dev)
│   └── fonts.css                    (generated — @font-face declarations)
│
└── dist/wp/
    ├── theme.json                   (generated — base theme.json layer)
    ├── tokens.wp.css                (generated — CSS vars mapped to --wp--preset--*)
    ├── integrate.php                (generated — PHP filter hook)
    └── assets/fonts/                (generated — copied font files)
```

`tokens.css` is generated from the config, ensuring your Storybook components, published React package, and WordPress assets all share the same values.

## Installation

```bash
npm install story-to-block --save-dev
```

## Creating the Config

Create `stb.config.json` in your project root. Categories are defined at the top level — no wrapper needed:

```json
{
  "prefix": "starter",
  "tokensPath": "src/styles/tokens.css",
  "outDir": "dist/wp",

  "layout": {
    "content-size": "768px",
    "wide-size": "1280px"
  },

  "color": {
    "primary": "#0073aa",
    "primary-hover": "#005a87",
    "secondary": "#23282d"
  },

  "spacing": {
    "xs": { "value": "0.25rem", "slug": "20", "name": "2X-Small" },
    "sm": { "value": "0.5rem",  "slug": "30", "name": "Small" },
    "md": { "value": "1rem",    "slug": "40", "name": "Medium" }
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
    "small":  { "value": "1rem",     "fluid": { "min": "0.875rem", "max": "1rem" } },
    "medium": { "value": "1.125rem", "fluid": { "min": "1rem", "max": "1.125rem" } }
  },

  "fontWeight": {
    "normal": "400",
    "bold": "700"
  },

  "lineHeight": {
    "tight": "1.25",
    "normal": "1.5"
  },

  "radius": {
    "sm": "2px",
    "md": "4px",
    "lg": "8px"
  },

  "shadow": {
    "sm": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    "md": "0 4px 6px -1px rgb(0 0 0 / 0.1)"
  },

  "transition": {
    "fast": "150ms ease",
    "normal": "200ms ease"
  },

  "zIndex": {
    "dropdown": "100",
    "modal": "300"
  }
}
```

### Config Fields

| Field | Required | Default | Description |
|-------|----------|---------|-------------|
| `prefix` | Yes | — | CSS variable prefix (e.g. `starter` produces `--starter-*`) |
| `tokensPath` | No | `src/styles/tokens.css` | Where to write the generated tokens CSS file |
| `fontsPath` | No | `public/fonts` | Source directory for font files |
| `outDir` | No | `dist/wp` | Output directory for WordPress-specific files |

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

For tokens needing additional properties:

```json
{
  "fontSize": {
    "small": {
      "value": "1rem",
      "fluid": { "min": "0.875rem", "max": "1rem" }
    }
  },
  "gradient": {
    "sunset": {
      "value": "linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)",
      "slug": "custom-gradient-1"
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
| `value` | Yes | The CSS value (color hex, rem, font stack, etc.) |
| `name` | No | Human-readable label (auto-derived from key if not provided) |
| `slug` | No | WordPress preset slug (auto-derived from key if not provided) |
| `fluid` | No | Fluid typography settings for fontSize (`{ min, max }`) |
| `fontFace` | No | Font file definitions for fontFamily |

## Running the Generator

```bash
npx story-to-block generate
```

This reads `stb.config.json` and produces:

| Generated File | Location | Purpose |
|----------------|----------|---------|
| `tokens.css` | `src/styles/tokens.css` | CSS variables with hardcoded values |
| `fonts.css` | `src/styles/fonts.css` | @font-face declarations (if fontFace defined) |
| `theme.json` | `dist/wp/theme.json` | WordPress theme.json base layer |
| `tokens.wp.css` | `dist/wp/tokens.wp.css` | CSS variables mapped to `--wp--preset--*` |
| `integrate.php` | `dist/wp/integrate.php` | PHP filter for wp_theme_json_data_default |
| Font files | `dist/wp/assets/fonts/` | Copied from `fontsPath` |

## Using Generated Tokens in Components

After running the generator, `src/styles/tokens.css` contains all your CSS variables:

```css
/* Auto-generated by story-to-block — do not edit manually */

:root {
  /* Colors */
  --starter-color-primary: #0073aa;
  --starter-color-primary-hover: #005a87;
  --starter-color-secondary: #23282d;
  /* ... */

  /* Spacing */
  --starter-spacing-xs: 0.25rem;
  --starter-spacing-sm: 0.5rem;
  --starter-spacing-md: 1rem;
  /* ... */
}
```

Your Storybook preview imports this file as normal:

```ts
// .storybook/preview.ts
import '../src/styles/tokens.css';
import '../src/styles/fonts.css';
import '../src/styles/reset.css';
```

Component CSS files reference the variables directly:

```css
/* Card.css */
.starter-card {
  background-color: var(--starter-color-background);
  border: 1px solid var(--starter-color-border);
  border-radius: var(--starter-radius-lg);
  padding: var(--starter-spacing-md);
}
```

Nothing about how you write component CSS changes. The only difference is that `tokens.css` is generated from the config instead of written by hand.

## Updating Tokens

To change a design token value:

1. Edit `stb.config.json`
2. Run `npx story-to-block generate`
3. All outputs update — `tokens.css`, `tokens.wp.css`, `theme.json`

To add a new token, add it to the appropriate category in the config and run the generator. Then reference `--starter-{category}-{key}` in your component CSS.

## Changing the Prefix

Update `prefix` in `stb.config.json` and run the generator. This updates all CSS variable names in the generated files.

Component CSS files and class names (e.g. `.starter-card`) are not affected by the generator — those require a manual find-and-replace. The prefix in the config controls CSS variable names only.

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
│   │   ├── fonts.css         # @font-face declarations
│   │   ├── reset.css         # Base styles (optional)
│   │   ├── Card.css          # Individual component CSS
│   │   └── Button.css
│   └── wp/
│       ├── theme.json        # WordPress theme.json base layer
│       ├── tokens.wp.css     # CSS vars mapped to --wp--preset--*
│       ├── integrate.php     # PHP filter hook
│       └── assets/fonts/     # Font files
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
