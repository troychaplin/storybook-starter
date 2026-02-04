import { describe, it, expect } from 'vitest';
import { validateConfig } from '../src/config.js';
import type { StbConfigInput } from '../src/types.js';

const minimalConfig: StbConfigInput = {
  prefix: 'test',
  color: {
    primary: { value: '#0073aa' },
  },
};

describe('validateConfig', () => {
  it('accepts a valid minimal config', () => {
    const result = validateConfig(minimalConfig);
    expect(result.prefix).toBe('test');
    expect(result.tokensPath).toBe('src/styles/tokens.css');
    expect(result.outDir).toBe('dist/wp');
  });

  it('applies custom tokensPath and outDir', () => {
    const result = validateConfig({
      ...minimalConfig,
      tokensPath: 'custom/tokens.css',
      outDir: 'build/wp',
    });
    expect(result.tokensPath).toBe('custom/tokens.css');
    expect(result.outDir).toBe('build/wp');
  });

  it('throws if prefix is missing', () => {
    expect(() =>
      validateConfig({ prefix: '', color: { primary: { value: '#000' } } }),
    ).toThrow('"prefix" is required');
  });

  it('throws if a token has no value', () => {
    expect(() =>
      validateConfig({
        prefix: 'test',
        color: { primary: {} as any },
      }),
    ).toThrow('missing a "value"');
  });

  it('throws on unknown category', () => {
    expect(() =>
      validateConfig({
        prefix: 'test',
        bogus: { x: { value: '1' } },
      } as any),
    ).toThrow('Unknown token category');
  });

  it('maps "color" to internal colorPalette', () => {
    const result = validateConfig({
      prefix: 'test',
      color: { primary: { value: '#0073aa' } },
    });
    expect(result.tokens.colorPalette).toBeDefined();
    expect(result.tokens.colorPalette!.primary.value).toBe('#0073aa');
  });

  it('maps "gradient" to internal colorGradient', () => {
    const result = validateConfig({
      prefix: 'test',
      gradient: {
        sunset: { value: 'linear-gradient(135deg, #ff6b6b, #feca57)' },
      },
    });
    expect(result.tokens.colorGradient).toBeDefined();
    expect(result.tokens.colorGradient!.sunset.value).toContain('linear-gradient');
  });

  it('defaults fontsPath to public/fonts', () => {
    const result = validateConfig(minimalConfig);
    expect(result.fontsPath).toBe('public/fonts');
  });

  it('accepts custom fontsPath', () => {
    const result = validateConfig({ ...minimalConfig, fontsPath: 'assets/fonts' });
    expect(result.fontsPath).toBe('assets/fonts');
  });

  it('accepts fontFace on fontFamily tokens', () => {
    const result = validateConfig({
      prefix: 'test',
      fontFamily: {
        inter: {
          value: 'Inter, sans-serif',
          fontFace: [{ weight: '400', style: 'normal', src: 'inter-400-normal.woff2' }],
        },
      },
    });
    expect(result.tokens.fontFamily!.inter.fontFace).toHaveLength(1);
  });

  it('throws if fontFace entry is missing required fields', () => {
    expect(() =>
      validateConfig({
        prefix: 'test',
        fontFamily: {
          inter: {
            value: 'Inter, sans-serif',
            fontFace: [{ weight: '400', style: 'normal' } as any],
          },
        },
      }),
    ).toThrow('must have "weight", "style", and "src"');
  });
});

describe('validateConfig — auto-derived fields', () => {
  it('auto-derives slug from token key', () => {
    const result = validateConfig({
      prefix: 'test',
      color: { primary: { value: '#0073aa' } },
    });
    expect(result.tokens.colorPalette!.primary.slug).toBe('primary');
  });

  it('auto-derives name from token key (title-case)', () => {
    const result = validateConfig({
      prefix: 'test',
      color: { 'primary-hover': { value: '#005a87' } },
    });
    expect(result.tokens.colorPalette!['primary-hover'].name).toBe('Primary Hover');
  });

  it('allows explicit name override', () => {
    const result = validateConfig({
      prefix: 'test',
      color: { primary: { value: '#0073aa', name: 'Primary Brand Color' } },
    });
    expect(result.tokens.colorPalette!.primary.name).toBe('Primary Brand Color');
    expect(result.tokens.colorPalette!.primary.slug).toBe('primary');
  });

  it('does not add slug/name to layout tokens (directMap)', () => {
    const result = validateConfig({
      prefix: 'test',
      layout: { 'content-size': { value: '768px' } },
    });
    expect(result.tokens.layout!['content-size'].slug).toBeUndefined();
    expect(result.tokens.layout!['content-size'].name).toBeUndefined();
  });
});

describe('validateConfig — string shorthand', () => {
  it('expands string value to { value: string }', () => {
    const result = validateConfig({
      prefix: 'test',
      fontWeight: { normal: '400', bold: '700' },
    } as StbConfigInput);
    expect(result.tokens.fontWeight!.normal.value).toBe('400');
    expect(result.tokens.fontWeight!.bold.value).toBe('700');
  });

  it('auto-derives slug and name on string shorthand', () => {
    const result = validateConfig({
      prefix: 'test',
      fontWeight: { 'semi-bold': '600' },
    } as StbConfigInput);
    expect(result.tokens.fontWeight!['semi-bold'].slug).toBe('semi-bold');
    expect(result.tokens.fontWeight!['semi-bold'].name).toBe('Semi Bold');
  });

  it('works with color category', () => {
    const result = validateConfig({
      prefix: 'test',
      color: { primary: '#0073aa', secondary: '#23282d' },
    } as StbConfigInput);
    expect(result.tokens.colorPalette!.primary.value).toBe('#0073aa');
    expect(result.tokens.colorPalette!.primary.slug).toBe('primary');
    expect(result.tokens.colorPalette!.primary.name).toBe('Primary');
  });
});
