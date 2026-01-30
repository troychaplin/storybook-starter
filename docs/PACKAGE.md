# story-to-block

`story-to-block` is an npm package that bridges a Storybook component library with WordPress block themes. It reads a single configuration file and generates all CSS token files and WordPress-specific assets from one source of truth.

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
├── dist/
│   ├── css/
│   │   ├── tokens.css               (generated — CSS vars for React/Next.js)
│   │   ├── Card.css                 (your component CSS, unchanged)
│   │   └── Button.css
│   ├── wp/
│   │   ├── theme.json               (generated — base theme.json layer)
│   │   ├── tokens.wp.css            (generated — CSS vars mapped to --wp--preset--*)
│   │   └── integrate.php            (generated — PHP filter hook)
│   ├── index.js
│   └── styles.css
```

`tokens.css` is no longer hand-written. It is generated from the config, ensuring your Storybook components, published React package, and WordPress assets all share the same values.

---

## Part 1: Building a Component Library

This section covers how a developer uses `story-to-block` when building and publishing a component library.

### Installation

```bash
npm install story-to-block --save-dev
```

### Creating the Config

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
      "primary-light": {
        "value": "#e5f3f9"
      },
      "secondary": {
        "value": "#23282d",
        "name": "Secondary",
        "slug": "secondary"
      },
      "text": {
        "value": "#1e1e1e",
        "name": "Contrast",
        "slug": "contrast"
      },
      "text-muted": {
        "value": "#6b7280"
      },
      "background": {
        "value": "#ffffff",
        "name": "Base",
        "slug": "base"
      },
      "background-alt": {
        "value": "#f9fafb"
      },
      "border": {
        "value": "#dcdcde"
      },
      "success": {
        "value": "#00a32a",
        "name": "Success",
        "slug": "success"
      },
      "warning": {
        "value": "#dba617",
        "name": "Warning",
        "slug": "warning"
      },
      "error": {
        "value": "#d63638",
        "name": "Error",
        "slug": "error"
      }
    },
    "spacing": {
      "xs":  { "value": "0.25rem", "slug": "20", "name": "2X-Small" },
      "sm":  { "value": "0.5rem",  "slug": "30", "name": "Small" },
      "md":  { "value": "1rem",    "slug": "40", "name": "Medium" },
      "lg":  { "value": "1.5rem",  "slug": "50", "name": "Large" },
      "xl":  { "value": "2rem",    "slug": "60", "name": "X-Large" },
      "2xl": { "value": "3rem",    "slug": "70", "name": "2X-Large" }
    },
    "fontFamily": {
      "base": {
        "value": "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        "name": "System Sans",
        "slug": "body"
      },
      "mono": {
        "value": "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace",
        "name": "Monospace",
        "slug": "mono"
      }
    },
    "fontSize": {
      "xs":   { "value": "0.75rem" },
      "sm":   { "value": "0.875rem", "slug": "small",    "name": "Small" },
      "base": { "value": "1rem",     "slug": "medium",   "name": "Medium" },
      "lg":   { "value": "1.125rem", "slug": "large",    "name": "Large" },
      "xl":   { "value": "1.25rem",  "slug": "x-large",  "name": "X-Large" },
      "2xl":  { "value": "1.5rem",   "slug": "xx-large", "name": "XX-Large" },
      "3xl":  { "value": "1.875rem" }
    },
    "fontWeight": {
      "normal":   { "value": "400" },
      "medium":   { "value": "500" },
      "semibold": { "value": "600" },
      "bold":     { "value": "700" }
    },
    "lineHeight": {
      "tight":   { "value": "1.25" },
      "normal":  { "value": "1.5" },
      "relaxed": { "value": "1.75" }
    },
    "radius": {
      "none": { "value": "0" },
      "sm":   { "value": "2px" },
      "md":   { "value": "4px" },
      "lg":   { "value": "8px" },
      "xl":   { "value": "12px" },
      "full": { "value": "9999px" }
    },
    "shadow": {
      "sm": { "value": "0 1px 2px 0 rgb(0 0 0 / 0.05)" },
      "md": { "value": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)" },
      "lg": { "value": "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)" }
    },
    "transition": {
      "fast":   { "value": "150ms ease" },
      "normal": { "value": "200ms ease" },
      "slow":   { "value": "300ms ease" }
    },
    "zIndex": {
      "dropdown": { "value": "100" },
      "sticky":   { "value": "200" },
      "modal":    { "value": "300" },
      "popover":  { "value": "400" },
      "tooltip":  { "value": "500" }
    }
  }
}
```

