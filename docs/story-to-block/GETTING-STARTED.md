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
    ├── tokens.wp.css                (generated — if wpThemeable: true)
    └── integrate.php                (generated — PHP filter hook)
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
    "primary": { "value": "#0073aa", "name": "Primary" },
    "primary-hover": "#005a87",
    "secondary": { "value": "#23282d" },
    "secondary-hover": "#1a1e21"
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
    "small":  { "fluid": { "min": "0.875rem", "max": "1rem" } },
    "medium": { "fluid": { "min": "1rem", "max": "1.125rem" } }
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
| `prefix` | Yes | — | CSS variable prefix (e.g. `starter` produces `--starter--*`) |
| `tokensPath` | No | `src/styles/tokens.css` | Where to write the generated tokens CSS file |
| `outDir` | No | `dist/wp` | Output directory for WordPress-specific files |
| `wpThemeable` | No | `false` | When `true`, generates `tokens.wp.css` with `--wp--preset--*` variable mappings |

### Token Syntax

Every token produces a CSS custom property. The format you choose determines whether it also registers as a WordPress preset (visible in the Site Editor):

#### Object Syntax — Preset Registration (default)

Object entries auto-derive `slug` and `name` from the key. They register as WordPress presets, appear in the Site Editor, and can be overridden by the active theme:

```json
{
  "color": {
    "primary": { "value": "#0073aa", "name": "Primary Brand Color" },
    "secondary": { "value": "#23282d" }
  },
  "fontSize": {
    "small": { "fluid": { "min": "0.875rem", "max": "1rem" } }
  }
}
```

#### CSS-Only Tokens

Tokens that should produce a CSS variable but **not** appear in the Site Editor can be marked in two ways:

**Explicit flag** — use `"cssOnly": true` on an object entry. This is the clearest approach and keeps related tokens grouped together:

```json
{
  "color": {
    "primary": { "value": "#0073aa", "name": "Primary" },
    "primary-hover": { "value": "#005a87", "cssOnly": true },
    "secondary": { "value": "#23282d" },
    "secondary-hover": { "value": "#1a1e21", "cssOnly": true }
  }
}
```

**String shorthand** — a string value is always CSS-only. Use this for categories where no tokens need preset registration:

```json
{
  "fontWeight": {
    "normal": "400",
    "bold": "700"
  }
}
```

#### Recommended Pattern

Use `cssOnly` for colors and other preset categories where some tokens are implementation details. Use string shorthand for categories that are entirely CSS-only (fontWeight, lineHeight, radius, transition, zIndex):

```json
{
  "color": {
    "primary": { "value": "#0073aa", "name": "Primary" },
    "primary-hover": { "value": "#005a87", "cssOnly": true },
    "secondary": { "value": "#23282d" },
    "secondary-hover": { "value": "#1a1e21", "cssOnly": true },
    "success": { "value": "#00a32a" },
    "error": { "value": "#d63638" }
  },
  "fontWeight": {
    "normal": "400",
    "bold": "700"
  }
}
```

Here, `primary`, `secondary`, `success`, and `error` appear in the Site Editor palette. `primary-hover` and `secondary-hover` are CSS variables only.

### Auto-derived Fields

For object entries (without `cssOnly`), `slug` and `name` are automatically derived from the token key:

- **slug**: Uses the key directly (e.g., `"primary"` → slug `"primary"`)
- **name**: Title-cases the key (e.g., `"x-large"` → name `"X Large"`)

For `fontSize` tokens with `fluid`, the `value` is auto-derived from `fluid.max` if not provided.

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
| `value` | Yes* | The CSS value. *Auto-derived from `fluid.max` for fluid font sizes |
| `name` | No | Human-readable label (auto-derived from key for object entries) |
| `slug` | No | WordPress preset slug (auto-derived from key for object entries) |
| `cssOnly` | No | When `true`, produces a CSS variable but skips WordPress preset registration |
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
| `tokens.wp.css` | `dist/wp/tokens.wp.css` | CSS variables mapped to `--wp--preset--*` (if `wpThemeable: true`) |
| `integrate.php` | `dist/wp/integrate.php` | PHP filter for wp_theme_json_data_default |

By default, all tokens use hardcoded values (locked design system). To allow WordPress theme overrides via the Site Editor, add `"wpThemeable": true` to your config. This generates an additional `tokens.wp.css` file that maps preset tokens to `--wp--preset--*` variables.

