# Base Styles Approach

This document outlines how base typography and content styles fit into the design system, balancing Storybook development, React/Next.js consumption, and WordPress block output.

## The Problem

A component library needs base typography for prose content (paragraphs, headings, lists), but global element styles create conflicts:

- WordPress block themes apply their own base typography from theme.json
- React/Next.js apps may have their own resets and global styles
- Components should be self-contained and work identically across all targets

Global `h2 { ... }` or `p { ... }` rules fight with every consumer's existing styles.

## Approach: Scoped Content Styles with Zero-Specificity Internals

Two layers work together:

1. **Reset** — strips browser defaults so components start from a clean slate
2. **Content scope** — applies base typography to prose areas via an opt-in class, using `:where()` so component styles always win

### Layer 1: Reset (what exists today)

`src/styles/reset.scss` handles box-sizing, margin removal, list resets, and form normalization. It does not apply any typography — no font sizes, no line heights on elements, no heading scales. It's purely structural.

```scss
// reset.scss — structural only, no typography opinions

*,
*::before,
*::after {
  box-sizing: border-box;
}

h1, h2, h3, h4, h5, h6,
p, figure, blockquote, dl, dd {
  margin: 0;
}

ul, ol {
  list-style: none;
  margin: 0;
  padding: 0;
}
```

### Layer 2: Content Scope

Content styles are split into two files — a generated partial for element typography and an authored file for behavioral rules:

#### Generated: `_content-generated.scss`

The generator reads the `baseStyles` section from `stb.config.json` and produces `_content-generated.scss`. This partial contains `:where()` rules for each element defined in the config:

```scss
// _content-generated.scss — do not edit manually

font-family: var(--design-system--font-family-inter);
font-size: var(--design-system--font-size-medium);
font-weight: 400;
line-height: 1.6;

:where(h1, h2, h3, h4, h5, h6) {
  font-family: var(--design-system--font-family-inter);
}

:where(h1) {
  font-size: 4.5rem;
  font-style: normal;
  font-weight: 500;
}

:where(h2) {
  font-size: 3rem;
  font-style: normal;
  font-weight: 500;
}

:where(h3) {
  font-size: 2.5rem;
  font-style: normal;
  font-weight: 500;
}

:where(h4) {
  font-size: 2rem;
  font-style: normal;
  font-weight: 500;
}

:where(h5) {
  font-size: 1.5rem;
  font-style: normal;
  font-weight: 500;
}

:where(h6) {
  font-size: 1.45rem;
  font-style: italic;
  font-weight: 500;
}

:where(figcaption) {
  font-size: var(--design-system--font-size-small);
  font-style: italic;
  font-weight: 300;
}
```

This partial outputs bare declarations and `:where()` rules without a wrapping selector — it's designed to be included inside the content scope class in `content.scss`.

#### Authored: `content.scss`

You own this file. It imports the generated partial and adds behavioral rules that don't belong in a config — vertical rhythm, list styles, link styles, and anything else specific to prose content:

```scss
// content.scss — you own this file

.example-content {
  // Generated element typography from stb.config.json
  @use 'content-generated';

  // List styles
  :where(ul, ol) {
    list-style: revert;
    padding-left: 1.25em;
  }

  // Link styles
  :where(a) {
    color: var(--design-system--color-primary);
    text-decoration: underline;

    &:hover {
      color: var(--design-system--color-primary-hover);
    }
  }

  // Vertical rhythm between block elements
  :where(h1, h2, h3, h4, h5, h6, p, ul, ol, blockquote, figure) {
    & + & {
      margin-top: var(--design-system--spacing-small);
    }
  }

  // Extra space before headings that follow content
  :where(p, ul, ol, blockquote) + :where(h1, h2, h3, h4, h5, h6) {
    margin-top: var(--design-system--spacing-medium);
  }
}
```

When the generator runs, only `_content-generated.scss` changes. Your authored rules in `content.scss` are untouched.

### The Config

The `baseStyles` section in `stb.config.json` defines element-level typography. Values that match a token key (like `"inter"` or `"medium"`) resolve to the corresponding CSS variable. Raw values (like `"3rem"`) pass through as-is:

```json
{
  "baseStyles": {
    "body": {
      "fontFamily": "inter",
      "fontSize": "medium",
      "fontWeight": "400",
      "lineHeight": "1.6"
    },
    "heading": {
      "fontFamily": "inter"
    },
    "h1": { "fontSize": "4.5rem", "fontWeight": "500" },
    "h2": { "fontSize": "3rem", "fontWeight": "500" },
    "h3": { "fontSize": "2.5rem", "fontWeight": "500" },
    "h4": { "fontSize": "2rem", "fontWeight": "500" },
    "h5": { "fontSize": "1.5rem", "fontWeight": "500" },
    "h6": { "fontSize": "1.45rem", "fontWeight": "500", "fontStyle": "italic" },
    "caption": { "fontSize": "small", "fontStyle": "italic", "fontWeight": "300" }
  }
}
```

From this single config, the generator produces:

- `_content-generated.scss` — `:where()` rules referencing design system CSS variables
- `styles` block in theme.json — referencing `--wp--preset--*` variables

The token key resolution works differently per output:

| Config value | `_content-generated.scss` | theme.json `styles` |
|--------------|---------------------------|---------------------|
| `"inter"` (token key) | `var(--design-system--font-family-inter)` | `var(--wp--preset--font-family--inter)` |
| `"medium"` (token key) | `var(--design-system--font-size-medium)` | `var(--wp--preset--font-size--medium)` |
| `"3rem"` (raw value) | `3rem` | `3rem` |
| `"500"` (raw value) | `500` | `500` |

## Why `:where()` Matters

The key is specificity. Compare these selectors:

| Selector | Specificity | Source |
|----------|-------------|--------|
| `.example-content :where(p)` | `0,1,0` | Content scope |
| `.example-card__content p` | `0,1,1` | Component |
| `.example-content p` (without :where) | `0,1,1` | Would conflict |

With `:where()`, the content scope styles at `0,1,0` always lose to any component class at `0,1,1`. No ordering tricks needed, no specificity battles.

### What this means in practice

A Card component rendered inside a content area:

```html
<div class="example-content">
  <h2>Blog Post Title</h2>
  <p>Introductory paragraph styled by content scope.</p>

  <!-- Card handles its own typography — content scope doesn't interfere -->
  <article class="example-card">
    <header class="example-card__header">
      <h2 class="example-card__title">Card Title</h2>
    </header>
    <div class="example-card__content">
      <p>Card paragraph styled by component, not content scope.</p>
    </div>
  </article>

  <p>Continuing paragraph styled by content scope again.</p>
</div>
```

The bare `<h2>` and `<p>` outside the Card get content scope styles. The `<h2>` and `<p>` inside the Card are styled by `.example-card__title` and `.example-card__content p` — which both have higher specificity than `.example-content :where(h2)`.

## How Each Consumer Uses This

### Storybook

Import in the preview alongside tokens and reset:

```ts
// .storybook/preview.ts
import '../src/styles/tokens.css';
import '../src/styles/fonts.css';
import '../src/styles/reset.scss';
import '../src/styles/content.scss';
```

Use in page-level stories that show prose content:

```tsx
export const BlogLayout: Story = {
  render: () => (
    <div className="example-content">
      <h1>Article Title</h1>
      <p>This paragraph gets base typography from the content scope.</p>
      <Card title="Related">
        <p>This paragraph is styled by the Card component.</p>
      </Card>
    </div>
  ),
};
```

### React / Next.js

Consumers import the content stylesheet when they need prose styling:

```tsx
import 'your-component-library/css/tokens.css';
import 'your-component-library/css/content.css';

function BlogPost({ html }) {
  return (
    <article className="example-content" dangerouslySetInnerHTML={{ __html: html }} />
  );
}
```

Components used outside a content wrapper get no base typography applied — they're fully self-contained.

### WordPress

In WordPress, the content scope class is not needed. The `styles` block in theme.json handles base typography for the post content area natively. WordPress applies those styles through its own cascade — no extra class required.

If the library is used as a plugin (not a theme), the class can be applied to the content wrapper to provide consistent typography without relying on theme.json:

```php
<div class="example-content">
  <?php the_content(); ?>
</div>
```

## Component Styles Stay Self-Contained

Components never rely on the content scope. Every component owns its own typography:

```scss
// Card.scss — fully self-contained, no dependency on content.scss

.example-card {
  &__title {
    font-size: var(--design-system--font-size-x-large);
    font-weight: 700;
    line-height: 1.5;
  }

  &__content {
    font-size: var(--design-system--font-size-medium);
    line-height: 1.5;

    p + p {
      margin-top: var(--design-system--spacing-2x-small);
    }
  }
}
```

The Card works identically whether it's inside `.example-content` or not. The content scope is for bare elements in prose areas — components don't need it and aren't affected by it.

## File Structure

