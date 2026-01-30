# Gutenberg Integration Guide

This guide covers how to use the component library in WordPress Gutenberg blocks. It assumes you have a WordPress plugin or theme that registers custom blocks.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installing the Library](#installing-the-library)
- [CSS Loading Strategy](#css-loading-strategy)
- [Registering Styles in WordPress](#registering-styles-in-wordpress)
- [Static Blocks (JS Rendered)](#static-blocks-js-rendered)
- [Dynamic Blocks (PHP Rendered)](#dynamic-blocks-php-rendered)
- [Theme Integration](#theme-integration)
- [Editor Styles](#editor-styles)
- [Component Reference](#component-reference)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- WordPress 6.0+
- Node.js 20+ (for building blocks with `@wordpress/scripts`)
- A custom block plugin or theme that registers blocks
- This component library installed as a dependency

## Installing the Library

From your block plugin or theme directory:

```bash
npm install your-component-library
```

After installing, the library provides JS/CSS assets via `node_modules`. WordPress-specific PHP and theme.json files must be **copied into your theme** — they cannot be loaded from `node_modules` at runtime since that directory does not exist on production servers.

### Published package structure

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

### Copy WordPress files into your theme

```bash
# Create a directory in your theme for the library files
mkdir -p inc/story-to-block

# Copy the PHP integration and theme.json
cp node_modules/your-component-library/dist/wp/integrate.php inc/story-to-block/
cp node_modules/your-component-library/dist/wp/theme.json inc/story-to-block/

# Copy CSS assets into your theme's assets directory
mkdir -p assets/css/components
cp node_modules/your-component-library/dist/wp/tokens.wp.css assets/css/components/
cp node_modules/your-component-library/dist/css/Card.css assets/css/components/
cp node_modules/your-component-library/dist/css/Button.css assets/css/components/
```

**Key files for WordPress:**

- **`integrate.php`** — Loads the library's `theme.json` as a base layer via `wp_theme_json_data_default`. Copy into your theme and include via `require_once` in `functions.php`. Your theme's own `theme.json` overrides any values.
- **`tokens.wp.css`** — CSS variables that map `--prefix-*` to `--wp--preset--*` with hardcoded fallbacks. Use this instead of `tokens.css` so components automatically pick up theme.json overrides.
- **`theme.json`** — Generated from `stb.config.json`. Contains the color palette, spacing scale, font families, font sizes, and custom values. Not meant to be edited directly.

See [Token Architecture](./TOKEN-ARCHITECTURE.md) for details on how these files are generated from a single config.

## CSS Loading Strategy

WordPress loads block assets per-page based on which blocks are present. To maintain this performance benefit, load CSS files individually per-block rather than loading the full bundle.

### What to load where

| File | When to Load | How |
|------|-------------|-----|
| `integrate.php` | Always (once in functions.php) | `require_once` — injects base theme.json |
| `tokens.wp.css` | Always (globally) | `wp_enqueue_style` in theme/plugin init |
| `reset.css` | Optional, globally | `wp_enqueue_style` in theme/plugin init |
| `Card.css` | Only when Card block is used | `block.json` style field or block render |
| `Button.css` | Only when Button block is used | `block.json` style field or block render |
| `tokens.css` | Never in WordPress | Use `tokens.wp.css` instead |
| `styles.css` | Never in WordPress | Use individual files instead |

**Why `tokens.wp.css` instead of `tokens.css`?**

`tokens.css` contains hardcoded values (`--prefix-color-primary: #0073aa`). It works, but components won't respond to theme.json overrides.

`tokens.wp.css` maps to WordPress preset variables with fallbacks (`--prefix-color-primary: var(--wp--preset--color--primary, #0073aa)`). When a theme overrides the primary color in its theme.json, components automatically pick up the new value.

## Registering Styles in WordPress

### Step 1: Load integrate.php and Register Global Styles

In your theme's `functions.php`:

```php
/**
 * Load the component library's base theme.json layer.
 * Copy integrate.php and theme.json into your theme (e.g. inc/story-to-block/).
 */
require_once get_template_directory() . '/inc/story-to-block/integrate.php';

/**
 * Register component library design tokens.
 * These must load on every page since all components depend on them.
 */
function prefix_register_component_styles() {
    $theme_uri = get_template_directory_uri();

    wp_register_style(
        'prefix-tokens',
        $theme_uri . '/assets/css/components/tokens.wp.css',
        [],
        '0.0.1'
    );

    // Enqueue globally — all components need these variables
    wp_enqueue_style('prefix-tokens');

    // Optional: enqueue reset if you want the base styles
    wp_register_style(
        'prefix-reset',
        $theme_uri . '/assets/css/components/reset.css',
        ['prefix-tokens'],
        '0.0.1'
    );
}
add_action('wp_enqueue_scripts', 'prefix_register_component_styles');
add_action('enqueue_block_editor_assets', 'prefix_register_component_styles');
```

> **Note:** `integrate.php` handles the theme.json base layer (colors, spacing, fonts in the WordPress UI). `tokens.wp.css` maps `--prefix-*` variables to `--wp--preset--*` so components respond to theme.json overrides. Both are needed for full integration.

### Step 2: Register Component Styles Per-Block

Each block registers only the CSS it needs:

```php
/**
 * Register component styles for individual blocks.
 * WordPress will only enqueue these when the block is on the page.
 */
function prefix_register_block_styles() {
    $theme_uri = get_template_directory_uri();

    // Card component CSS
    wp_register_style(
        'prefix-card',
        $theme_uri . '/assets/css/components/Card.css',
        ['prefix-tokens'],
        '0.0.1'
    );

    // Button component CSS
    wp_register_style(
        'prefix-button',
        $theme_uri . '/assets/css/components/Button.css',
        ['prefix-tokens'],
        '0.0.1'
    );
}
add_action('init', 'prefix_register_block_styles');
```

### Step 3: Associate Styles with Blocks

#### Option A: Via block.json (recommended)

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

The `style` array references the handle you registered with `wp_register_style`. WordPress will enqueue it automatically when the block appears on a page.

#### Option B: Via PHP (for dynamic blocks)

```php
register_block_type('your-plugin/card', [
    'render_callback' => 'render_card_block',
    'style_handles'   => ['prefix-card'],
    'editor_style_handles' => ['prefix-card'],
]);
```

#### Option C: Manual enqueue in render callback

```php
function render_card_block($attributes) {
    // Enqueue only when this block actually renders
    wp_enqueue_style('prefix-card');

    return sprintf(
        '<article class="prefix-card">...</article>',
        // ...
    );
}
```

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

### Setup

Add one line to your theme's `functions.php` (if not already done in Step 1):

```php
require_once get_template_directory() . '/inc/story-to-block/integrate.php';
```

That's it. The library's colors, spacing, and fonts now appear as defaults in the WordPress editor.

### Overriding Defaults in Your Theme

Override any library default by defining the same slug in your theme's `theme.json`:

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
        },
        "spacing": {
            "spacingSizes": [
                { "slug": "40", "size": "1.25rem", "name": "Medium" }
            ]
        }
    }
}
```

Because `tokens.wp.css` maps `--prefix-color-primary` to `var(--wp--preset--color--primary, #0073aa)`, the component automatically picks up `#e63946` from your theme — no additional CSS needed.

See [Token Architecture](./TOKEN-ARCHITECTURE.md) for the full list of generated token mappings.

## Editor Styles

### Making Styles Work in the Block Editor

The block editor uses an iframe. Styles must be explicitly loaded inside it.

#### Using editorStyle in block.json

The simplest approach — add `editorStyle` to your block.json:

```json
{
    "style": ["prefix-card"],
    "editorStyle": ["prefix-card"]
}
```

This tells WordPress to load the style in both the editor iframe and the frontend.

#### Loading Tokens in the Editor

The tokens must also be available in the editor. Add them via `enqueue_block_editor_assets`:

```php
function prefix_enqueue_editor_assets() {
    wp_enqueue_style(
        'prefix-tokens',
        get_template_directory_uri() . '/assets/css/components/tokens.wp.css',
        [],
        '0.0.1'
    );
}
add_action('enqueue_block_editor_assets', 'prefix_enqueue_editor_assets');
```

> **Note:** If you already enqueue `tokens.wp.css` on both `wp_enqueue_scripts` and `enqueue_block_editor_assets` in Step 1, this separate function is not needed.

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
