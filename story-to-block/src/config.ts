import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { StbConfig, StbConfigInput, TokenCategory, TokenGroup } from './types.js';
import { CATEGORY_REGISTRY, NESTED_CATEGORIES, VALID_CATEGORIES } from './types.js';

const DEFAULTS = {
  tokensPath: 'src/styles/tokens.css',
  fontsPath: 'public/fonts',
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

/**
 * Check if an object looks like a TokenGroup (has entries with "value" keys)
 * vs a nested category container (has entries that are sub-groups).
 */
function isTokenGroup(obj: unknown): obj is TokenGroup {
  if (!obj || typeof obj !== 'object') return false;
  const firstValue = Object.values(obj)[0];
  return firstValue && typeof firstValue === 'object' && 'value' in firstValue;
}

/**
 * Normalize the user-facing config into flat internal categories.
 * e.g. { color: { palette: {...}, gradient: {...} } } becomes
 *      { colorPalette: {...}, colorGradient: {...} }
 */
function normalizeTokens(
  tokens: Record<string, TokenGroup | Record<string, TokenGroup>>,
): Partial<Record<TokenCategory, TokenGroup>> {
  const flat: Partial<Record<TokenCategory, TokenGroup>> = {};
  const validFlat = VALID_CATEGORIES as readonly string[];

  for (const [key, value] of Object.entries(tokens)) {
    // Check if this is a nested category (like "color")
    if (key in NESTED_CATEGORIES && !isTokenGroup(value)) {
      const subMap = NESTED_CATEGORIES[key];
      for (const [subKey, subGroup] of Object.entries(value as Record<string, TokenGroup>)) {
        const flatKey = subMap[subKey];
        if (!flatKey) {
          const validSubs = Object.keys(subMap).join(', ');
          throw new Error(`Config error: Unknown sub-category "${key}.${subKey}". Valid sub-categories for "${key}": ${validSubs}`);
        }
        flat[flatKey as TokenCategory] = subGroup;
      }
    } else if (validFlat.includes(key)) {
      // Flat category (spacing, fontSize, etc.)
      flat[key as TokenCategory] = value as TokenGroup;
    } else {
      // Check if it's a known nested parent used incorrectly as flat
      if (key in NESTED_CATEGORIES) {
        const validSubs = Object.keys(NESTED_CATEGORIES[key]).join(', ');
        throw new Error(`Config error: "${key}" must contain sub-categories: ${validSubs}`);
      }
      throw new Error(`Config error: Unknown token category "${key}". Valid categories: ${[...Object.keys(NESTED_CATEGORIES), ...VALID_CATEGORIES.filter(c => !Object.values(NESTED_CATEGORIES).some(m => Object.values(m).includes(c)))].join(', ')}`);
    }
  }

  return flat;
}

export function validateConfig(input: StbConfigInput): StbConfig {
  if (!input.prefix || typeof input.prefix !== 'string') {
    throw new Error('Config error: "prefix" is required and must be a string.');
  }

  if (!input.tokens || typeof input.tokens !== 'object') {
    throw new Error('Config error: "tokens" is required and must be an object.');
  }

  const tokens = normalizeTokens(input.tokens);

  // Validate each flat category
  for (const [category, group] of Object.entries(tokens)) {
    const def = CATEGORY_REGISTRY[category];
    validateTokenGroup(category, group as TokenGroup, def.directMap);
  }

  return {
    prefix: input.prefix,
    tokensPath: input.tokensPath ?? DEFAULTS.tokensPath,
    fontsPath: input.fontsPath ?? DEFAULTS.fontsPath,
    outDir: input.outDir ?? DEFAULTS.outDir,
    tokens,
  };
}

function validateTokenGroup(category: string, group: TokenGroup, isDirectMap?: boolean): void {
  for (const [key, entry] of Object.entries(group)) {
    if (!entry.value && entry.value !== '0') {
      throw new Error(`Config error: Token "${category}.${key}" is missing a "value".`);
    }

    if (typeof entry.value !== 'string') {
      throw new Error(`Config error: Token "${category}.${key}.value" must be a string.`);
    }

    // Direct-map categories (layout) don't use name/slug
    if (isDirectMap) continue;

    const hasName = entry.name !== undefined;
    const hasSlug = entry.slug !== undefined;

    if (hasName && !hasSlug) {
      throw new Error(`Config error: Token "${category}.${key}" has "name" but no "slug". Both are required together.`);
    }

    if (hasSlug && !hasName) {
      throw new Error(`Config error: Token "${category}.${key}" has "slug" but no "name". Both are required together.`);
    }

    if (entry.fontFace) {
      if (!hasName || !hasSlug) {
        throw new Error(`Config error: Token "${category}.${key}" has "fontFace" but requires "name" and "slug".`);
      }
      for (const [i, face] of entry.fontFace.entries()) {
        if (!face.weight || !face.style || !face.src) {
          throw new Error(`Config error: Token "${category}.${key}.fontFace[${i}]" must have "weight", "style", and "src".`);
        }
      }
    }
  }
}
