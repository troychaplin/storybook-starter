import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { StbConfig, StbConfigInput, TokenCategory, TokenEntry, TokenEntryInput, TokenGroup, TokenGroupInput } from './types.js';
import { CATEGORY_REGISTRY, INPUT_CATEGORY_MAP, VALID_CATEGORIES, kebabToTitle } from './types.js';

const DEFAULTS = {
  tokensPath: 'src/styles/tokens.css',
  fontsPath: 'public/fonts',
  outDir: 'dist/wp',
} as const;

/** Reserved config keys that are not token categories */
const CONFIG_KEYS = ['prefix', 'tokensPath', 'fontsPath', 'outDir'] as const;

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
 * Expand a token entry input (string or object) into a full TokenEntry.
 * - String "value" becomes { value: "value" }
 * - Auto-derive slug from key
 * - Auto-derive name from key (title-case) if not provided
 */
function expandTokenEntry(key: string, input: TokenEntryInput, isDirectMap?: boolean): TokenEntry {
  // String shorthand expands to { value: string }
  const entry: TokenEntry = typeof input === 'string'
    ? { value: input }
    : { ...input };

  // Direct-map categories (layout) don't use name/slug
  if (isDirectMap) {
    return entry;
  }

  // Auto-derive slug from key if not explicitly provided
  if (!entry.slug) {
    entry.slug = key;
  }

  // Auto-derive name from key if not provided
  if (!entry.name) {
    entry.name = kebabToTitle(key);
  }

  return entry;
}

/**
 * Normalize a token group, expanding string shorthand and auto-deriving slug/name.
 */
function normalizeTokenGroup(group: TokenGroupInput, isDirectMap?: boolean): TokenGroup {
  const normalized: TokenGroup = {};
  for (const [key, input] of Object.entries(group)) {
    normalized[key] = expandTokenEntry(key, input, isDirectMap);
  }
  return normalized;
}

/**
 * Extract token categories from the flat config input.
 * Maps user-facing category names to internal names (e.g. "color" → "colorPalette").
 */
function extractTokens(input: StbConfigInput): Partial<Record<TokenCategory, TokenGroup>> {
  const tokens: Partial<Record<TokenCategory, TokenGroup>> = {};
  const validInputCategories = [
    ...Object.keys(INPUT_CATEGORY_MAP),
    ...VALID_CATEGORIES,
  ];

  for (const [key, value] of Object.entries(input)) {
    // Skip reserved config keys
    if ((CONFIG_KEYS as readonly string[]).includes(key)) continue;

    // Skip undefined values
    if (value === undefined) continue;

    // Must be an object (token group)
    if (typeof value !== 'object') {
      throw new Error(`Config error: "${key}" must be an object.`);
    }

    // Map user-facing name to internal category name
    const internalCategory = INPUT_CATEGORY_MAP[key] ?? key;

    // Validate category name
    if (!VALID_CATEGORIES.includes(internalCategory as TokenCategory)) {
      throw new Error(`Config error: Unknown token category "${key}". Valid categories: ${validInputCategories.filter(c => VALID_CATEGORIES.includes((INPUT_CATEGORY_MAP[c] ?? c) as TokenCategory)).join(', ')}`);
    }

    const def = CATEGORY_REGISTRY[internalCategory];
    tokens[internalCategory as TokenCategory] = normalizeTokenGroup(value as TokenGroupInput, def.directMap);
  }

  return tokens;
}

export function validateConfig(input: StbConfigInput): StbConfig {
  if (!input.prefix || typeof input.prefix !== 'string') {
    throw new Error('Config error: "prefix" is required and must be a string.');
  }

  const tokens = extractTokens(input);

  // Validate each category
  for (const [category, group] of Object.entries(tokens)) {
    validateTokenGroup(category, group as TokenGroup);
  }

  return {
    prefix: input.prefix,
    tokensPath: input.tokensPath ?? DEFAULTS.tokensPath,
    fontsPath: input.fontsPath ?? DEFAULTS.fontsPath,
    outDir: input.outDir ?? DEFAULTS.outDir,
    tokens,
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

    // Validate fontFace entries if present
    if (entry.fontFace) {
      for (const [i, face] of entry.fontFace.entries()) {
        if (!face.weight || !face.style || !face.src) {
          throw new Error(`Config error: Token "${category}.${key}.fontFace[${i}]" must have "weight", "style", and "src".`);
        }
      }
    }
  }
}