```
src/styles/
├── tokens.css                (generated — design token values)
├── fonts.css                 (generated — @font-face declarations)
├── _content-generated.scss   (generated — element typography from config)
├── content.scss              (authored — imports generated partial + behavioral rules)
├── reset.scss                (authored — structural reset, no typography)
└── _mixins.scss              (authored — shared component utilities)
```

The generator only writes files prefixed with `_content-generated` or without the underscore convention for CSS/tokens. Authored files (`content.scss`, `reset.scss`, `_mixins.scss`) are never touched by the generator.

## Relationship to WordPress theme.json

WordPress theme.json has two top-level sections that map to different parts of this system:

### `settings` — What's Available

This is what `story-to-block` generates today. It declares the palette, font size scale, spacing scale, shadows, and other presets. These appear in the Site Editor controls and generate `--wp--preset--*` CSS variables:

```json
{
  "settings": {
    "color": {
      "palette": [
        { "slug": "primary", "color": "#0073aa", "name": "Primary" }
      ]
    },
    "typography": {
      "fontFamilies": [
        { "slug": "inter", "fontFamily": "Inter, sans-serif", "name": "Inter" }
      ],
      "fontSizes": [
        { "slug": "medium", "size": "1.125rem", "name": "Medium", "fluid": { "min": "1rem", "max": "1.125rem" } }
      ]
    }
  }
}
```

### `styles` — How Things Look by Default

This is the WordPress equivalent of the content scope. It defines base typography for the body and individual elements. WordPress applies these styles to bare elements within the post content area:

```json
{
  "styles": {
    "typography": {
      "fontFamily": "var(--wp--preset--font-family--inter)",
      "fontSize": "var(--wp--preset--font-size--medium)",
      "fontStyle": "normal",
      "fontWeight": "400",
      "lineHeight": "1.6"
    },
    "elements": {
      "heading": {
        "typography": {
          "fontFamily": "var(--wp--preset--font-family--inter)"
        }
      },
      "h1": {
        "typography": {
          "fontSize": "4.5rem",
          "fontStyle": "normal",
          "fontWeight": "500"
        }
      },
      "h2": {
        "typography": {
          "fontSize": "3rem",
          "fontStyle": "normal",
          "fontWeight": "500"
        }
      },
      "h3": {
        "typography": {
          "fontSize": "2.5rem",
          "fontStyle": "normal",
          "fontWeight": "500"
        }
      },
      "h4": {
        "typography": {
          "fontSize": "2rem",
          "fontStyle": "normal",
          "fontWeight": "500"
        }
      },
      "h5": {
        "typography": {
          "fontSize": "1.5rem",
          "fontStyle": "normal",
          "fontWeight": "500"
        }
      },
      "h6": {
        "typography": {
          "fontSize": "1.45rem",
          "fontStyle": "italic",
          "fontWeight": "500"
        }
      },
      "caption": {
        "typography": {
          "fontSize": "var(--wp--preset--font-size--small)",
          "fontStyle": "italic",
          "fontWeight": "300"
        }
      }
    }
  }
}
```

### Two Sides of the Same Coin

The content scope (`.example-content` with `:where()` rules) and theme.json `styles` serve the same purpose for different consumers. Both are generated from the same `baseStyles` config:

| Concern | Storybook / React | WordPress |
|---------|-------------------|-----------|
| Body default font | `_content-generated.scss` — body-level rules | `styles.typography` |
| Heading scale | `_content-generated.scss` — `:where(h1)` etc. | `styles.elements.h1` etc. |
| Shared heading font | `_content-generated.scss` — `:where(h1, h2, ...)` | `styles.elements.heading` |
| Caption styling | `_content-generated.scss` — `:where(figcaption)` | `styles.elements.caption` |
| Prose spacing | `content.scss` — authored margin rules | Block gap / theme.json spacing |
| List styles | `content.scss` — authored `:where(ul, ol)` | Not in theme.json |
| Link styles | `content.scss` — authored `:where(a)` | Not in theme.json |

Note that WordPress heading sizes in `styles.elements` can use hardcoded values (like `3rem`) or reference presets (like `var(--wp--preset--font-size--x-large)`). Hardcoded values mean the heading scale stays fixed even if a theme changes the font size presets. Referencing presets makes individual heading sizes themeable via the Site Editor.

## Relationship to WordPress Blocks

Components (blocks) are self-contained. Each block carries its own styles via BEM classes and does not depend on content scope or theme.json `styles`.

The content scope and `styles.elements` exist for the areas *between* blocks — bare HTML in post bodies, widget areas, and other prose content. When the generator eventually produces PHP render templates and `block.json` files, those block-level styles are separate from the base typography layer described here.
