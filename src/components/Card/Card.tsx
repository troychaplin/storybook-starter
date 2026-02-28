import './Card.scss';

export interface CardProps {
  title: string;
  children: React.ReactNode;
  variant?: 'default' | 'featured';
  className?: string;
}

/**
 * Card component for displaying content in a contained, styled box.
 *
 * ## CSS Classes
 * - `.example-card` - Base card styles
 * - `.example-card__header` - Header container
 * - `.example-card__title` - Title element (h3)
 * - `.example-card__content` - Content container
 * - `.example-card--featured` - Featured variant modifier
 *
 * ## HTML Structure
 * ```php
 * <article class="example-card example-card--featured">
 *   <header class="example-card__header">
 *     <h3 class="example-card__title">Title</h3>
 *   </header>
 *   <div class="example-card__content">Content here</div>
 * </article>
 * ```
 */

export function Card({
  title,
  children,
  variant = 'default',
  className = '',
}: CardProps) {
  const classes = [
    'example-card',
    variant !== 'default' && `example-card--${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article className={classes}>
      <header className="example-card__header">
        <h2 className="example-card__title">{title}</h2>
      </header>
      <div className="example-card__content">{children}</div>
    </article>
  );
}
