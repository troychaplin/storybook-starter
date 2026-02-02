# Theme Integration

This guide covers how to integrate a component library built with `story-to-block` into a WordPress block theme. The theme is responsible for the design system layer: loading the library's base `theme.json`, enqueuing `tokens.wp.css` globally, and optionally overriding token values.

## Prerequisites

- WordPress 6.0+
- A block theme
- A published component library built with `story-to-block`

## Published Package Structure

Install the library in your theme:

```bash
npm install your-component-library
```

The files relevant to theme integration:

```
node_modules/your-component-library/dist/
├── wp/
│   ├── theme.json        # Generated theme.json base layer
│   ├── integrate.php     # WordPress filter hook
│   └── tokens.wp.css     # CSS vars — mapped to --wp--preset--*
└── css/
    └── tokens.css        # CSS vars — hardcoded values (not used in WordPress)
```

Files in `dist/wp/` must be **copied into your theme** — `node_modules` does not exist on production servers.

## Setup

### Step 1: Copy library files into the theme

```bash
# Create a directory for the library's PHP integration
mkdir -p assets

# Copy the PHP filter and generated theme.json
cp node_modules/your-component-library/dist/wp/integrate.php assets/
cp node_modules/your-component-library/dist/wp/theme.json assets/

# Copy the WordPress token stylesheet
mkdir -p assets/css
cp node_modules/your-component-library/dist/wp/tokens.wp.css assets/css/
```

Your theme structure:

```
your-theme/
├── inc/
│   └── story-to-block/
│       ├── integrate.php    (loads theme.json via wp_theme_json_data_default)
│       └── theme.json       (base layer — keep these two files together)
├── assets/
│   └── css/
│       └── tokens.wp.css    (CSS variables mapped to --wp--preset--*)
├── functions.php
└── theme.json               (your theme's own theme.json — overrides library defaults)
```

### Step 2: Load integrate.php and enqueue tokens

In your theme's `functions.php`:

```php
/**
 * Load the component library's base theme.json layer.
 * Injects default colors, spacing, fonts, and custom values via
 * wp_theme_json_data_default. Your theme's theme.json overrides these.
 */
require_once get_template_directory() . '/assets/integrate.php';

/**
 * Enqueue the component library's design tokens globally.
 * All component blocks depend on these CSS variables.
 */
function prefix_enqueue_tokens() {
    wp_enqueue_style(
        'prefix-tokens',
        get_template_directory_uri() . '/assets/css/tokens.wp.css',
        [],
        '0.0.1'
    );
}
add_action( 'wp_enqueue_scripts', 'prefix_enqueue_tokens' );
add_action( 'enqueue_block_editor_assets', 'prefix_enqueue_tokens' );
```

Alternatively, copy the filter directly into `functions.php` instead of using the file:

```php
add_filter( 'wp_theme_json_data_default', function ( $theme_json ) {
    $library_json_path = get_template_directory() . '/inc/story-to-block/theme.json';

    if ( ! file_exists( $library_json_path ) ) {
        return $theme_json;
    }

    $library_data = json_decode( file_get_contents( $library_json_path ), true );

    if ( ! is_array( $library_data ) ) {
        return $theme_json;
    }

    return $theme_json->update_with( $library_data );
} );
```

### Step 3: Override defaults in your theme.json (optional)

Your theme's `theme.json` overrides any library defaults. Only define what's different:

```json
{
    "$schema": "https://schemas.wp.org/trunk/theme.json",
    "version": 3,
    "settings": {
        "color": {
            "palette": [
                {
                    "slug": "primary",
                    "color": "#e63946",
                    "name": "Primary"
                }
            ]
        }
    }
}
```

Because `tokens.wp.css` maps `--prefix-color-primary` to `var(--wp--preset--color--primary, #0073aa)`, components automatically pick up `#e63946` from your theme — no additional CSS needed.

You only need to define what's different. All other values fall through from the library's defaults.

## What the Theme Provides

| File | Purpose |
|------|---------|
| `integrate.php` + `theme.json` | Injects library tokens into the WordPress theme.json cascade as defaults |
| `tokens.wp.css` | Maps `--prefix-*` CSS variables to `--wp--preset--*` so components respond to theme.json overrides |
| Theme's own `theme.json` | Overrides any library defaults (colors, spacing, fonts) |

## Why tokens.wp.css Instead of tokens.css

`tokens.css` contains hardcoded values (`--prefix-color-primary: #0073aa`). Components work but won't respond to theme.json overrides.

`tokens.wp.css` maps to WordPress preset variables with fallbacks (`--prefix-color-primary: var(--wp--preset--color--primary, #0073aa)`). When the theme overrides a color in its theme.json, components automatically pick up the new value.

