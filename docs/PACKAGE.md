# story-to-block

`story-to-block` is an npm package that bridges a Storybook component library with WordPress block themes. It reads a configuration file from your project and generates WordPress-specific assets: a `theme.json` base layer, CSS token mappings, and a PHP integration hook.

This package does not replace your Storybook setup. It adds to it.

## What It Does

You maintain a component library in Storybook with CSS variables (`--prefix-*`). `story-to-block` generates the files WordPress needs to consume those same tokens:

```
your-project/
├── stb.config.json              (you create this)
│
│   npx story-to-block generate
│
├── dist/
│   ├── wp/                      (generated)
│   │   ├── theme.json           (base theme.json for wp_theme_json_data_default)
│   │   ├── tokens.wp.css        (--prefix-* mapped to --wp--preset--*)
│   │   └── integrate.php        (PHP filter hook)
│   ├── css/                     (your existing build output)
│   │   ├── tokens.css
│   │   ├── Card.css
│   │   └── Button.css
│   ├── index.js
│   └── styles.css
```

## Requirements

- An existing Storybook project that builds a component library
- CSS variables using a consistent prefix (e.g. `--prefix-*`)
- npm or Node.js 20+

## Installation

```bash
npm install story-to-block --save-dev
```

## Configuration

Create `stb.config.json` in your project root:

```json
{
  "prefix": "prefix",
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
      },
      "text": {
        "value": "#1e1e1e",
        "name": "Contrast",
        "slug": "contrast"
      },
      "background": {
        "value": "#ffffff",
        "name": "Base",
        "slug": "base"
      }
    },
    "spacing": {
      "xs":  { "value": "0.25rem", "slug": "20", "name": "2X-Small" },
      "sm":  { "value": "0.5rem",  "slug": "30", "name": "Small" },
      "md":  { "value": "1rem",    "slug": "40", "name": "Medium" },
      "lg":  { "value": "1.5rem",  "slug": "50", "name": "Large" },
      "xl":  { "value": "2rem",    "slug": "60", "name": "X-Large" }
    },
    "fontFamily": {
      "base": {
        "value": "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        "name": "System Sans",
        "slug": "body"
      }
    },
    "fontSize": {
      "sm":   { "value": "0.875rem", "slug": "small",  "name": "Small" },
      "base": { "value": "1rem",     "slug": "medium", "name": "Medium" },
      "lg":   { "value": "1.125rem", "slug": "large",  "name": "Large" }
    },
    "fontWeight": {
      "normal":   { "value": "400" },
      "semibold": { "value": "600" },
      "bold":     { "value": "700" }
    },
    "lineHeight": {
      "tight":   { "value": "1.25" },
      "normal":  { "value": "1.5" }
    },
    "radius": {
      "sm": { "value": "2px" },
      "md": { "value": "4px" },
      "lg": { "value": "8px" }
    },
    "shadow": {
      "sm": { "value": "0 1px 2px 0 rgb(0 0 0 / 0.05)" },
      "md": { "value": "0 4px 6px -1px rgb(0 0 0 / 0.1)" }
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

| Field | Required | Description |
|-------|----------|-------------|
| `prefix` | Yes | The CSS variable prefix used in your component library |
| `outDir` | No | Output directory for generated files. Defaults to `dist/wp` |
| `tokens` | Yes | Token definitions grouped by category |

### Token Properties

Each token requires a `value`. Tokens with `name` and `slug` are exposed to the WordPress editor UI. Tokens without them exist only in CSS.

| Property | Required | Description |
|----------|----------|-------------|
| `value` | Yes | The CSS value (color hex, rem, font stack, etc.) |
| `name` | No | Human-readable label shown in the WordPress editor |
| `slug` | No | WordPress preset slug. Required alongside `name` |

**Examples:**

- `"primary": { "value": "#0073aa", "name": "Primary", "slug": "primary" }` — appears in the editor color picker AND generates a CSS variable
- `"primary-hover": { "value": "#005a87" }` — CSS variable only, not visible in the editor

## Usage

### Generate WordPress Assets

```bash
npx story-to-block generate
```

This reads `stb.config.json` and writes to `dist/wp/`:

| Generated File | Purpose |
|----------------|---------|
| `theme.json` | Base theme.json containing colors, spacing, fonts, and custom values. Only includes tokens with `name` + `slug`. |
| `tokens.wp.css` | CSS variables mapping `--prefix-*` to `--wp--preset--*` with hardcoded fallbacks. Tokens without a WordPress mapping use hardcoded values only. |
| `integrate.php` | PHP filter that loads `theme.json` via `wp_theme_json_data_default`. |

### Add to Your Build

Add the generate step to your existing build scripts:

```json
{
  "scripts": {
    "dev": "storybook dev -p 6006",
    "build": "npm run build:lib && npm run build:css && npm run build:wp",
    "build:lib": "vite build",
    "build:css": "node scripts/build-css.js",
    "build:wp": "story-to-block generate"
  }
}
```

### Update package.json Exports

Add the WordPress assets to your library's package exports so consumers can access them:

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

## What Gets Generated

### theme.json

A standard WordPress theme.json file containing only tokens that have `name` and `slug`. This is not a full theme — it provides defaults that any block theme can extend.

```json
{
  "$schema": "https://schemas.wp.org/trunk/theme.json",
  "version": 3,
  "settings": {
    "color": {
      "palette": [
        { "slug": "primary", "color": "#0073aa", "name": "Primary" }
      ]
    },
    "spacing": {
      "spacingSizes": [
        { "slug": "40", "size": "1rem", "name": "Medium" }
      ]
    },
    "typography": {
      "fontFamilies": [ ... ],
      "fontSizes": [ ... ]
    },
    "custom": {
      "fontWeight": { "normal": "400", "semibold": "600" },
      "lineHeight": { "tight": "1.25", "normal": "1.5" },
      "radius": { "sm": "2px", "md": "4px" },
      "shadow": { ... },
      "transition": { ... }
    }
  }
}
```

Categories without a native theme.json mapping (fontWeight, lineHeight, radius, shadow, transition) go under `settings.custom`. WordPress generates `--wp--custom--*` variables for these. zIndex is omitted from theme.json entirely.

### tokens.wp.css

Maps your `--prefix-*` variables to WordPress preset variables with fallbacks:

```css
:root {
  /* Tokens with WordPress mapping — responds to theme.json overrides */
  --prefix-color-primary: var(--wp--preset--color--primary, #0073aa);
  --prefix-color-text: var(--wp--preset--color--contrast, #1e1e1e);
  --prefix-spacing-md: var(--wp--preset--spacing--40, 1rem);
  --prefix-font-size-base: var(--wp--preset--font-size--medium, 1rem);

  /* Tokens without WordPress mapping — hardcoded values */
  --prefix-color-primary-hover: #005a87;
  --prefix-font-weight-normal: 400;
  --prefix-radius-md: 4px;
  --prefix-shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}
```

When a theme overrides `primary` to `#e63946` in its theme.json, `--wp--preset--color--primary` changes and `--prefix-color-primary` automatically picks up the new value. No manual CSS overrides needed.

### integrate.php

A PHP file that loads `theme.json` as a default base layer in WordPress:

```php
add_filter('wp_theme_json_data_default', function ($theme_json) {
    $library_json_path = __DIR__ . '/theme.json';
    if (!file_exists($library_json_path)) {
        return $theme_json;
    }
    $library_data = json_decode(file_get_contents($library_json_path), true);
    if (!is_array($library_data)) {
        return $theme_json;
    }
    return $theme_json->update_with($library_data);
});
```

This uses `wp_theme_json_data_default`, the lowest priority layer in the WordPress theme.json cascade. The theme's own `theme.json`, child theme, and user Global Styles all override these values.

## WordPress Theme Setup

After publishing your component library with `story-to-block` outputs, a WordPress theme integrates it like this:

### 1. Install the Component Library

```bash
cd wp-content/themes/your-theme
npm install your-component-library
```

### 2. Load the Integration Hook

In `functions.php`:

```php
// Load the library's base theme.json layer
require_once get_template_directory() . '/node_modules/your-component-library/dist/wp/integrate.php';
```

### 3. Enqueue Token CSS

```php
function mytheme_register_component_styles() {
    $lib = get_template_directory_uri() . '/node_modules/your-component-library/dist';

    wp_register_style('lib-tokens', $lib . '/wp/tokens.wp.css', [], '0.0.1');
    wp_enqueue_style('lib-tokens');

    // Register component CSS — WordPress loads these only when the block is on the page
    wp_register_style('lib-card', $lib . '/css/Card.css', ['lib-tokens'], '0.0.1');
    wp_register_style('lib-button', $lib . '/css/Button.css', ['lib-tokens'], '0.0.1');
}
add_action('wp_enqueue_scripts', 'mytheme_register_component_styles');
add_action('enqueue_block_editor_assets', 'mytheme_register_component_styles');
```

### 4. Reference in block.json

```json
{
  "name": "your-plugin/card",
  "style": ["lib-card"],
  "editorStyle": ["lib-card"]
}
```

### 5. Override in theme.json (optional)

The library provides defaults. Override anything by defining the same slug:

```json
{
  "$schema": "https://schemas.wp.org/trunk/theme.json",
  "version": 3,
  "settings": {
    "color": {
      "palette": [
        { "slug": "primary", "color": "#e63946", "name": "Primary" }
      ]
    }
  }
}
```

Components using `--prefix-color-primary` automatically pick up `#e63946` because `tokens.wp.css` maps it through `var(--wp--preset--color--primary, ...)`.

## How Tokens Map to WordPress

| Token Category | CSS Variable | WordPress Mapping | Editor Visibility |
|----------------|-------------|-------------------|-------------------|
| Color (with name/slug) | `--prefix-color-*` | `--wp--preset--color--{slug}` | Color picker |
| Color (without) | `--prefix-color-*` | None (hardcoded) | Not visible |
| Spacing | `--prefix-spacing-*` | `--wp--preset--spacing--{slug}` | Spacing controls |
| Font Family | `--prefix-font-family-*` | `--wp--preset--font-family--{slug}` | Font picker |
| Font Size (with name/slug) | `--prefix-font-size-*` | `--wp--preset--font-size--{slug}` | Size picker |
| Font Size (without) | `--prefix-font-size-*` | None (hardcoded) | Not visible |
| Font Weight | `--prefix-font-weight-*` | `--wp--custom--font-weight--*` | Not visible |
| Line Height | `--prefix-line-height-*` | `--wp--custom--line-height--*` | Not visible |
| Border Radius | `--prefix-radius-*` | `--wp--custom--radius--*` | Not visible |
| Shadow | `--prefix-shadow-*` | `--wp--custom--shadow--*` | Not visible |
| Transition | `--prefix-transition-*` | `--wp--custom--transition--*` | Not visible |
| Z-Index | `--prefix-z-*` | None | Not visible |

## theme.json Cascade

The WordPress theme.json merge order (lowest to highest priority):

1. **WordPress core defaults**
2. **Library base layer** — `integrate.php` injects here
3. **Parent theme** `theme.json`
4. **Child theme** `theme.json`
5. **User Global Styles** (editor customizations)

The library sits at layer 2. Everything above it wins. A theme author writes their `theme.json` normally and only the values they define override the library defaults.

## What This Package Does NOT Do

- It does not modify your Storybook setup or component code
- It does not generate `tokens.css` — your existing build handles that
- It does not scaffold blocks, `block.json`, or PHP render templates (planned for a future version)
- It does not require any changes to how your React components reference CSS variables

Your component CSS files continue to use `--prefix-*` variables. `story-to-block` only generates the WordPress layer that makes those variables respond to theme.json.