## Using Generated Tokens in Components

After running the generator, `src/styles/tokens.css` contains all your CSS variables. Fluid font sizes use `clamp()` for responsive scaling:

```css
/* Auto-generated by story-to-block — do not edit manually */

:root {
  /* Colors */
  --starter--color-primary: #0073aa;
  --starter--color-primary-hover: #005a87;

  /* Font Sizes */
  --starter--font-size-small: clamp(0.875rem, 0.875rem + ((0.125) * ((100vw - 320px) / 1280)), 1rem);
  --starter--font-size-large: clamp(1.25rem, 1.25rem + ((0.5) * ((100vw - 320px) / 1280)), 1.75rem);
}
```

Your Storybook preview imports these files:

```ts
// .storybook/preview.ts
import '../src/styles/tokens.css';
import '../src/styles/fonts.css';
import '../src/styles/reset.scss';
```

Component SCSS files reference the generated CSS variables and can use shared mixins:

```scss
/* Card.scss */
@use '../../styles/mixins' as *;

.starter-card {
  background-color: var(--starter-color-background);
  border: 1px solid var(--starter-color-border);
  border-radius: var(--starter-radius-lg);
  padding: var(--starter-spacing-md);

  @include focus-ring;
  @include transition(background-color, border-color);
}
```

The design tokens (`tokens.css`) are generated from the config, while component styles are authored in SCSS for better organization.

## Updating Tokens

To change a design token value:

1. Edit `stb.config.json`
2. Run `npx story-to-block generate`
3. All outputs update — `tokens.css`, `tokens.wp.css`, `theme.json`

To add a new token, add it to the appropriate category in the config and run the generator. Then reference `--starter--{category}-{key}` in your component CSS.

## CSS Output: tokens.css vs tokens.wp.css

The generator produces two CSS token files with different behaviors:

### tokens.css — Hardcoded Values (Locked)

Contains CSS variables with static values. Use this in Storybook, React apps, or WordPress themes where you want **locked** tokens that cannot be changed from the Site Editor.

```css
--starter--color-primary: #0073aa;
--starter--font-size-small: clamp(0.875rem, 0.875rem + ((0.125) * ((100vw - 320px) / 1280)), 1rem);
```

Every token gets the same treatment — all values are hardcoded.

### tokens.wp.css — WordPress Preset Mapping (Themeable)

Contains CSS variables that reference WordPress preset variables for **object entries** (preset-registered tokens), with the original value as a fallback. **String shorthand** entries get hardcoded values identical to `tokens.css`.

```css
/* Object entry — maps to WP preset, overridable via Site Editor */
--starter--color-primary: var(--wp--preset--color--primary, #0073aa);

/* String shorthand — hardcoded, not overridable */
--starter--color-primary-hover: #005a87;

/* Fluid font sizes use clamp() as fallback */
--starter--font-size-small: var(--wp--preset--font-size--small, clamp(0.875rem, ...));
```

When a content editor changes "Primary" in the Site Editor, the `--wp--preset--color--primary` variable updates, and that flows into your component CSS via `--starter--color-primary`. String shorthand tokens like hover states remain stable.

### Which File to Use

| Scenario | File | Behavior |
|----------|------|----------|
| Storybook / React app | `tokens.css` | All values hardcoded |
| WordPress — locked design system | `tokens.css` | Components ignore Site Editor changes |
| WordPress — themeable | `tokens.wp.css` | Object tokens follow Site Editor; shorthand tokens stay locked |

For most WordPress integrations, `tokens.wp.css` is the right choice. It gives content editors control over the tokens you've explicitly exposed (object entries) while keeping implementation details (string shorthand) stable.

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
│   ├── components/
│   │   ├── Button/
│   │   │   ├── Button.js     # Component module
│   │   │   ├── Button.d.ts   # TypeScript declarations
│   │   │   └── Button.css    # Compiled component CSS
│   │   └── Card/
│   │       ├── Card.js
│   │       ├── Card.d.ts
│   │       └── Card.css
│   ├── styles.css            # Bundled CSS (all components + tokens)
│   ├── css/
│   │   ├── tokens.css        # CSS vars with hardcoded values
│   │   ├── fonts.css         # @font-face declarations
│   │   └── reset.css         # Compiled base styles
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
- It does not change how components reference CSS variables — they use `--prefix--*` everywhere
- It does not require WordPress to build or develop components
