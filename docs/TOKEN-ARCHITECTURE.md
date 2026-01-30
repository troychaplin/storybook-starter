# Token Architecture

This document describes the design token system that powers the component library across multiple platforms: Storybook, React/Next.js, and WordPress block themes.

## Overview

A single configuration file (`stb.config.json`) serves as the source of truth for all design values. The `story-to-block` package generates platform-specific outputs from this config, ensuring that every consumer — Storybook, a React app, or a WordPress block theme — shares the same design values without manual synchronization.

```
stb.config.json                       (single source of truth)
    │
    │   story-to-block generate       (build tool)
    │
    ├──► src/styles/tokens.css        (CSS vars for Storybook dev)
    ├──► dist/wp/tokens.wp.css        (CSS vars mapped to --wp--preset--*)
    ├──► dist/wp/theme.json           (WordPress theme.json base layer)
    └──► dist/wp/integrate.php        (WordPress filter hook)
```

## The Config File

### Structure

```json
{
    "prefix": "prefix",

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
        "secondary-hover": {
            "value": "#1a1e21"
        },
        "secondary-light": {
            "value": "#f1f1f1"
        },
        "text": {
            "value": "#1e1e1e",
            "name": "Contrast",
            "slug": "contrast"
        },
        "text-muted": {
            "value": "#6b7280"
        },
        "text-inverse": {
            "value": "#ffffff"
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
        "border-light": {
            "value": "#e5e7eb"
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
        },
        "info": {
            "value": "#72aee6",
            "name": "Info",
            "slug": "info"
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
            "value": "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif",
            "name": "System Sans",
            "slug": "body"
        },
        "mono": {
            "value": "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace",
            "name": "Monospace",
            "slug": "mono"
        }
    },

    "fontSize": {
        "xs":  { "value": "0.75rem" },
        "sm":  { "value": "0.875rem", "slug": "small",   "name": "Small" },
        "base":{ "value": "1rem",     "slug": "medium",  "name": "Medium" },
        "lg":  { "value": "1.125rem", "slug": "large",   "name": "Large" },
        "xl":  { "value": "1.25rem",  "slug": "x-large", "name": "X-Large" },
        "2xl": { "value": "1.5rem",   "slug": "xx-large","name": "XX-Large" },
        "3xl": { "value": "1.875rem" }
    },

    "fontWeight": {
        "normal":    { "value": "400" },
        "medium":    { "value": "500" },
        "semibold":  { "value": "600" },
        "bold":      { "value": "700" }
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
        "lg": { "value": "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)" },
        "xl": { "value": "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }
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
```

### Token Properties

Each token has a `value` (required) and optional WordPress-specific fields:

| Property | Required | Purpose |
|----------|----------|---------|
| `value` | Yes | The CSS value. Used in `tokens.css` and as the default in `theme.json` |
| `name` | No | Human-readable label. Tokens with `name` appear in the WordPress editor UI |
| `slug` | No | WordPress preset slug. Required alongside `name` for theme.json output |

**Key rule:** Only tokens with both `name` and `slug` are included in the generated `theme.json`. All other tokens exist only in `tokens.css` as CSS custom properties.

This means:
- `primary` (has name + slug) → appears in the editor color picker AND as `--prefix-color-primary` in CSS
- `primary-hover` (no name/slug) → exists only as `--prefix-color-primary-hover` in CSS
- `border-light` (no name/slug) → exists only as `--prefix-color-border-light` in CSS

This keeps the editor UI clean while giving components access to the full set of design values.

## Generated Outputs

### tokens.css

Generated to both `src/styles/tokens.css` (for Storybook) and `dist/css/tokens.css` (for consumers).

Every token becomes a CSS custom property using the configured prefix:

```css
/* Auto-generated by story-to-block — do not edit manually */

:root {
    /* Colors */
    --prefix-color-primary: #0073aa;
    --prefix-color-primary-hover: #005a87;
    --prefix-color-primary-light: #e5f3f9;
    --prefix-color-secondary: #23282d;
    /* ... all tokens */

    /* Spacing */
    --prefix-spacing-xs: 0.25rem;
    --prefix-spacing-sm: 0.5rem;
    /* ... */

    /* Font Families */
    --prefix-font-family-base: -apple-system, BlinkMacSystemFont, ...;
    /* ... */
}
```

