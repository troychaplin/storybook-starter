# Storybook Starter for Gutenberg Integration

A starter project for building component libraries that integrate seamlessly with WordPress Gutenberg blocks.

## Project Goals

- Provide a cloneable starter for building UI component libraries
- Optimize for Gutenberg block development (both static and dynamic blocks)
- Use CSS variables for easy theming and WordPress theme.json compatibility
- Support both React component usage and CSS-only consumption

## Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 20 LTS (18 LTS compatible) | Runtime |
| Vite | Latest | Build tool |
| Storybook | 8.x | Component documentation |
| React | 18.x | Component authoring (matches WP 6.x) |
| TypeScript | 5.x | Type safety and documentation |
| CSS | Modern (with nesting) | Styling - no preprocessor |

## Package Manager

**npm** - Chosen for universal compatibility since this is a starter project others will clone.

## Directory Structure

```
storybook-starter/
├── .storybook/
│   ├── main.ts              # Storybook configuration
│   ├── preview.ts           # Global decorators, parameters
│   └── manager.ts           # Storybook UI customization (optional)
├── src/
│   ├── components/
│   │   └── Card/
│   │       ├── Card.tsx     # Component implementation
│   │       ├── Card.stories.tsx  # Storybook stories
│   │       ├── Card.css     # Component styles
│   │       └── index.ts     # Public export
│   ├── styles/
│   │   ├── tokens.css       # CSS variables (design tokens)
│   │   └── reset.css        # Minimal reset/base styles
│   └── index.ts             # Library entry point
├── dist/                    # Build output (generated)
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## CSS Variable Strategy

### Prefix Convention

All CSS variables use the `--prefix-` prefix (Component UI Library).

**To customize for your project:**
1. Open `src/styles/tokens.css`
2. Find and replace `--prefix-` with your prefix (e.g., `--mylib-`)
3. Update component CSS files with the same replacement

### Token Categories

```css
/* tokens.css structure */

/* Colors */
--prefix-color-primary: #0073aa;
--prefix-color-secondary: #23282d;
--prefix-color-text: #1e1e1e;
--prefix-color-background: #ffffff;
--prefix-color-border: #dcdcde;

/* Spacing */
--prefix-spacing-xs: 0.25rem;
--prefix-spacing-sm: 0.5rem;
--prefix-spacing-md: 1rem;
--prefix-spacing-lg: 1.5rem;
--prefix-spacing-xl: 2rem;

/* Typography */
--prefix-font-family-base: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
--prefix-font-size-sm: 0.875rem;
--prefix-font-size-base: 1rem;
--prefix-font-size-lg: 1.25rem;
--prefix-font-size-xl: 1.5rem;

/* Border Radius */
--prefix-radius-sm: 2px;
--prefix-radius-md: 4px;
--prefix-radius-lg: 8px;

/* Shadows */
--prefix-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--prefix-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
```

### WordPress theme.json Mapping

Users can map these variables to WordPress theme.json values in their theme:

```css
/* In WordPress theme - override tokens */
:root {
  --prefix-color-primary: var(--wp--preset--color--primary);
  --prefix-spacing-md: var(--wp--preset--spacing--40);
  --prefix-font-family-base: var(--wp--preset--font-family--body);
}
```

## Component Guidelines

### Naming Conventions

- **CSS classes:** BEM-style with prefix: `.prefix-card`, `.prefix-card__header`, `.prefix-card--featured`
- **Component files:** PascalCase: `Card.tsx`, `Card.stories.tsx`
- **CSS files:** Match component name: `Card.css`

### Component Structure

Each component should include:

1. **TypeScript interface** - Documented props
2. **Semantic HTML** - Accessible markup
3. **CSS classes** - Predictable, documented class names
4. **Stories** - Usage examples and controls

### Example Component Pattern

```tsx
// Card.tsx
import './Card.css';

export interface CardProps {
  /** Card title displayed in the header */
  title: string;
  /** Main content of the card */
  children: React.ReactNode;
  /** Visual variant */
  variant?: 'default' | 'featured';
  /** Additional CSS classes */
  className?: string;
}