### Config Fields

| Field | Required | Default | Description |
|-------|----------|---------|-------------|
| `prefix` | Yes | — | CSS variable prefix used in your component library (e.g. `prefix` produces `--prefix-*`) |
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

### Running the Generator

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

### Using Generated Tokens in Components

After running the generator, `src/styles/tokens.css` contains all your CSS variables:

```css
/* Auto-generated by story-to-block — do not edit manually */

:root {
  /* Colors */
  --prefix-color-primary: #0073aa;
  --prefix-color-primary-hover: #005a87;
  --prefix-color-primary-light: #e5f3f9;
  --prefix-color-secondary: #23282d;
  --prefix-color-text: #1e1e1e;
  --prefix-color-text-muted: #6b7280;
  --prefix-color-background: #ffffff;
  --prefix-color-background-alt: #f9fafb;
  --prefix-color-border: #dcdcde;
  /* ... */

  /* Spacing */
  --prefix-spacing-xs: 0.25rem;
  --prefix-spacing-sm: 0.5rem;
  --prefix-spacing-md: 1rem;
  /* ... */

  /* Font Families */
  --prefix-font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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

.prefix-card--featured {
  border-color: var(--prefix-color-primary);
}
```

Nothing about how you write component CSS changes. The only difference is that `tokens.css` is generated from the config instead of written by hand.

### Updating Tokens

To change a design token value:

1. Edit `stb.config.json`
2. Run `npx story-to-block generate`
3. All outputs update — `tokens.css`, `tokens.wp.css`, `theme.json`

To add a new token, add it to the appropriate category in the config and run the generator. Then reference `--prefix-{category}-{name}` in your component CSS.

### Changing the Prefix

Update `prefix` in `stb.config.json` and run the generator. This updates all CSS variable names in the generated files.

Component CSS files and class names (e.g. `.prefix-card`) are not affected by the generator — those require a manual find-and-replace. The prefix in the config controls CSS variable names only.

### Build Scripts

Add the generate step to your project's build pipeline:

```json
{
  "scripts": {
    "generate": "story-to-block generate",
    "dev": "npm run generate && storybook dev -p 6006",
    "build": "npm run generate && npm run build:lib && npm run build:css",
    "build:lib": "vite build",
    "build:css": "node scripts/build-css.js"
  }
}
```

The generate step runs before both `dev` and `build` to ensure `tokens.css` exists when Storybook or Vite needs it. The WordPress assets (`dist/wp/`) are generated at the same time and included in the build output.

### Publishing the Library

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
  "files": [
    "dist"
  ]
}
```

After publishing, the package contains everything a consumer needs for both React/Next.js and WordPress:

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

---

## Part 2: Consuming the Library in WordPress

This section covers how a WordPress theme or plugin developer uses a published component library that was built with `story-to-block`.

### Install the Component Library

From your WordPress theme or plugin directory:

```bash
npm install your-component-library
```

### Load the Integration Hook

Add one line to your theme's `functions.php`:

```php
/**
 * Load the component library's base theme.json layer.
 * This injects default colors, spacing, fonts, and custom values
 * via wp_theme_json_data_default. Your theme.json overrides any values.
 */
require_once get_template_directory() . '/node_modules/your-component-library/dist/wp/integrate.php';
```

This registers the library's design tokens as defaults in the WordPress theme.json cascade. The theme's own `theme.json`, child themes, and user Global Styles all take priority over these defaults.

### Enqueue Styles

Register `tokens.wp.css` globally and component CSS per-block:

```php
function mytheme_register_component_styles() {
    $lib = get_template_directory_uri() . '/node_modules/your-component-library/dist';

    // Global — all components depend on these variables
    wp_register_style('lib-tokens', $lib . '/wp/tokens.wp.css', [], '0.0.1');
    wp_enqueue_style('lib-tokens');

    // Per-component — WordPress loads these only when the block is on the page
    wp_register_style('lib-card', $lib . '/css/Card.css', ['lib-tokens'], '0.0.1');
    wp_register_style('lib-button', $lib . '/css/Button.css', ['lib-tokens'], '0.0.1');
}
add_action('wp_enqueue_scripts', 'mytheme_register_component_styles');
add_action('enqueue_block_editor_assets', 'mytheme_register_component_styles');
```

**Why `tokens.wp.css` instead of `tokens.css`?**

`tokens.css` uses hardcoded values (`--prefix-color-primary: #0073aa`). Components render correctly but don't respond to theme.json overrides.

