import { describe, it, expect } from 'vitest';
import { generateThemeJson } from '../src/generators/theme-json.js';
import type { StbConfig } from '../src/types.js';

const config: StbConfig = {
  prefix: 'test',
  tokensPath: 'src/styles/tokens.css',

  outDir: 'dist/wp',
  wpThemeable: false,
  tokens: {
    colorPalette: {
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

  it('disables WordPress default color presets when not wpThemeable', () => {
    expect(parsed.settings.color.defaultDuotone).toBe(false);
    expect(parsed.settings.color.defaultPalette).toBe(false);
    expect(parsed.settings.color.defaultGradients).toBe(false);
  });

  it('includes spacing sizes', () => {
    expect(parsed.settings.spacing.spacingSizes).toEqual([
      { slug: '40', size: '1rem', name: 'Medium' },
    ]);
  });

  it('disables WordPress default spacing sizes when not wpThemeable', () => {
    expect(parsed.settings.spacing.defaultSpacingSizes).toBe(false);
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

describe('generateThemeJson — layout tokens', () => {
  const layoutConfig: StbConfig = {
    prefix: 'test',
    tokensPath: 'src/styles/tokens.css',
  
    outDir: 'dist/wp',
    wpThemeable: false,
    tokens: {
      layout: {
        'content-size': { value: '645px' },
        'wide-size': { value: '1340px' },
      },
    },
  };

  const output = generateThemeJson(layoutConfig);
  const parsed = JSON.parse(output);

  it('generates settings.layout with camelCase keys', () => {
    expect(parsed.settings.layout).toEqual({
      contentSize: '645px',
      wideSize: '1340px',
    });
  });
});

describe('generateThemeJson — shadow presets', () => {
  const shadowConfig: StbConfig = {
    prefix: 'test',
    tokensPath: 'src/styles/tokens.css',
  
    outDir: 'dist/wp',
    wpThemeable: false,
    tokens: {
      shadow: {
        sm: { value: '0 1px 2px 0 rgb(0 0 0 / 0.05)', name: 'Small', slug: 'sm' },
        md: { value: '0 4px 6px -1px rgb(0 0 0 / 0.1)', name: 'Medium', slug: 'md' },
        custom: { value: '0 0 0 2px rgb(0 0 0 / 0.2)' },
      },
    },
  };

  const output = generateThemeJson(shadowConfig);
  const parsed = JSON.parse(output);

  it('disables WordPress default shadow presets when not wpThemeable', () => {
    expect(parsed.settings.shadow.defaultPresets).toBe(false);
  });

  it('places named shadows in settings.shadow.presets', () => {
    expect(parsed.settings.shadow.presets).toEqual([
      { slug: 'sm', shadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)', name: 'Small' },
      { slug: 'md', shadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', name: 'Medium' },
    ]);
  });

  it('places unnamed shadows in settings.custom.shadow', () => {
    expect(parsed.settings.custom.shadow).toEqual({
      custom: '0 0 0 2px rgb(0 0 0 / 0.2)',
    });
  });

  it('excludes named shadows from settings.custom', () => {
    expect(parsed.settings.custom.shadow.sm).toBeUndefined();
    expect(parsed.settings.custom.shadow.md).toBeUndefined();
  });
});

describe('generateThemeJson — fluid font sizes', () => {
  const fluidConfig: StbConfig = {
    prefix: 'test',
    tokensPath: 'src/styles/tokens.css',
  
    outDir: 'dist/wp',
    wpThemeable: false,
    tokens: {
      fontSize: {
        small: { value: '1rem', name: 'Small', slug: 'small', fluid: { min: '0.875rem', max: '1rem' } },
        medium: { value: '1.125rem', name: 'Medium', slug: 'medium' },
      },
    },
  };

  const output = generateThemeJson(fluidConfig);
  const parsed = JSON.parse(output);

  it('includes fluid object on font sizes that have it', () => {
    const small = parsed.settings.typography.fontSizes.find((f: Record<string, unknown>) => f.slug === 'small');
    expect(small.fluid).toEqual({ min: '0.875rem', max: '1rem' });
  });

  it('omits fluid on font sizes without it', () => {
    const medium = parsed.settings.typography.fontSizes.find((f: Record<string, unknown>) => f.slug === 'medium');
    expect(medium.fluid).toBeUndefined();
  });
});

describe('generateThemeJson — typography flags', () => {
  it('sets fluid when fontSize tokens exist', () => {
    const cfg: StbConfig = {
      prefix: 'test',
      tokensPath: 'src/styles/tokens.css',
    
      outDir: 'dist/wp',
      wpThemeable: false,
      tokens: {
        fontSize: {
          small: { value: '1rem', name: 'Small', slug: 'small' },
        },
      },
    };
    const parsed = JSON.parse(generateThemeJson(cfg));
    expect(parsed.settings.typography.fluid).toBe(true);
  });

  it('does not set typography.fluid when no fontSize tokens', () => {
    const cfg: StbConfig = {
      prefix: 'test',
      tokensPath: 'src/styles/tokens.css',
    
      outDir: 'dist/wp',
      wpThemeable: false,
      tokens: {
        fontFamily: {
          base: { value: 'sans-serif', name: 'Sans', slug: 'body' },
        },
      },
    };
    const parsed = JSON.parse(generateThemeJson(cfg));
    expect(parsed.settings.typography.fluid).toBeUndefined();
  });
});

describe('generateThemeJson — WordPress default preset flags', () => {
  const baseConfig = {
    prefix: 'test',
    tokensPath: 'src/styles/tokens.css',
  
    outDir: 'dist/wp',
  };

  it('disables color defaults when wpThemeable is false', () => {
    const cfg: StbConfig = {
      ...baseConfig,
      wpThemeable: false,
      tokens: {
        colorPalette: { primary: { value: '#0073aa', name: 'Primary', slug: 'primary' } },
      },
    };
    const parsed = JSON.parse(generateThemeJson(cfg));
    expect(parsed.settings.color.defaultDuotone).toBe(false);
    expect(parsed.settings.color.defaultPalette).toBe(false);
    expect(parsed.settings.color.defaultGradients).toBe(false);
  });

  it('enables color defaults when wpThemeable is true', () => {
    const cfg: StbConfig = {
      ...baseConfig,
      wpThemeable: true,
      tokens: {
        colorPalette: { primary: { value: '#0073aa', name: 'Primary', slug: 'primary' } },
      },
    };
    const parsed = JSON.parse(generateThemeJson(cfg));
    expect(parsed.settings.color.defaultDuotone).toBe(true);
    expect(parsed.settings.color.defaultPalette).toBe(true);
    expect(parsed.settings.color.defaultGradients).toBe(true);
  });

  it('sets color defaults when gradient tokens exist', () => {
    const cfg: StbConfig = {
      ...baseConfig,
      wpThemeable: false,
      tokens: {
        colorGradient: { sunset: { value: 'linear-gradient(#ff6b6b, #feca57)', name: 'Sunset', slug: 'sunset' } },
      },
    };
    const parsed = JSON.parse(generateThemeJson(cfg));
    expect(parsed.settings.color.defaultGradients).toBe(false);
  });

  it('does not set color defaults when no color or gradient tokens', () => {
    const cfg: StbConfig = {
      ...baseConfig,
      wpThemeable: false,
      tokens: {
        fontWeight: { bold: { value: '700' } },
      },
    };
    const parsed = JSON.parse(generateThemeJson(cfg));
    expect(parsed.settings.color).toBeUndefined();
  });

  it('disables spacing defaults when wpThemeable is false', () => {
    const cfg: StbConfig = {
      ...baseConfig,
      wpThemeable: false,
      tokens: {
        spacing: { md: { value: '1rem', slug: '40', name: 'Medium' } },
      },
    };
    const parsed = JSON.parse(generateThemeJson(cfg));
    expect(parsed.settings.spacing.defaultSpacingSizes).toBe(false);
  });

  it('enables spacing defaults when wpThemeable is true', () => {
    const cfg: StbConfig = {
      ...baseConfig,
      wpThemeable: true,
      tokens: {
        spacing: { md: { value: '1rem', slug: '40', name: 'Medium' } },
      },
    };
    const parsed = JSON.parse(generateThemeJson(cfg));
    expect(parsed.settings.spacing.defaultSpacingSizes).toBe(true);
  });

  it('does not set spacing defaults when no spacing tokens', () => {
    const cfg: StbConfig = {
      ...baseConfig,
      wpThemeable: false,
      tokens: {
        colorPalette: { primary: { value: '#0073aa', name: 'Primary', slug: 'primary' } },
      },
    };
    const parsed = JSON.parse(generateThemeJson(cfg));
    expect(parsed.settings.spacing).toBeUndefined();
  });

  it('disables shadow defaults when wpThemeable is false', () => {
    const cfg: StbConfig = {
      ...baseConfig,
      wpThemeable: false,
      tokens: {
        shadow: { sm: { value: '0 1px 2px 0 rgb(0 0 0 / 0.05)', name: 'Small', slug: 'sm' } },
      },
    };
    const parsed = JSON.parse(generateThemeJson(cfg));
    expect(parsed.settings.shadow.defaultPresets).toBe(false);
  });

  it('enables shadow defaults when wpThemeable is true', () => {
    const cfg: StbConfig = {
      ...baseConfig,
      wpThemeable: true,
      tokens: {
        shadow: { sm: { value: '0 1px 2px 0 rgb(0 0 0 / 0.05)', name: 'Small', slug: 'sm' } },
      },
    };
    const parsed = JSON.parse(generateThemeJson(cfg));
    expect(parsed.settings.shadow.defaultPresets).toBe(true);
  });

  it('does not set shadow defaults when no shadow tokens', () => {
    const cfg: StbConfig = {
      ...baseConfig,
      wpThemeable: false,
      tokens: {
        colorPalette: { primary: { value: '#0073aa', name: 'Primary', slug: 'primary' } },
      },
    };
    const parsed = JSON.parse(generateThemeJson(cfg));
    expect(parsed.settings.shadow).toBeUndefined();
  });
});

describe('generateThemeJson — fontFace', () => {
  const fontConfig: StbConfig = {
    prefix: 'test',
    tokensPath: 'src/styles/tokens.css',
  
    outDir: 'dist/wp',
    wpThemeable: false,
    tokens: {
      fontFamily: {
        inter: {
          value: 'Inter, sans-serif',
          name: 'Inter',
          slug: 'inter',
          fontFace: [
            { weight: '300', style: 'normal', src: 'inter-300-normal.woff2' },
          ],
        },
        system: {
          value: '-apple-system, sans-serif',
          name: 'System',
          slug: 'system',
        },
      },
    },
  };

  const output = generateThemeJson(fontConfig);
  const parsed = JSON.parse(output);

  it('includes fontFace array on fonts that have it', () => {
    const inter = parsed.settings.typography.fontFamilies.find((f: Record<string, unknown>) => f.slug === 'inter');
    expect(inter.fontFace).toEqual([
      {
        fontFamily: 'Inter',
        fontStyle: 'normal',
        fontWeight: '300',
        src: ['file:./assets/fonts/inter/inter-300-normal.woff2'],
      },
    ]);
  });

  it('omits fontFace on fonts without it', () => {
    const system = parsed.settings.typography.fontFamilies.find((f: Record<string, unknown>) => f.slug === 'system');
    expect(system.fontFace).toBeUndefined();
  });
});
