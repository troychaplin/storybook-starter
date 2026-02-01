import { describe, it, expect } from 'vitest';
import { validateConfig } from '../src/config.js';
import type { StbConfigInput } from '../src/types.js';

const minimalConfig: StbConfigInput = {
  prefix: 'test',
  tokens: {
    color: {
      palette: {
        primary: { value: '#0073aa' },
      },
    },
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
      validateConfig({ prefix: '', tokens: { color: { palette: { primary: { value: '#000' } } } } }),
    ).toThrow('"prefix" is required');
  });

  it('throws if tokens is missing', () => {
    expect(() =>
      validateConfig({ prefix: 'test', tokens: undefined as any }),
    ).toThrow('"tokens" is required');
  });

  it('throws if a token has no value', () => {
    expect(() =>
      validateConfig({
        prefix: 'test',
        tokens: { color: { palette: { primary: {} as any } } },
      }),
    ).toThrow('missing a "value"');
  });

  it('throws if a token has name but no slug', () => {
    expect(() =>
      validateConfig({
        prefix: 'test',
        tokens: { color: { palette: { primary: { value: '#000', name: 'Primary' } } } },
      }),
    ).toThrow('has "name" but no "slug"');
  });

  it('throws if a token has slug but no name', () => {
    expect(() =>
      validateConfig({
        prefix: 'test',
        tokens: { color: { palette: { primary: { value: '#000', slug: 'primary' } } } },
      }),
    ).toThrow('has "slug" but no "name"');
  });

  it('accepts tokens with both name and slug', () => {
    const result = validateConfig({
      prefix: 'test',
      tokens: {
        color: {
          palette: {
            primary: { value: '#0073aa', name: 'Primary', slug: 'primary' },
          },
        },
      },
    });
    expect(result.tokens.colorPalette!.primary.name).toBe('Primary');
    expect(result.tokens.colorPalette!.primary.slug).toBe('primary');
  });

  it('throws on unknown category', () => {
    expect(() =>
      validateConfig({
        prefix: 'test',
        tokens: { bogus: { x: { value: '1' } } } as any,
      }),
    ).toThrow('Unknown token category');
  });

  it('normalizes nested color.palette to flat colorPalette', () => {
    const result = validateConfig({
      prefix: 'test',
      tokens: {
        color: {
          palette: { primary: { value: '#0073aa' } },
        },
      },
    });
    expect(result.tokens.colorPalette).toBeDefined();
    expect(result.tokens.colorPalette!.primary.value).toBe('#0073aa');
  });

  it('normalizes nested color.gradient to flat colorGradient', () => {
    const result = validateConfig({
      prefix: 'test',
      tokens: {
        color: {
          gradient: {
            sunset: { value: 'linear-gradient(135deg, #ff6b6b, #feca57)', name: 'Sunset', slug: 'sunset' },
          },
        },
      },
    });
    expect(result.tokens.colorGradient).toBeDefined();
    expect(result.tokens.colorGradient!.sunset.value).toContain('linear-gradient');
  });

  it('throws on unknown color sub-category', () => {
    expect(() =>
      validateConfig({
        prefix: 'test',
        tokens: { color: { bogus: { x: { value: '#000' } } } },
      }),
    ).toThrow('Unknown sub-category "color.bogus"');
  });
});