`tokens.wp.css` maps to WordPress preset variables with fallbacks (`--prefix-color-primary: var(--wp--preset--color--primary, #0073aa)`). When a theme overrides the primary color in its theme.json, components automatically pick up the new value.

### Reference Styles in block.json

Associate registered style handles with your blocks:

```json
{
  "$schema": "https://schemas.wp.org/trunk/block.json",
  "apiVersion": 3,
  "name": "your-plugin/card",
  "title": "Card",
  "style": ["lib-card"],
  "editorStyle": ["lib-card"]
}
```

WordPress enqueues `lib-card` (and its dependency `lib-tokens`) only when the Card block appears on the page.

### Override Defaults in theme.json

The library provides sensible defaults. Override any value by defining the same slug in your theme's `theme.json`:

```json
{
  "$schema": "https://schemas.wp.org/trunk/theme.json",
  "version": 3,
  "settings": {
    "color": {
      "palette": [
        { "slug": "primary", "color": "#e63946", "name": "Primary" }
      ]
    },
    "spacing": {
      "spacingSizes": [
        { "slug": "40", "size": "1.25rem", "name": "Medium" }
      ]
    }
  }
}
```

Because `tokens.wp.css` maps `--prefix-color-primary` to `var(--wp--preset--color--primary, #0073aa)`, components automatically pick up the theme's `#e63946` value. No additional CSS or configuration is needed.

You only need to define what's different. All other values fall through from the library's defaults.

---

## Reference

### What Gets Generated

| File | From Config | Description |
|------|-------------|-------------|
| `src/styles/tokens.css` | All tokens | CSS variables with hardcoded values. Used by Storybook and bundled into `dist/css/tokens.css` for React/Next.js consumers. |
| `dist/wp/tokens.wp.css` | All tokens | CSS variables where tokens with `name` + `slug` map to `--wp--preset--*` with fallbacks. Tokens without mapping use hardcoded values. |
| `dist/wp/theme.json` | Tokens with `name` + `slug` only | WordPress theme.json containing color palette, spacing scale, font families, font sizes, and custom values. |
| `dist/wp/integrate.php` | Static (no token data) | PHP filter that loads theme.json via `wp_theme_json_data_default`. |

### Token Category Mapping

| Category | CSS Variable | tokens.wp.css Mapping | theme.json Location | Editor UI |
|----------|-------------|----------------------|-------------------|-----------|
| Color (with name/slug) | `--prefix-color-*` | `var(--wp--preset--color--{slug}, value)` | `settings.color.palette` | Color picker |
| Color (without) | `--prefix-color-*` | Hardcoded value | Not included | Not visible |
| Spacing | `--prefix-spacing-*` | `var(--wp--preset--spacing--{slug}, value)` | `settings.spacing.spacingSizes` | Spacing controls |
| Font Family | `--prefix-font-family-*` | `var(--wp--preset--font-family--{slug}, value)` | `settings.typography.fontFamilies` | Font picker |
| Font Size (with name/slug) | `--prefix-font-size-*` | `var(--wp--preset--font-size--{slug}, value)` | `settings.typography.fontSizes` | Size picker |
| Font Size (without) | `--prefix-font-size-*` | Hardcoded value | Not included | Not visible |
| Font Weight | `--prefix-font-weight-*` | Hardcoded value | `settings.custom.fontWeight` | Not visible |
| Line Height | `--prefix-line-height-*` | Hardcoded value | `settings.custom.lineHeight` | Not visible |
| Border Radius | `--prefix-radius-*` | Hardcoded value | `settings.custom.radius` | Not visible |
| Shadow | `--prefix-shadow-*` | Hardcoded value | `settings.custom.shadow` | Not visible |
| Transition | `--prefix-transition-*` | Hardcoded value | `settings.custom.transition` | Not visible |
| Z-Index | `--prefix-z-*` | Hardcoded value | Not included | Not visible |

### theme.json Cascade

WordPress merges theme.json layers in this order (lowest to highest priority):

1. **WordPress core defaults**
2. **Library base layer** — `integrate.php` injects here via `wp_theme_json_data_default`
3. **Parent theme** `theme.json`
4. **Child theme** `theme.json`
5. **User Global Styles** (editor customizations)

The library sits at layer 2. Everything above it wins.

### What This Package Does NOT Do

- It does not modify your component TSX or CSS files
- It does not scaffold blocks, `block.json`, or PHP render templates (planned for a future version)
- It does not change how components reference CSS variables — they use `--prefix-*` everywhere
- It does not require WordPress to build or develop components — WordPress assets are generated alongside the standard build