Component CSS files reference these variables and are not affected by the generation process:

```css
/* Card.css — unchanged, always references --prefix-* */
.prefix-card {
    background-color: var(--prefix-color-background);
    border: 1px solid var(--prefix-color-border);
    border-radius: var(--prefix-radius-lg);
}
```

### theme.json

Generated to `dist/theme.json`. Only includes tokens that have `name` and `slug` properties.

```json
{
    "$schema": "https://schemas.wp.org/trunk/theme.json",
    "version": 3,
    "settings": {
        "color": {
            "palette": [
                { "slug": "primary", "color": "#0073aa", "name": "Primary" },
                { "slug": "secondary", "color": "#23282d", "name": "Secondary" },
                { "slug": "contrast", "color": "#1e1e1e", "name": "Contrast" },
                { "slug": "base", "color": "#ffffff", "name": "Base" },
                { "slug": "success", "color": "#00a32a", "name": "Success" },
                { "slug": "warning", "color": "#dba617", "name": "Warning" },
                { "slug": "error", "color": "#d63638", "name": "Error" },
                { "slug": "info", "color": "#72aee6", "name": "Info" }
            ]
        },
        "spacing": {
            "spacingSizes": [
                { "slug": "20", "size": "0.25rem", "name": "2X-Small" },
                { "slug": "30", "size": "0.5rem", "name": "Small" },
                { "slug": "40", "size": "1rem", "name": "Medium" },
                { "slug": "50", "size": "1.5rem", "name": "Large" },
                { "slug": "60", "size": "2rem", "name": "X-Large" },
                { "slug": "70", "size": "3rem", "name": "2X-Large" }
            ]
        },
        "typography": {
            "fontFamilies": [
                {
                    "slug": "body",
                    "fontFamily": "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif",
                    "name": "System Sans"
                },
                {
                    "slug": "mono",
                    "fontFamily": "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace",
                    "name": "Monospace"
                }
            ],
            "fontSizes": [
                { "slug": "small", "size": "0.875rem", "name": "Small" },
                { "slug": "medium", "size": "1rem", "name": "Medium" },
                { "slug": "large", "size": "1.125rem", "name": "Large" },
                { "slug": "x-large", "size": "1.25rem", "name": "X-Large" },
                { "slug": "xx-large", "size": "1.5rem", "name": "XX-Large" }
            ]
        },
        "custom": {
            "fontWeight": {
                "normal": "400",
                "medium": "500",
                "semibold": "600",
                "bold": "700"
            },
            "lineHeight": {
                "tight": "1.25",
                "normal": "1.5",
                "relaxed": "1.75"
            },
            "radius": {
                "none": "0",
                "sm": "2px",
                "md": "4px",
                "lg": "8px",
                "xl": "12px",
                "full": "9999px"
            },
            "shadow": {
                "sm": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
                "md": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                "lg": "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
                "xl": "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)"
            },
            "transition": {
                "fast": "150ms ease",
                "normal": "200ms ease",
                "slow": "300ms ease"
            }
        }
    }
}
```

**Note:** Token categories that don't have a native theme.json mapping (fontWeight, lineHeight, radius, shadow, transition, zIndex) are placed under `settings.custom`. WordPress generates CSS variables for these as `--wp--custom--*`, making them available to core blocks and the editor.

### integrate.php

Generated to `dist/integrate.php`. This is the WordPress hook that injects the generated theme.json as a default base layer.

```php
<?php
/**
 * Component Library WordPress Integration
 *
 * Loads the library's theme.json as a default base layer using
 * wp_theme_json_data_default. The active theme's theme.json
 * overrides any values defined here.
 *
 * Setup:
 *   1. Copy this file and theme.json into your theme (e.g. inc/story-to-block/)
 *   2. Add to your theme's functions.php:
 *      require_once get_template_directory() . '/inc/story-to-block/integrate.php';
 *
 * @package your-component-library
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

add_filter( 'wp_theme_json_data_default', function ( $theme_json ) {
    $library_json_path = __DIR__ . '/theme.json';

    if ( ! file_exists( $library_json_path ) ) {
        return $theme_json;
    }

    $library_data = json_decode(
        file_get_contents( $library_json_path ),
        true
    );

    if ( ! is_array( $library_data ) ) {
        return $theme_json;
    }

    return $theme_json->update_with( $library_data );
} );
```

