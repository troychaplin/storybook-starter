import './Button.css';

export interface ButtonProps {
  /** Button label text */
  children: React.ReactNode;
  /** Visual variant */
  variant?: 'primary' | 'secondary' | 'outline';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Disabled state */
  disabled?: boolean;
  /** HTML button type */
  type?: 'button' | 'submit' | 'reset';
  /** Click handler */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Button component for user interactions.
 *
 * ## CSS Classes
 * - `.prefix-button` - Base button styles
 * - `.prefix-button--primary` - Primary variant (default)
 * - `.prefix-button--secondary` - Secondary variant
 * - `.prefix-button--outline` - Outline variant
 * - `.prefix-button--sm` - Small size
 * - `.prefix-button--md` - Medium size (default)
 * - `.prefix-button--lg` - Large size
 *
 * ## WordPress (PHP)
 * ```php
 * <button class="prefix-button prefix-button--primary prefix-button--md">
 *   Click me
 * </button>
 * ```
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  onClick,
  className = '',
}: ButtonProps) {
  const classes = [
    'prefix-button',
    `prefix-button--${variant}`,
    `prefix-button--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={classes}
      disabled={disabled}
      type={type}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
