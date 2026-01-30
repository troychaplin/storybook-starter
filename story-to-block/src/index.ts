import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { loadConfig } from './config.js';
import { generateTokensCss } from './generators/tokens-css.js';
import { generateTokensWpCss } from './generators/tokens-wp-css.js';
import { generateThemeJson } from './generators/theme-json.js';
import { generateIntegratePhp } from './generators/integrate-php.js';

export { loadConfig, validateConfig } from './config.js';
export { generateTokensCss } from './generators/tokens-css.js';
export { generateTokensWpCss } from './generators/tokens-wp-css.js';
export { generateThemeJson } from './generators/theme-json.js';
export { generateIntegratePhp } from './generators/integrate-php.js';
export type { StbConfig, StbConfigInput, TokenEntry, TokenGroup, TokenCategory } from './types.js';

export interface GenerateResult {
  files: Array<{ path: string; size: number }>;
}

export function generate(configPath?: string, cwd?: string): GenerateResult {
  const config = loadConfig(configPath);
  const baseDir = cwd ?? process.cwd();
  const files: GenerateResult['files'] = [];

  const write = (relativePath: string, content: string) => {
    const fullPath = resolve(baseDir, relativePath);
    mkdirSync(dirname(fullPath), { recursive: true });
    writeFileSync(fullPath, content, 'utf-8');
    files.push({ path: relativePath, size: content.length });
  };

  // Generate tokens.css for local dev (Storybook)
  write(config.tokensPath, generateTokensCss(config));

  // Generate WordPress assets
  write(`${config.outDir}/tokens.wp.css`, generateTokensWpCss(config));
  write(`${config.outDir}/theme.json`, generateThemeJson(config));
  write(`${config.outDir}/integrate.php`, generateIntegratePhp());

  return { files };
}