## theme.json Cascade

WordPress merges theme.json layers in this order (lowest to highest priority):

1. **WordPress core defaults**
2. **Library base layer** ← `integrate.php` injects here via `wp_theme_json_data_default`
3. **Parent theme** `theme.json`
4. **Child theme** `theme.json`
5. **User Global Styles** (editor customizations)

Your theme's `theme.json` automatically overrides library defaults. No manual CSS variable mapping is needed — `tokens.wp.css` handles it.

See [Token Architecture](./TOKEN-ARCHITECTURE.md) for the full list of generated token mappings.

## Style Variations

Style variations are JSON files in the theme's `styles/` directory that provide alternative palettes and styles selectable from the Site Editor.

### Creating a style variation

Create a file like `styles/twilight.json`:

```json
{
    "$schema": "https://schemas.wp.org/trunk/theme.json",
    "version": 3,
    "title": "Twilight",
    "settings": {
        "color": {
            "palette": [
                { "slug": "primary", "color": "#6366f1", "name": "Primary" },
                { "slug": "secondary", "color": "#1e1b4b", "name": "Secondary" },
                { "slug": "contrast", "color": "#e0e7ff", "name": "Contrast" },
                { "slug": "base", "color": "#0f172a", "name": "Base" }
            ]
        }
    },
    "styles": {
        "color": {
            "background": "var:preset|color|base",
            "text": "var:preset|color|contrast"
        },
        "elements": {
            "button": {
                "color": {
                    "background": "var:preset|color|primary",
                    "text": "var:preset|color|base"
                }
            }
        }
    }
}
```

### Style variation preview requires a styles section

The default variation also needs a `styles` section in the theme's root `theme.json` for the preview to render correctly. See [Known Issues](#style-variation-preview-shows-blank-colors) below.

## Troubleshooting

### CSS variables not taking effect

1. **Tokens must load before component CSS.** Set `['prefix-tokens']` as a dependency on component style registrations
2. **Check specificity.** Theme overrides may need to match or exceed library specificity
3. **Verify the variable names match.** Open browser dev tools and inspect the element

### tokens.css vs tokens.wp.css

- **`tokens.css`** — Hardcoded values. Use for React/Next.js projects outside WordPress
- **`tokens.wp.css`** — Maps to `--wp--preset--*` variables with hardcoded fallbacks. Use in WordPress so components respond to theme.json and Global Styles overrides

If components aren't picking up your theme.json color/spacing changes, check that you're loading `tokens.wp.css` and not `tokens.css`.

## Known Issues

### Style variation preview shows blank colors

**Symptom:** When using style variations (JSON files in the theme's `styles/` directory), the default variation's color palette preview appears as white/blank in the Site Editor's style picker, even though the palette works correctly when applied.

**Cause:** The style variation preview does not read colors from `settings.color.palette`. Instead, it extracts colors from the `styles` section — specifically `styles.color.text` and `styles.elements.button.color.background`. If the theme's root `theme.json` has no `styles` section, the preview has no colors to render.

This is a WordPress core behavior introduced in [Gutenberg PR #59514](https://github.com/WordPress/gutenberg/pull/59514). There is an [open issue (#60478)](https://github.com/WordPress/gutenberg/issues/60478) proposing a `settings.example` property to let theme authors explicitly control preview colors, but it has not been implemented yet.

**Workaround:** Add a `styles` section to both your theme's root `theme.json` and each style variation JSON file:

```json
{
    "styles": {
        "color": {
            "background": "var:preset|color|base",
            "text": "var:preset|color|contrast"
        },
        "elements": {
            "button": {
                "color": {
                    "background": "var:preset|color|primary",
                    "text": "var:preset|color|base"
                }
            }
        }
    }
}
```

**Why the library can't fix this:** The `styles` section defines how tokens are *applied* to page elements (background, text, buttons), which is a theme-level concern. The library provides the design tokens (`settings`), but the theme decides how to use them.

### Avoid defaultPalette: false in the library's theme.json

**Symptom:** Setting `"defaultPalette": false` in `settings.color` causes the library's own color palette to disappear.

**Cause:** The library's `theme.json` is injected at the WordPress default layer via `wp_theme_json_data_default`. The `defaultPalette: false` setting tells WordPress to exclude the default palette — which includes the library's palette since it lives at that layer.

**Recommendation:** Do not add `defaultPalette: false` to the library's generated `theme.json`. If a theme needs to remove the WordPress default palette, it should set this in its own `theme.json` (layer 3), where it won't affect the library's injected palette.

The library's generated `theme.json` uses `"custom": false` and `"customGradient": false` to disable the custom color picker in the Site Editor. These settings are safe at the default layer and can be overridden by themes that want to re-enable them.
