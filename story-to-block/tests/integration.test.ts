import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { generate } from '../src/index.js';

const TEST_DIR = resolve(import.meta.dirname ?? '.', '__test-output__');
const CONFIG_PATH = resolve(TEST_DIR, 'stb.config.json');

// New simplified config format: no "tokens" wrapper, auto-derived slug/name
const testConfig = {
  prefix: 'inttest',
  tokensPath: 'src/tokens.css',
  outDir: 'out/wp',
  color: {
    primary: { value: '#ff0000', name: 'Primary' },
    muted: '#999999',
  },
  spacing: {
    md: { value: '1rem', slug: '40', name: 'Medium' },
  },
  fontWeight: {
    bold: '700',
  },
  zIndex: {
    modal: '300',
  },
};

describe('integration: generate()', () => {
  beforeAll(() => {
    mkdirSync(TEST_DIR, { recursive: true });
    writeFileSync(CONFIG_PATH, JSON.stringify(testConfig, null, 2));
  });

  afterAll(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
  });

  it('generates all expected files', () => {
    const result = generate(CONFIG_PATH, TEST_DIR);

    expect(result.files).toHaveLength(4);

    const paths = result.files.map((f) => f.path);
    expect(paths).toContain('src/tokens.css');
    expect(paths).toContain('out/wp/tokens.wp.css');
    expect(paths).toContain('out/wp/theme.json');
    expect(paths).toContain('out/wp/integrate.php');
  });

  it('writes tokens.css with correct content', () => {
    const content = readFileSync(resolve(TEST_DIR, 'src/tokens.css'), 'utf-8');
    expect(content).toContain('--inttest--color-primary: #ff0000;');
    expect(content).toContain('--inttest--color-muted: #999999;');
    expect(content).toContain('--inttest--spacing-md: 1rem;');
    expect(content).toContain('--inttest--font-weight-bold: 700;');
    expect(content).toContain('--inttest--z-modal: 300;');
  });

  it('writes tokens.wp.css with var() mappings for object tokens only', () => {
    const content = readFileSync(resolve(TEST_DIR, 'out/wp/tokens.wp.css'), 'utf-8');
    // "primary" is an object entry — gets slug, mapped to WP preset
    expect(content).toContain(
      '--inttest--color-primary: var(--wp--preset--color--primary, #ff0000);',
    );
    // "muted" is string shorthand — CSS-only, no WP preset mapping
    expect(content).toContain('--inttest--color-muted: #999999;');
    expect(content).not.toContain('--wp--preset--color--muted');
    // spacing slug is explicitly set to "40"
    expect(content).toContain(
      '--inttest--spacing-md: var(--wp--preset--spacing--40, 1rem);',
    );
    expect(content).toContain('--inttest--font-weight-bold: 700;');
  });

  it('writes theme.json — only object tokens appear in presets', () => {
    const content = readFileSync(resolve(TEST_DIR, 'out/wp/theme.json'), 'utf-8');
    const parsed = JSON.parse(content);

    expect(parsed.version).toBe(3);
    // Only "primary" (object entry) appears in palette — "muted" is string shorthand
    expect(parsed.settings.color.palette).toEqual([
      { slug: 'primary', color: '#ff0000', name: 'Primary' },
    ]);
    expect(parsed.settings.custom.fontWeight).toEqual({ bold: '700' });
    expect(parsed.settings.custom).not.toHaveProperty('zIndex');
  });

  it('writes integrate.php with wp_theme_json_data_default filter', () => {
    const content = readFileSync(resolve(TEST_DIR, 'out/wp/integrate.php'), 'utf-8');
    expect(content).toContain('wp_theme_json_data_default');
    expect(content).toContain('update_with');
  });
});