## How Each Consumer Uses This

### Storybook (Development)

No changes to the development workflow. Storybook loads `src/styles/tokens.css` via the preview config and components render with the design token values.

```ts
// .storybook/preview.ts
import '../src/styles/tokens.css';
import '../src/styles/reset.css';
```

### React / Next.js

Import the bundled or individual CSS. The tokens provide hardcoded values. No WordPress dependency.

```tsx
// Option A: Bundled (all components + tokens)
import 'your-component-library/styles.css';

// Option B: Individual
import 'your-component-library/css/tokens.css';
import 'your-component-library/css/Card.css';

// Use components
import { Card } from 'your-component-library';
```

### WordPress Block Theme

#### Step 1: Copy files and include the integration hook

Copy `integrate.php` and `theme.json` from `dist/wp/` into your theme (e.g. `inc/story-to-block/`). Then add to your theme's `functions.php`:

```php
/**
 * Load the component library's base theme.json layer.
 * The theme's own theme.json values override these defaults.
 */
require_once get_template_directory() . '/inc/story-to-block/integrate.php';
```

This single line gives the theme all of the library's design tokens as defaults.

#### Step 2: Write your theme.json as normal

The theme's `theme.json` overrides any values from the library. You only need to define what's different:

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

In this example, only the primary color is overridden. All other colors, spacing, fonts, and custom values come from the library's base.

#### Step 3: Register component CSS for blocks

Copy CSS assets into your theme (e.g. `assets/css/components/`), then register them:

```php
function prefix_register_block_styles() {
    $theme_uri = get_template_directory_uri();

    wp_register_style(
        'prefix-tokens',
        $theme_uri . '/assets/css/components/tokens.wp.css',
        [],
        '0.0.1'
    );
    wp_enqueue_style( 'prefix-tokens' );

    wp_register_style(
        'prefix-card',
        $theme_uri . '/assets/css/components/Card.css',
        [ 'prefix-tokens' ],
        '0.0.1'
    );

    wp_register_style(
        'prefix-button',
        $theme_uri . '/assets/css/components/Button.css',
        [ 'prefix-tokens' ],
        '0.0.1'
    );
}
add_action( 'init', 'prefix_register_block_styles' );
add_action( 'enqueue_block_editor_assets', function () {
    wp_enqueue_style( 'prefix-tokens' );
} );
```

#### Step 4: Reference styles in block.json

```json
{
    "name": "your-plugin/card",
    "style": ["prefix-card"],
    "editorStyle": ["prefix-card"]
}
```

## How the Override Cascade Works

WordPress merges theme.json layers in this order (lowest to highest priority):

```
1. WordPress core defaults
2. wp_theme_json_data_default filter  ← Library injects here
3. Parent theme's theme.json
4. Child theme's theme.json
5. User customizations (Global Styles in the editor)
```

This means:

- The library provides a complete set of defaults at layer 2
- The block theme overrides specific values at layer 3 or 4
- End users can further customize via Global Styles at layer 5

### Practical example

Given these layers:

**Library base (layer 2):**
```json
{ "slug": "primary", "color": "#0073aa", "name": "Primary" }
```

**Theme override (layer 3):**
```json
{ "slug": "primary", "color": "#e63946", "name": "Primary" }
```

**Result:** Primary is `#e63946` in both the editor color picker and the `--wp--preset--color--primary` CSS variable. The library's `tokens.css` still defines `--prefix-color-primary: #0073aa` — but the theme.json approach means core blocks and the editor use the overridden value.

### Aligning tokens.css with theme overrides

When the theme overrides a color, the `--wp--preset--color--primary` variable changes but `--prefix-color-primary` in tokens.css still has the original value. There are two ways to handle this:

**Option A: Components use --prefix-* only (current setup)**

Components always use `--prefix-*` variables. The library's default values are consistent. If a theme needs components to match the overridden palette, it adds a small CSS override:

```css
/* theme style.css — bridge overrides */
:root {
    --prefix-color-primary: var(--wp--preset--color--primary);
}
```

This is a simple, explicit approach. The theme author decides which tokens to bridge.

**Option B: Generate a WordPress-aware tokens file**

