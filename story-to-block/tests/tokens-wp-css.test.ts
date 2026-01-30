import { describe, it, expect } from 'vitest';
import { generateTokensWpCss } from '../src/generators/tokens-wp-css.js';
import type { StbConfig } from '../src/types.js';

const config: StbConfig = {
  prefix: 'test',
  tokensPath: 'src/styles/tokens.css',
  outDir: 'dist/wp',
  tokens: {
    color: {
      primary: { value: '#0073aa', name: 'Primary', slug: 'primary' },
      'primary-hover': { value: '#005a87' },
    },
    spacing: {
      md: { value: '1rem', slug: '40', name: 'Medium' },
    },
    fontFamily: {
      base: { value: 'sans-serif', name: 'Sans', slug: 'body' },
    },
    fontSize: {
      sm: { value: '0.875rem', slug: 'small', name: 'Small' },
      xs: { value: '0.75rem' },
    },
    fontWeight: {
      bold: { value: '700' },
    },
    radius: {
      md: { value: '4px' },
    },
    zIndex: {
      modal: { value: '300' },
    },
  },
};

describe('generateTokensWpCss', () => {
  const output = generateTokensWpCss(config);

  it('maps color tokens with slug to --wp--preset--color--{slug}', () => {
    expect(output).toContain(
      '--test-color-primary: var(--wp--preset--color--primary, #0073aa);',
    );
  });

  it('uses hardcoded value for color tokens without slug', () => {
    expect(output).toContain('--test-color-primary-hover: #005a87;');
  });

  it('maps spacing tokens to --wp--preset--spacing--{slug}', () => {
    expect(output).toContain(
      '--test-spacing-md: var(--wp--preset--spacing--40, 1rem);',
    );
  });

  it('maps fontFamily tokens to --wp--preset--font-family--{slug}', () => {
    expect(output).toContain(
      '--test-font-family-base: var(--wp--preset--font-family--body, sans-serif);',
    );
  });

  it('maps fontSize tokens with slug to --wp--preset--font-size--{slug}', () => {
    expect(output).toContain(
      '--test-font-size-sm: var(--wp--preset--font-size--small, 0.875rem);',
    );
  });

  it('uses hardcoded value for fontSize tokens without slug', () => {
    expect(output).toContain('--test-font-size-xs: 0.75rem;');
  });

  it('always uses hardcoded values for fontWeight (no wp preset)', () => {
    expect(output).toContain('--test-font-weight-bold: 700;');
    expect(output).not.toContain('--wp--preset--font-weight');
  });

  it('always uses hardcoded values for radius (no wp preset)', () => {
    expect(output).toContain('--test-radius-md: 4px;');
    expect(output).not.toContain('--wp--preset--radius');
  });

  it('always uses hardcoded values for zIndex (no wp preset)', () => {
    expect(output).toContain('--test-z-modal: 300;');
    expect(output).not.toContain('--wp--preset--z');
  });
});
