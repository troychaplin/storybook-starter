import './Card.css';

export interface CardProps {
  /** Card title displayed in the header */
  title: string;
  /** Main content of the card */
  children: React.ReactNode;
  /** Visual variant of the card */
  variant?: 'default' | 'featured';
  /** Additional CSS classes */
  className?: string;
}

/**
 * Card component for displaying content in a contained, styled box.
 *
 * ## CSS Classes
 * - `.prefix-card` - Base card styles
 * - `.prefix-card__header` - Header container
 * - `.prefix-card__title` - Title element (h3)
 * - `.prefix-card__content` - Content container
 * - `.prefix-card--featured` - Featured variant modifier
 *
 * ## WordPress (PHP)
 * ```php
 * <article class="prefix-card prefix-card--featured">
 *   <header class="prefix-card__header">
 *     <h3 class="prefix-card__title">Title</h3>
 *   </header>
 *   <div class="prefix-card__content">Content here</div>
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
    'prefix-card',
    variant !== 'default' && `prefix-card--${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article className={classes}>
      <header className="prefix-card__header">
        <h3 className="prefix-card__title">{title}</h3>
      </header>
      <div className="prefix-card__content">{children}</div>
    </article>
  );
}
