# Storybook Starter for Gutenberg

A starter project for building component libraries that integrate seamlessly with WordPress Gutenberg blocks.

## Features

- **Storybook 10** for component development and documentation
- **Vite** for fast builds
- **TypeScript** for type safety
- **CSS Variables** for easy theming
- **Dual CSS output** - individual files for WordPress, bundled for React/Next.js

## Quick Start

```bash
# Install dependencies
npm install

# Start Storybook development server
npm run dev

# Build the library
npm run build
```

## Project Structure

```
├── .storybook/          # Storybook configuration
├── src/
│   ├── components/      # Component library
│   │   └── Card/
│   │       ├── Card.tsx
│   │       ├── Card.css
│   │       ├── Card.stories.tsx
│   │       └── index.ts
│   ├── styles/
│   │   ├── tokens.css   # CSS variables (design tokens)
│   │   └── reset.css    # Base styles
│   └── index.ts         # Library entry point
├── dist/                # Build output
│   ├── index.js         # ES module bundle
│   ├── index.d.ts       # TypeScript declarations
│   ├── styles.css       # Bundled CSS (all components)
│   └── css/             # Individual CSS files
│       ├── tokens.css
│       ├── reset.css
│       └── Card.css
└── scripts/
    └── build-css.js     # CSS build script
```

## Customizing the Prefix

All CSS variables use the `--prefix-` prefix (Component UI Library). To customize:

1. Open `src/styles/tokens.css`
2. Find and replace `--prefix-` with your prefix (e.g., `--mylib-`)
3. Update component CSS files with the same replacement

## Usage

### WordPress Blocks (Recommended for WP)

For optimal WordPress performance, load CSS per-component:

**Register styles in PHP:**

```php
// Register tokens globally (in theme or plugin init)
wp_register_style(
  'prefix-tokens',
  'path/to/your-lib/dist/css/tokens.css',
  [],
  '1.0.0'
);

// Register component styles with token dependency
wp_register_style(
  'prefix-card',
  'path/to/your-lib/dist/css/Card.css',
  ['prefix-tokens'],
  '1.0.0'
);
```

**In block.json:**

```json
{
  "style": "file:./css/Card.css",
  "editorStyle": "file:./css/Card.css"
}
```

**Static block (JS rendered):**

```tsx
// edit.tsx - CSS loaded via block.json, not JS import
import { Card } from 'your-component-library';

export default function Edit({ attributes }) {
  return <Card title={attributes.title}>{attributes.content}</Card>;
}
```

**Dynamic block (PHP rendered):**

```php
function render_card_block($attributes) {
  return sprintf(
    '<article class="prefix-card">
      <header class="prefix-card__header">
        <h3 class="prefix-card__title">%s</h3>
      </header>
      <div class="prefix-card__content">%s</div>
    </article>',
    esc_html($attributes['title']),
    wp_kses_post($attributes['content'])
  );
}
```

### React/Next.js

For non-WordPress projects, import the bundled CSS once:

```tsx
// _app.tsx or layout.tsx
import 'your-component-library/styles.css';

// Use components anywhere
import { Card } from 'your-component-library';

function MyPage() {
  return (
    <Card title="Hello">
      <p>Card content here</p>
    </Card>
  );
}
```

## WordPress theme.json Integration

Map CSS variables to WordPress theme values:

```css
/* In your theme's CSS */
:root {
  --prefix-color-primary: var(--wp--preset--color--primary);
  --prefix-spacing-md: var(--wp--preset--spacing--40);
  --prefix-font-family-base: var(--wp--preset--font-family--body);
}
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Storybook development server |
| `npm run build` | Build library for distribution |
| `npm run build:lib` | Build JS/TS only |
| `npm run build:css` | Build CSS files only |
| `npm run build-storybook` | Build static Storybook site |
| `npm run typecheck` | Run TypeScript type checking |

## Adding Components

1. Create a folder: `src/components/ComponentName/`
2. Add files:
   - `ComponentName.tsx` - Component implementation
   - `ComponentName.css` - Component styles
   - `ComponentName.stories.tsx` - Storybook stories
   - `index.ts` - Public export
3. Export from `src/index.ts`

## Publishing

1. Update `name` in `package.json` to your package name
2. Update `version` as needed
3. Run `npm run build`
4. Run `npm publish`

## License

MIT
