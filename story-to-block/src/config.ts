import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { StbConfig, StbConfigInput, TokenCategory, TokenGroup } from './types.js';

const VALID_CATEGORIES: TokenCategory[] = [
  'color', 'spacing', 'fontFamily', 'fontSize', 'fontWeight',
  'lineHeight', 'radius', 'shadow', 'transition', 'zIndex',
];

const DEFAULTS = {
  tokensPath: 'src/styles/tokens.css',
  outDir: 'dist/wp',
} as const;

export function loadConfig(configPath?: string): StbConfig {
  const resolvedPath = resolve(configPath ?? 'stb.config.json');

  let raw: string;
  try {
    raw = readFileSync(resolvedPath, 'utf-8');
  } catch {
    throw new Error(`Config file not found: ${resolvedPath}`);
  }

  let input: StbConfigInput;
  try {
    input = JSON.parse(raw) as StbConfigInput;
  } catch {
    throw new Error(`Invalid JSON in config file: ${resolvedPath}`);
  }

  return validateConfig(input);
}

export function validateConfig(input: StbConfigInput): StbConfig {
  if (!input.prefix || typeof input.prefix !== 'string') {
    throw new Error('Config error: "prefix" is required and must be a string.');
  }

  if (!input.tokens || typeof input.tokens !== 'object') {
    throw new Error('Config error: "tokens" is required and must be an object.');
  }

  for (const [category, group] of Object.entries(input.tokens)) {
    if (!VALID_CATEGORIES.includes(category as TokenCategory)) {
      throw new Error(`Config error: Unknown token category "${category}". Valid categories: ${VALID_CATEGORIES.join(', ')}`);
    }

    validateTokenGroup(category, group as TokenGroup);
  }

  return {
    prefix: input.prefix,
    tokensPath: input.tokensPath ?? DEFAULTS.tokensPath,
    outDir: input.outDir ?? DEFAULTS.outDir,
    tokens: input.tokens,
  };
}

function validateTokenGroup(category: string, group: TokenGroup): void {
  for (const [key, entry] of Object.entries(group)) {
    if (!entry.value && entry.value !== '0') {
      throw new Error(`Config error: Token "${category}.${key}" is missing a "value".`);
    }

    if (typeof entry.value !== 'string') {
      throw new Error(`Config error: Token "${category}.${key}.value" must be a string.`);
    }

    const hasName = entry.name !== undefined;
    const hasSlug = entry.slug !== undefined;

    if (hasName && !hasSlug) {
      throw new Error(`Config error: Token "${category}.${key}" has "name" but no "slug". Both are required together.`);
    }

    if (hasSlug && !hasName) {
      throw new Error(`Config error: Token "${category}.${key}" has "slug" but no "name". Both are required together.`);
    }
  }
}
