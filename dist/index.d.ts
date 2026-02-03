import { JSX } from 'react/jsx-runtime';

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
export declare function Button({ children, variant, size, disabled, type, onClick, className, }: ButtonProps): JSX.Element;

export declare interface ButtonProps {
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
export declare function Card({ title, children, variant, className, }: CardProps): JSX.Element;

export declare interface CardProps {
    /** Card title displayed in the header */
    title: string;
    /** Main content of the card */
    children: React.ReactNode;
    /** Visual variant of the card */
    variant?: 'default' | 'featured';
    /** Additional CSS classes */
    className?: string;
}

export { }
