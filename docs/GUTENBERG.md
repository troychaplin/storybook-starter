# Gutenberg Integration Guide

This guide covers how to use the component library in WordPress Gutenberg blocks. Integration is split between two projects:

- **Block theme** — Handles the design system: `integrate.php`, `theme.json`, and `tokens.wp.css`
- **Block plugin** — Handles component CSS, block registration, and block rendering

## Table of Contents

- [Prerequisites](#prerequisites)
- [Published Package Structure](#published-package-structure)
- [Theme Setup](#theme-setup)
- [Plugin Setup](#plugin-setup)
- [Static Blocks (JS Rendered)](#static-blocks-js-rendered)
- [Dynamic Blocks (PHP Rendered)](#dynamic-blocks-php-rendered)
- [Theme Integration](#theme-integration)
- [Editor Styles](#editor-styles)
- [Component Reference](#component-reference)
- [Known Issues](#known-issues)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- WordPress 6.0+
- Node.js 20+ (for building blocks with `@wordpress/scripts`)
- A block theme and a block plugin
- This component library installed as a dependency in both projects

## Published Package Structure

Install the library from your theme or plugin directory:

```bash
npm install your-component-library
```

The published package contains:

```
node_modules/your-component-library/
├── dist/
│   ├── index.js          # ES module (React components)
│   ├── index.d.ts        # TypeScript declarations
│   ├── styles.css        # Bundled CSS (all components)
│   ├── css/              # Individual CSS files
│   │   ├── tokens.css    # CSS vars — hardcoded values (React/Next.js)
│   │   ├── reset.css     # Base styles (optional)
│   │   ├── Button.css    # Button component
│   │   └── Card.css      # Card component
│   └── wp/
│       ├── theme.json    # Generated theme.json base layer
│       ├── integrate.php # WordPress filter hook
│       └── tokens.wp.css # CSS vars — mapped to --wp--preset--* (WordPress)
```

**Key distinction:** Files in `dist/wp/` are PHP and JSON files that must be **copied into your theme** — `node_modules` does not exist on production servers. Files in `dist/css/` are component stylesheets that get copied into your **plugin** alongside the blocks that use them.

See [Token Architecture](./TOKEN-ARCHITECTURE.md) for details on how these files are generated from a single config.

---

## Theme Setup

The theme is responsible for the design system layer: loading the library's base `theme.json`, enqueuing `tokens.wp.css` globally, and optionally overriding token values in its own `theme.json`.

### Step 1: Copy library files into the theme

```bash
# Create a directory for the library's PHP integration
mkdir -p inc/story-to-block

# Copy the PHP filter and generated theme.json
cp node_modules/your-component-library/dist/wp/integrate.php inc/story-to-block/
cp node_modules/your-component-library/dist/wp/theme.json inc/story-to-block/

# Copy the WordPress token stylesheet
mkdir -p assets/css
cp node_modules/your-component-library/dist/wp/tokens.wp.css assets/css/
```

### Step 2: Load integrate.php and enqueue tokens

In your theme's `functions.php`:

```php
/**
 * Load the component library's base theme.json layer.
 * Injects default colors, spacing, fonts, and custom values via
 * wp_theme_json_data_default. Your theme's theme.json overrides these.
 */
require_once get_template_directory() . '/inc/story-to-block/integrate.php';

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

### What the theme provides

| File | Purpose |
|------|---------|
| `integrate.php` + `theme.json` | Injects library tokens into the WordPress theme.json cascade as defaults |
| `tokens.wp.css` | Maps `--prefix-*` CSS variables to `--wp--preset--*` so components respond to theme.json overrides |
| Theme's own `theme.json` | Overrides any library defaults (colors, spacing, fonts) |

**Why `tokens.wp.css` instead of `tokens.css`?**

`tokens.css` contains hardcoded values (`--prefix-color-primary: #0073aa`). Components work but won't respond to theme.json overrides.

`tokens.wp.css` maps to WordPress preset variables with fallbacks (`--prefix-color-primary: var(--wp--preset--color--primary, #0073aa)`). When the theme overrides a color in its theme.json, components automatically pick up the new value.

---

## Plugin Setup

The plugin is responsible for registering blocks and their component CSS. It installs the component library as a build dependency, imports React components for the editor, and copies component CSS files for frontend rendering.

### Step 1: Install the library

```bash
npm install your-component-library
```

### Step 2: Copy component CSS into the plugin

```bash
# Copy individual component stylesheets
mkdir -p assets/css
cp node_modules/your-component-library/dist/css/Card.css assets/css/
cp node_modules/your-component-library/dist/css/Button.css assets/css/
# Copy any other component CSS files your blocks use
```

### Step 3: Register component styles

In your plugin's main PHP file:

```php
/**
 * Register component library styles for blocks.
 * Each style is associated with a block via block.json.
 * WordPress only enqueues them when the block appears on the page.
 */
function prefix_register_block_styles() {
    $plugin_uri = plugin_dir_url( __FILE__ );

    wp_register_style(
        'prefix-card',
        $plugin_uri . 'assets/css/Card.css',
        [ 'prefix-tokens' ],
        '0.0.1'
    );

    wp_register_style(
        'prefix-button',
        $plugin_uri . 'assets/css/Button.css',
        [ 'prefix-tokens' ],
        '0.0.1'
    );
}
add_action( 'init', 'prefix_register_block_styles' );
```

> **Note:** The dependency on `prefix-tokens` ensures the theme's token stylesheet loads before any component CSS. The theme must register and enqueue this handle (see [Theme Setup](#theme-setup)).

### Step 4: Associate styles with blocks via block.json

```json
{
    "$schema": "https://schemas.wp.org/trunk/block.json",
    "apiVersion": 3,
    "name": "your-plugin/card",
    "title": "Card",
    "category": "design",
    "style": ["prefix-card"],
    "editorStyle": ["prefix-card"]
}
```

The `style` array references the handle registered with `wp_register_style`. WordPress enqueues it automatically when the block appears on a page.

#### Alternative: Register via PHP

For blocks registered in PHP rather than `block.json`:

```php
register_block_type('your-plugin/card', [
    'render_callback'      => 'render_card_block',
    'style_handles'        => ['prefix-card'],
    'editor_style_handles' => ['prefix-card'],
]);
```

#### Alternative: Manual enqueue in render callback

```php
function render_card_block($attributes) {
    wp_enqueue_style('prefix-card');

    return sprintf(
        '<article class="prefix-card">...</article>',
        // ...
    );
}
```

### What the plugin provides

| Concern | Plugin responsibility |
|---------|---------------------|
| Component CSS | Copy and register per-component stylesheets |
| Block JS | Import React components from the library for the editor |
| Block registration | `block.json` with `style` and `editorStyle` handles |
| Rendering | Edit component (React) and save/render.php (markup) |

### CSS loading summary

| File | Loaded by | When |
|------|-----------|------|
| `integrate.php` | Theme | Always (functions.php require_once) |
| `tokens.wp.css` | Theme | Always (global enqueue) |
| `Card.css` | Plugin | Only when Card block is on the page |
| `Button.css` | Plugin | Only when Button block is on the page |
| `tokens.css` | Neither | Use `tokens.wp.css` instead |
| `styles.css` | Neither | Use individual files instead |

## Static Blocks (JS Rendered)

Static blocks store their HTML in the database. The React component renders in both the editor and the saved output.

### Block Registration (JS)

```tsx
// src/blocks/card/index.ts
import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit';
import save from './save';
import metadata from './block.json';

registerBlockType(metadata.name, {
    edit: Edit,
    save,
});
```

### block.json

```json
{
    "$schema": "https://schemas.wp.org/trunk/block.json",
    "apiVersion": 3,
    "name": "your-plugin/card",
    "title": "Card",
    "category": "design",
    "attributes": {
        "title": {
            "type": "string",
            "default": ""
        },
        "content": {
            "type": "string",
            "default": ""
        },
        "variant": {
            "type": "string",
            "default": "default",
            "enum": ["default", "featured"]
        }
    },
    "supports": {
        "html": false
    },
    "style": ["prefix-card"],
    "editorStyle": ["prefix-card"]
}
```

### Edit Component

The edit component uses the React component from the library for the editor experience:

```tsx
// src/blocks/card/edit.tsx
import { useBlockProps, RichText } from '@wordpress/block-editor';
import { Card } from 'your-component-library';

interface EditProps {
    attributes: {
        title: string;
        content: string;
        variant: 'default' | 'featured';
    };
    setAttributes: (attrs: Partial<EditProps['attributes']>) => void;
}

export default function Edit({ attributes, setAttributes }: EditProps) {
    const blockProps = useBlockProps();

    return (
        <div {...blockProps}>
            <Card variant={attributes.variant}>
                <RichText
                    tagName="h3"
                    className="prefix-card__title"
                    value={attributes.title}
                    onChange={(title) => setAttributes({ title })}
                    placeholder="Card title..."
                />
                <RichText
                    tagName="div"
                    className="prefix-card__content"
                    value={attributes.content}
                    onChange={(content) => setAttributes({ content })}
                    placeholder="Card content..."
                />
            </Card>
        </div>
    );
}
```

### Save Component

The save component outputs the HTML that gets stored in the database:

```tsx
// src/blocks/card/save.tsx
import { useBlockProps, RichText } from '@wordpress/block-editor';

interface SaveProps {
    attributes: {
        title: string;
        content: string;
        variant: 'default' | 'featured';
    };
}

export default function save({ attributes }: SaveProps) {
    const blockProps = useBlockProps.save();
    const { title, content, variant } = attributes;

    const cardClasses = [
        'prefix-card',
        variant !== 'default' && `prefix-card--${variant}`,
    ].filter(Boolean).join(' ');

    return (
        <div {...blockProps}>
            <article className={cardClasses}>
                <header className="prefix-card__header">
                    <RichText.Content
                        tagName="h3"
                        className="prefix-card__title"
                        value={title}
                    />
                </header>
                <div className="prefix-card__content">
                    <RichText.Content tagName="div" value={content} />
                </div>
            </article>
        </div>
    );
}
```

### Important Note on Static Blocks

The save component outputs raw HTML with CSS class names — it does **not** import the React component. This is because WordPress stores the HTML in the database and re-renders it without JavaScript on the frontend. The component library provides:

1. The CSS that styles those class names
2. The React component for the editor experience
3. Documentation of the expected markup structure

If you change the HTML structure in a component update, existing saved blocks will show a validation error in the editor.

## Dynamic Blocks (PHP Rendered)

Dynamic blocks store only their attributes. PHP renders the HTML on each page load. This is the more flexible approach and avoids block validation issues on updates.

### Block Registration

```json
{
    "$schema": "https://schemas.wp.org/trunk/block.json",
    "apiVersion": 3,
    "name": "your-plugin/card",
    "title": "Card",
    "category": "design",
    "attributes": {
        "title": {
            "type": "string",
            "default": ""
        },
        "content": {
            "type": "string",
            "default": ""
        },
        "variant": {
            "type": "string",
            "default": "default",
            "enum": ["default", "featured"]
        }
    },
    "supports": {
        "html": false
    },
    "style": ["prefix-card"],
    "editorStyle": ["prefix-card"],
    "render": "file:./render.php"
}
```

### Edit Component

Same as the static block — use the React component for the editor:

```tsx
// src/blocks/card/edit.tsx
import { useBlockProps, RichText } from '@wordpress/block-editor';
import { Card } from 'your-component-library';

export default function Edit({ attributes, setAttributes }) {
    const blockProps = useBlockProps();

    return (
        <div {...blockProps}>
            <Card variant={attributes.variant}>
                <RichText
                    tagName="h3"
                    className="prefix-card__title"
                    value={attributes.title}
                    onChange={(title) => setAttributes({ title })}
                    placeholder="Card title..."
                />
                <RichText
                    tagName="div"
                    className="prefix-card__content"
                    value={attributes.content}
                    onChange={(content) => setAttributes({ content })}
                    placeholder="Card content..."
                />
            </Card>
        </div>
    );
}
```

### Save Component

Dynamic blocks return `null` from save:

```tsx
// src/blocks/card/save.tsx
export default function save() {
    return null;
}
```

### PHP Render Template

```php
<?php
/**
 * Card block server-side render template.
 *
 * Markup matches the component library's Card component.
 * Refer to Storybook docs for the full CSS class reference.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Inner block content.
 * @var WP_Block $block      Block instance.
 *
 * CSS Classes Used:
 * - .prefix-card            Base card container
 * - .prefix-card__header    Card header section
 * - .prefix-card__title     Card title (h3)
 * - .prefix-card__content   Card body content
 * - .prefix-card--featured  Featured variant modifier
 */

$variant = $attributes['variant'] ?? 'default';
$title   = $attributes['title'] ?? '';
$content = $attributes['content'] ?? '';

$card_classes = 'prefix-card';
if ( 'default' !== $variant ) {
    $card_classes .= ' prefix-card--' . esc_attr( $variant );
}

$wrapper_attributes = get_block_wrapper_attributes();
?>

<div <?php echo $wrapper_attributes; ?>>
    <article class="<?php echo esc_attr( $card_classes ); ?>">
        <header class="prefix-card__header">
            <h3 class="prefix-card__title"><?php echo esc_html( $title ); ?></h3>
        </header>
        <div class="prefix-card__content">
            <?php echo wp_kses_post( $content ); ?>
        </div>
    </article>
</div>
```

### When to Use Dynamic vs Static

| Consideration | Static Block | Dynamic Block |
|--------------|-------------|---------------|
| Frontend render | From saved HTML | From PHP on each request |
| Component markup changes | Causes block validation errors | No issues, just update PHP |
| Performance | Slightly faster (pre-rendered) | Runs PHP on each page load |
| Content freshness | Stored at save time | Always current |
| Best for | Simple, stable components | Components that may evolve |

**Recommendation:** Use dynamic blocks for most components. The flexibility to update markup without breaking existing content is worth the minor performance trade-off.

## Theme Integration

### How It Works

The component library uses a two-layer integration with block themes:

1. **`integrate.php`** — Injects a base `theme.json` via `wp_theme_json_data_default` (the lowest priority layer). This registers colors, spacing, fonts, and custom values with WordPress so they appear in the editor UI (Global Styles, block controls, etc.).

2. **`tokens.wp.css`** — Maps `--prefix-*` CSS variables to `--wp--preset--*` variables with hardcoded fallbacks. This means components automatically respond to theme.json overrides without manual CSS mapping.

### WordPress theme.json Cascade

The theme.json cascade (from lowest to highest priority):

1. **WordPress core defaults**
2. **Library base layer** ← `integrate.php` injects here via `wp_theme_json_data_default`
3. **Parent theme** `theme.json`
4. **Child theme** `theme.json`
5. **User Global Styles** (editor customizations)

Your theme's `theme.json` automatically overrides library defaults. No manual CSS variable mapping is needed — `tokens.wp.css` handles it.

See [Token Architecture](./TOKEN-ARCHITECTURE.md) for the full list of generated token mappings.

## Editor Styles

### Making Styles Work in the Block Editor

The block editor uses an iframe. Styles must be explicitly loaded inside it.

#### Tokens in the editor

The theme's `enqueue_block_editor_assets` hook (see [Theme Setup](#theme-setup)) loads `tokens.wp.css` into the editor iframe. This ensures CSS variables are available for all component blocks in the editor.

#### Component CSS in the editor

Add `editorStyle` to your block.json alongside `style`:

```json
{
    "style": ["prefix-card"],
    "editorStyle": ["prefix-card"]
}
```

This tells WordPress to load the component CSS in both the editor iframe and the frontend.

#### Editor-Specific Overrides

If components need adjustments inside the editor (e.g., different max-width):

```css
/* editor.css — enqueue via editorStyle */
.editor-styles-wrapper .prefix-card {
    max-width: 100%;
}
```

## Component Reference

### Card

**React Component:**

```tsx
import { Card } from 'your-component-library';

<Card title="My Title" variant="featured" className="extra-class">
    <p>Card content</p>
</Card>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | required | Card heading text |
| `children` | `ReactNode` | required | Card body content |
| `variant` | `'default' \| 'featured'` | `'default'` | Visual style |
| `className` | `string` | `''` | Additional CSS classes |

**PHP Markup:**

```html
<article class="prefix-card prefix-card--featured">
    <header class="prefix-card__header">
        <h3 class="prefix-card__title">My Title</h3>
    </header>
    <div class="prefix-card__content">
        <p>Card content</p>
    </div>
</article>
```

**CSS Files:** `tokens.wp.css` + `Card.css`

---

### Button

**React Component:**

```tsx
import { Button } from 'your-component-library';

<Button variant="primary" size="md" onClick={handleClick}>
    Click me
</Button>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | required | Button label |
| `variant` | `'primary' \| 'secondary' \| 'outline'` | `'primary'` | Visual style |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| `disabled` | `boolean` | `false` | Disabled state |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | HTML type attribute |
| `onClick` | `() => void` | — | Click handler |
| `className` | `string` | `''` | Additional CSS classes |

**PHP Markup:**

```html
<button class="prefix-button prefix-button--primary prefix-button--md">
    Click me
</button>

<!-- Disabled state -->
<button class="prefix-button prefix-button--primary prefix-button--md" disabled>
    Disabled
</button>
```

**CSS Files:** `tokens.wp.css` + `Button.css`

## Troubleshooting

### Styles not appearing on frontend

1. **Check the style handle is registered.** Verify `wp_register_style` is called on `init`
2. **Check the dependency chain.** Component CSS must depend on `prefix-tokens`
3. **Verify block.json `style` field** matches the registered handle name exactly
4. **Check file paths.** Use browser dev tools Network tab to see if CSS returns 404

### Styles not appearing in block editor

1. **Add `editorStyle` to block.json** — the editor iframe needs styles explicitly loaded
2. **Enqueue tokens via `enqueue_block_editor_assets`** — the editor needs tokens too
3. **Check for iframe isolation** — styles in the parent page don't reach the editor iframe

### CSS variables not taking effect

1. **Tokens must load before component CSS.** Set `['prefix-tokens']` as a dependency
2. **Check specificity.** Theme overrides may need to match or exceed library specificity
3. **Verify the variable names match.** Open browser dev tools and inspect the element

### Block validation errors (static blocks only)

If a saved static block shows "This block contains unexpected content":

1. The HTML structure in the save component doesn't match what's stored in the database
2. This happens when you update the component markup after content has been saved
3. **Fix:** Use the block recovery option in the editor, or switch to dynamic blocks

### Multiple blocks loading duplicate tokens

This is expected and fine. `wp_enqueue_style` is idempotent — if `prefix-tokens` is already enqueued, WordPress skips the duplicate. Using style dependencies ensures tokens always load before any component CSS.

### tokens.css vs tokens.wp.css

- **`tokens.css`** — Hardcoded values. Use for React/Next.js projects outside WordPress.
- **`tokens.wp.css`** — Maps to `--wp--preset--*` variables with hardcoded fallbacks. Use in WordPress so components respond to theme.json and Global Styles overrides.

If components aren't picking up your theme.json color/spacing changes, check that you're loading `tokens.wp.css` and not `tokens.css`.

### Performance with many block types

With this per-block loading approach:

- Only CSS for blocks present on the page gets enqueued
- `tokens.wp.css` loads once globally (~4KB)
- Each component CSS is typically 1-2KB
- A page with 5 different component blocks loads ~14KB of CSS total
- A page with 0 component blocks loads only the tokens (~4KB)

This scales well even with 70+ block types registered, since only the blocks actually used on each page load their CSS.

---

## Known Issues

### Style variation preview shows blank colors for the default palette

**Symptom:** When using style variations (JSON files in the theme's `styles/` directory), the default variation's color palette preview appears as white/blank in the Site Editor's style picker, even though the palette works correctly when applied.

**Cause:** The style variation preview does not read colors from `settings.color.palette`. Instead, it extracts colors from the `styles` section — specifically `styles.color.text` and `styles.elements.button.color.background`. If the theme's root `theme.json` has no `styles` section, the preview has no colors to render.

This is a WordPress core behavior introduced in [Gutenberg PR #59514](https://github.com/WordPress/gutenberg/pull/59514). There is an [open issue (#60478)](https://github.com/WordPress/gutenberg/issues/60478) proposing a `settings.example` property to let theme authors explicitly control preview colors, but it has not been implemented yet.

**Workaround:** Add a `styles` section to both your theme's root `theme.json` and each style variation JSON file. The preview needs `styles.color` and `styles.elements.button` to render swatches:

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

**Why the library can't fix this:** The `styles` section defines how tokens are *applied* to page elements (background, text, buttons), which is a theme-level concern. The library provides the design tokens (`settings`), but the theme decides how to use them. Each theme and style variation will map different palette colors to background, text, and button roles.

### Avoid `defaultPalette: false` in the library's theme.json

**Symptom:** Setting `"defaultPalette": false` in `settings.color` causes the library's own color palette to disappear.

**Cause:** The library's `theme.json` is injected at the WordPress default layer via `wp_theme_json_data_default`. The `defaultPalette: false` setting tells WordPress to exclude the default palette — which includes the library's palette since it lives at that layer.

**Recommendation:** Do not add `defaultPalette: false` to the library's generated `theme.json`. If a theme needs to remove the WordPress default palette, it should set this in its own `theme.json` (layer 3), where it won't affect the library's injected palette.

The library's generated `theme.json` uses `"custom": false` and `"customGradient": false` to disable the custom color picker in the Site Editor. These settings are safe at the default layer and can be overridden by themes that want to re-enable them.
