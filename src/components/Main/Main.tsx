import './Main.scss';

export interface MainProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Main component for user interactions.
 *
 * ## CSS Classes
 * - `.c2b-main` - Base main layout class.
 */

export function Main({
  children,
  className = '',
}: MainProps) {
  const classes = [
    'c2b-main',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <main className={classes}>
      {children}
    </main>
  );
}
