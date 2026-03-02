import './Section.scss';

export interface SectionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Section component for user interactions.
 *
 * ## CSS Classes
 * - `.c2b-section` - Base section layout class.
 */

export function Section({
  children,
  className = '',
}: SectionProps) {
  const classes = [
    'c2b-section has-global-padding',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section className={classes}>
      {children}
    </section>
  );
}