The build script generates an additional `tokens.wp.css` that maps `--prefix-*` to `--wp--preset--*` with fallbacks:

```css
:root {
    --prefix-color-primary: var(--wp--preset--color--primary, #0073aa);
    --prefix-color-text: var(--wp--preset--color--contrast, #1e1e1e);
    --prefix-spacing-md: var(--wp--preset--spacing--40, 1rem);
}
```

The theme enqueues `tokens.wp.css` instead of `tokens.css`. Now component CSS automatically picks up theme overrides with no bridge CSS needed.

Tokens without a WordPress mapping (hover colors, borders, shadows, transitions, etc.) use hardcoded values with no `var()` wrapper, same as in the standard `tokens.css`.

**Recommendation:** Option B is more seamless. The build script can generate both files, and the `integrate.php` file can document which to use.

## Updated Build Output

```
dist/
├── index.js             # ES module (React components)
├── index.d.ts           # TypeScript declarations
├── styles.css           # Bundled CSS (tokens + all components)
├── css/
│   ├── tokens.css       # CSS vars — hardcoded values (React/Next.js)
│   ├── reset.css        # Base styles
│   ├── Card.css         # Card component
│   └── Button.css       # Button component
└── wp/
    ├── theme.json       # WordPress theme.json base layer
    ├── integrate.php    # WordPress filter hook
    └── tokens.wp.css    # CSS vars — mapped to --wp--preset--* (WordPress)
```

## Updated Package Exports

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
    }
}
```

## Build Tool

### story-to-block

The `story-to-block` package reads `stb.config.json` and produces:

1. `src/styles/tokens.css` — for Storybook development
2. `dist/wp/tokens.wp.css` — for WordPress consumers
3. `dist/wp/theme.json` — WordPress theme.json base layer
4. `dist/wp/integrate.php` — WordPress filter hook (static file, copied)

### Build Order

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

The `generate` step runs first, ensuring `tokens.css` exists before Storybook or Vite needs it. The `build:wp` step re-runs after `build:css` because Vite's `emptyDirBeforeWrite` clears the `dist/` directory.

## Adding New Tokens

1. Add the token to `stb.config.json`
2. If it should appear in the WordPress editor UI, include `name` and `slug`
3. Run `npm run generate` (or it runs automatically on `dev`/`build`)
4. Reference the new `--prefix-*` variable in component CSS

## Changing the Prefix

Update the `prefix` value in `stb.config.json`:

```json
{
    "prefix": "mylib"
}
```

Run `npm run generate`. The output changes to `--mylib-*` variables.

**Note:** Component CSS files and TSX class names still need a manual find-and-replace for the class prefix (e.g., `.prefix-card` to `.mylib-card`). The token generation handles CSS variable prefixes only. Class name prefixes are a separate concern documented in the README.

## Token Categories and WordPress Mapping

| Category | CSS Variable | theme.json Location | Editor UI |
|----------|-------------|-------------------|-----------|
| Color (with name) | `--prefix-color-*` | `settings.color.palette` | Color picker |
| Color (no name) | `--prefix-color-*` | Not included | CSS only |
| Spacing | `--prefix-spacing-*` | `settings.spacing.spacingSizes` | Spacing controls |
| Font Family | `--prefix-font-family-*` | `settings.typography.fontFamilies` | Font picker |
| Font Size (with name) | `--prefix-font-size-*` | `settings.typography.fontSizes` | Size picker |
| Font Size (no name) | `--prefix-font-size-*` | Not included | CSS only |
| Font Weight | `--prefix-font-weight-*` | `settings.custom.fontWeight` | CSS only |
| Line Height | `--prefix-line-height-*` | `settings.custom.lineHeight` | CSS only |
| Border Radius | `--prefix-radius-*` | `settings.custom.radius` | CSS only |
| Shadow | `--prefix-shadow-*` | `settings.custom.shadow` | CSS only |
| Transition | `--prefix-transition-*` | `settings.custom.transition` | CSS only |
| Z-Index | `--prefix-z-*` | Not included | CSS only |

Items under `settings.custom` generate `--wp--custom--*` CSS variables in WordPress but don't appear in editor UI controls. Z-Index values are omitted from theme.json entirely as they have no WordPress equivalent.
