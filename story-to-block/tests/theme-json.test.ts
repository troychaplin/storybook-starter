import { describe, it, expect } from 'vitest';
import { generateThemeJson } from '../src/generators/theme-json.js';
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
    lineHeight: {
      normal: { value: '1.5' },
    },
    radius: {
      md: { value: '4px' },
    },
    shadow: {
      sm: { value: '0 1px 2px 0 rgb(0 0 0 / 0.05)' },
    },
    transition: {
      fast: { value: '150ms ease' },
    },
    zIndex: {
      modal: { value: '300' },
    },
  },
};

describe('generateThemeJson', () => {
  const output = generateThemeJson(config);
  const parsed = JSON.parse(output);

  it('includes schema and version', () => {
    expect(parsed.$schema).toBe('https://schemas.wp.org/trunk/theme.json');
    expect(parsed.version).toBe(3);
  });

  it('includes named colors in palette', () => {
    expect(parsed.settings.color.palette).toEqual([
      { slug: 'primary', color: '#0073aa', name: 'Primary' },
    ]);
  });

  it('excludes unnamed colors from palette', () => {
    const slugs = parsed.settings.color.palette.map((p: any) => p.slug);
    expect(slugs).not.toContain('primary-hover');
  });

  it('includes spacing sizes', () => {
    expect(parsed.settings.spacing.spacingSizes).toEqual([
      { slug: '40', size: '1rem', name: 'Medium' },
    ]);
  });

  it('includes font families', () => {
    expect(parsed.settings.typography.fontFamilies).toEqual([
      { slug: 'body', fontFamily: 'sans-serif', name: 'Sans' },
    ]);
  });

  it('includes named font sizes only', () => {
    expect(parsed.settings.typography.fontSizes).toEqual([
      { slug: 'small', size: '0.875rem', name: 'Small' },
    ]);
  });

  it('places fontWeight under settings.custom', () => {
    expect(parsed.settings.custom.fontWeight).toEqual({ bold: '700' });
  });

  it('places lineHeight under settings.custom', () => {
    expect(parsed.settings.custom.lineHeight).toEqual({ normal: '1.5' });
  });

  it('places radius under settings.custom', () => {
    expect(parsed.settings.custom.radius).toEqual({ md: '4px' });
  });

  it('places shadow under settings.custom', () => {
    expect(parsed.settings.custom.shadow).toEqual({
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    });
  });

  it('places transition under settings.custom', () => {
    expect(parsed.settings.custom.transition).toEqual({ fast: '150ms ease' });
  });

  it('excludes zIndex entirely', () => {
    expect(parsed.settings.custom.zIndex).toBeUndefined();
  });
});
