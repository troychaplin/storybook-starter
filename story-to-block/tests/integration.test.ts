import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { generate } from '../src/index.js';

const TEST_DIR = resolve(import.meta.dirname ?? '.', '__test-output__');
const CONFIG_PATH = resolve(TEST_DIR, 'stb.config.json');

const testConfig = {
  prefix: 'inttest',
  tokensPath: 'src/tokens.css',
  outDir: 'out/wp',
  tokens: {
    color: {
      primary: { value: '#ff0000', name: 'Primary', slug: 'primary' },
      muted: { value: '#999999' },
    },
    spacing: {
      md: { value: '1rem', slug: '40', name: 'Medium' },
    },
    fontWeight: {
      bold: { value: '700' },
    },
    zIndex: {
      modal: { value: '300' },
    },
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
    expect(content).toContain('--inttest-color-primary: #ff0000;');
    expect(content).toContain('--inttest-color-muted: #999999;');
    expect(content).toContain('--inttest-spacing-md: 1rem;');
    expect(content).toContain('--inttest-font-weight-bold: 700;');
    expect(content).toContain('--inttest-z-modal: 300;');
  });

  it('writes tokens.wp.css with var() mappings for slugged tokens', () => {
    const content = readFileSync(resolve(TEST_DIR, 'out/wp/tokens.wp.css'), 'utf-8');
    expect(content).toContain(
      '--inttest-color-primary: var(--wp--preset--color--primary, #ff0000);',
    );
    expect(content).toContain('--inttest-color-muted: #999999;');
    expect(content).toContain(
      '--inttest-spacing-md: var(--wp--preset--spacing--40, 1rem);',
    );
    expect(content).toContain('--inttest-font-weight-bold: 700;');
  });

  it('writes theme.json with only named tokens', () => {
    const content = readFileSync(resolve(TEST_DIR, 'out/wp/theme.json'), 'utf-8');
    const parsed = JSON.parse(content);

    expect(parsed.version).toBe(3);
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