export function Card({
  title,
  children,
  variant = 'default',
  className = ''
}: CardProps) {
  const classes = [
    'prefix-card',
    variant !== 'default' && `prefix-card--${variant}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <article className={classes}>
      <header className="prefix-card__header">
        <h3 className="prefix-card__title">{title}</h3>
      </header>
      <div className="prefix-card__content">
        {children}
      </div>
    </article>
  );
}
```

## Gutenberg Integration Patterns

### CSS Loading Strategy

This library supports two CSS consumption patterns:

| Pattern | Use Case | Import |
|---------|----------|--------|
| **Individual CSS** | WordPress blocks (per-block loading) | `your-lib/dist/css/Card.css` |
| **Bundled CSS** | React/Next.js apps | `your-lib/dist/styles.css` |

**Important:** Tokens CSS (`tokens.css`) should always be loaded once globally, as it contains the CSS variables all components depend on.

### WordPress Block Usage (Recommended for WP)

For optimal WordPress performance, load CSS per-component:

**In block.json:**
```json
{
  "style": "file:./css/card.css",
  "editorStyle": "file:./css/card.css"
}
```

**Or enqueue manually in PHP:**
```php
// In your block's register function
wp_register_style(
  'prefix-card',
  'path/to/your-component-library/dist/css/Card.css',
  ['prefix-tokens'], // Depends on tokens
  '1.0.0'
);

// Register tokens once globally (in theme or plugin init)
wp_register_style(
  'prefix-tokens',
  'path/to/your-component-library/dist/css/tokens.css',
  [],
  '1.0.0'
);
```

**Static block (JS rendered):**
```tsx
// edit.tsx - CSS loaded via block.json, not JS import
import { Card } from 'your-component-library';

export default function Edit({ attributes, setAttributes }) {
  return (
    <Card title={attributes.title}>
      <RichText
        value={attributes.content}
        onChange={(content) => setAttributes({ content })}
      />
    </Card>
  );
}
```

**Dynamic block (PHP rendered):**
```php
function render_card_block($attributes) {
  $classes = 'prefix-card';
  if (!empty($attributes['variant'])) {
    $classes .= ' prefix-card--' . esc_attr($attributes['variant']);
  }

  return sprintf(
    '<article class="%s">
      <header class="prefix-card__header">
        <h3 class="prefix-card__title">%s</h3>
      </header>
      <div class="prefix-card__content">%s</div>
    </article>',
    esc_attr($classes),
    esc_html($attributes['title']),
    wp_kses_post($attributes['content'])
  );
}
```

### React/Next.js Usage

For non-WordPress projects, import the bundled CSS once:

```tsx
// _app.tsx or layout.tsx
import 'your-component-library/dist/styles.css';

// Then use components anywhere
import { Card } from 'your-component-library';
```

## Build Outputs

The build process generates:

```
dist/
├── index.js              # ES module bundle (React components)
├── index.d.ts            # TypeScript declarations
├── styles.css            # Bundled CSS (all components + tokens)
└── css/                  # Individual CSS files
    ├── tokens.css        # CSS variables (load globally)
    ├── reset.css         # Base styles (optional)
    ├── Card.css          # Card component styles
    └── [Component].css   # One file per component
```

### Package.json Exports

```json
{
  "name": "your-component-library",
  "version": "0.0.1",
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./styles.css": "./dist/styles.css",
    "./css/*": "./dist/css/*"
  },
  "files": ["dist"],
  "sideEffects": ["**/*.css"]
}
```

## Build Configuration

### Vite Library Build

The Vite config will:
1. Build React components as ES modules
2. Generate TypeScript declarations
3. Copy individual CSS files to `dist/css/`
4. Generate bundled `styles.css` with all CSS concatenated

```ts
// vite.config.ts (simplified)
export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: 'index'
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        assetFileNames: (assetInfo) => {
          // Keep CSS files in css/ subdirectory
          if (assetInfo.name?.endsWith('.css')) {
            return 'css/[name][extname]';
          }
          return '[name][extname]';
        }
      }
    }
  }
});
```

A post-build script will concatenate all CSS into `styles.css` for bundled consumption.

## Development Workflow

### Available Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Storybook development server |
| `npm run build` | Build component library for distribution |
| `npm run build-storybook` | Build static Storybook site |
| `npm run build:css` | Build CSS files (individual + bundled) |

### Adding a New Component

1. Create folder: `src/components/ComponentName/`
2. Add files: `ComponentName.tsx`, `ComponentName.css`, `ComponentName.stories.tsx`, `index.ts`
3. Export from `src/index.ts`
4. Component automatically appears in Storybook

## Accessibility Requirements

All components must:

- Use semantic HTML elements
- Include proper ARIA attributes where needed
- Support keyboard navigation
- Meet WCAG 2.1 AA color contrast requirements
- Work with screen readers

## Browser Support

Targeting browsers that support:
- CSS custom properties (variables)
- CSS nesting
- ES modules

This aligns with WordPress's browser support policy (latest 2 versions of major browsers).

## Initial Component: Card

The starter includes a Card component demonstrating all patterns:

**Props:**
- `title` (string, required) - Card heading
- `children` (ReactNode, required) - Card content
- `variant` ('default' | 'featured') - Visual style
- `className` (string) - Additional CSS classes

**CSS Classes:**
- `.prefix-card` - Base card styles
- `.prefix-card__header` - Header container
- `.prefix-card__title` - Title element
- `.prefix-card__content` - Content container
- `.prefix-card--featured` - Featured variant modifier

---

## Implementation Checklist

- [ ] Initialize npm project
- [ ] Install dependencies
- [ ] Configure TypeScript
- [ ] Configure Vite
- [ ] Configure Storybook
- [ ] Create tokens.css with CSS variables
- [ ] Create reset.css with minimal base styles
- [ ] Build Card component
- [ ] Create Card stories
- [ ] Configure build output for publishing
- [ ] Write README with usage instructions

## Files to Create

1. `package.json` - Project configuration and dependencies
2. `tsconfig.json` - TypeScript configuration
3. `vite.config.ts` - Vite build configuration
4. `.storybook/main.ts` - Storybook configuration
5. `.storybook/preview.ts` - Storybook preview configuration
6. `src/styles/tokens.css` - CSS design tokens
7. `src/styles/reset.css` - Base styles
8. `src/components/Card/Card.tsx` - Card component
9. `src/components/Card/Card.css` - Card styles
10. `src/components/Card/Card.stories.tsx` - Card stories
11. `src/components/Card/index.ts` - Card export
12. `src/index.ts` - Library entry point
13. `README.md` - Project documentation
