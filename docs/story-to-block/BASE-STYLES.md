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

`src/styles/content.scss` applies base typography inside an opt-in wrapper class. Everything inside uses `:where()` for zero specificity:

```scss
// content.scss — opt-in prose typography

.example-content {
  :where(h1) {
    font-size: var(--design-system--font-size-2x-large);
    font-weight: 700;
    line-height: 1.2;
  }

  :where(h2) {
    font-size: var(--design-system--font-size-x-large);
    font-weight: 700;
    line-height: 1.3;
  }

  :where(h3) {
    font-size: var(--design-system--font-size-large);
    font-weight: 600;
    line-height: 1.4;
  }

  :where(p) {
    font-size: var(--design-system--font-size-medium);
    line-height: 1.5;
  }

  :where(ul, ol) {
    list-style: revert;
    padding-left: 1.25em;
  }

  :where(a) {
    color: var(--design-system--color-primary);
    text-decoration: underline;
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

In WordPress, the content scope class maps naturally to a block theme's post content area. However, WordPress already applies base typography through theme.json — so you may not need the content class at all.

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
├── tokens.css       (generated — design token values)
├── fonts.css        (generated — @font-face declarations)
├── reset.scss       (structural reset — no typography)
├── content.scss     (opt-in prose typography via .example-content)
└── _mixins.scss     (shared component utilities)
```

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

The content scope (`.example-content` with `:where()` rules) and theme.json `styles` serve the same purpose for different consumers:

| Concern | Storybook / React | WordPress |
|---------|-------------------|-----------|
| Body default font | `content.scss` — body-level rules | `styles.typography` |
| Heading scale | `content.scss` — `:where(h1)` etc. | `styles.elements.h1` etc. |
| Shared heading font | `content.scss` — `:where(h1, h2, ...)` | `styles.elements.heading` |
| Caption styling | `content.scss` — `:where(figcaption)` | `styles.elements.caption` |
| Prose spacing | `content.scss` — margin rules | Block gap / theme.json spacing |

Note that WordPress heading sizes in `styles.elements` can use hardcoded values (like `3rem`) or reference presets (like `var(--wp--preset--font-size--x-large)`). Hardcoded values mean the heading scale stays fixed even if a theme changes the font size presets. Referencing presets makes individual heading sizes themeable via the Site Editor.

### Future: One Config, Both Outputs

Long term, a `baseStyles` or `typography` section in `stb.config.json` could define the heading scale, body defaults, and element-level overrides once. The generator would produce:

- `content.scss` — with `:where()` rules for Storybook and React consumers
- `styles` block in theme.json — for WordPress consumers

This keeps the same single-source-of-truth pattern already established for design tokens. The config declares *what the typography should be*, and the generator produces the right output format for each target.

## Relationship to WordPress Blocks

Components (blocks) are self-contained. Each block carries its own styles via BEM classes and does not depend on content scope or theme.json `styles`.

The content scope and `styles.elements` exist for the areas *between* blocks — bare HTML in post bodies, widget areas, and other prose content. When the generator eventually produces PHP render templates and `block.json` files, those block-level styles are separate from the base typography layer described here.
