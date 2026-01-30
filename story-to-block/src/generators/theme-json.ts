import type { StbConfig, TokenCategory, TokenGroup } from '../types.js';

interface ThemeJson {
  $schema: string;
  version: number;
  settings: {
    color?: { palette: Array<{ slug: string; color: string; name: string }> };
    spacing?: { spacingSizes: Array<{ slug: string; size: string; name: string }> };
    typography?: {
      fontFamilies?: Array<{ slug: string; fontFamily: string; name: string }>;
      fontSizes?: Array<{ slug: string; size: string; name: string }>;
    };
    custom?: Record<string, Record<string, string>>;
  };
}

/**
 * Categories that map to settings.custom in theme.json.
 * These generate --wp--custom--* variables but don't appear in editor UI controls.
 */
const CUSTOM_CATEGORIES: TokenCategory[] = [
  'fontWeight', 'lineHeight', 'radius', 'shadow', 'transition',
];

const CUSTOM_KEY_MAP: Partial<Record<TokenCategory, string>> = {
  fontWeight: 'fontWeight',
  lineHeight: 'lineHeight',
  radius: 'radius',
  shadow: 'shadow',
  transition: 'transition',
};

export function generateThemeJson(config: StbConfig): string {
  const themeJson: ThemeJson = {
    $schema: 'https://schemas.wp.org/trunk/theme.json',
    version: 3,
    settings: {},
  };

  // Color palette
  const colorPalette = buildNamedEntries(config.tokens.color, (entry) => ({
    slug: entry.slug!,
    color: entry.value,
    name: entry.name!,
  }));
  if (colorPalette.length > 0) {
    themeJson.settings.color = { palette: colorPalette };
  }

  // Spacing sizes
  const spacingSizes = buildNamedEntries(config.tokens.spacing, (entry) => ({
    slug: entry.slug!,
    size: entry.value,
    name: entry.name!,
  }));
  if (spacingSizes.length > 0) {
    themeJson.settings.spacing = { spacingSizes };
  }

  // Typography
  const fontFamilies = buildNamedEntries(config.tokens.fontFamily, (entry) => ({
    slug: entry.slug!,
    fontFamily: entry.value,
    name: entry.name!,
  }));
  const fontSizes = buildNamedEntries(config.tokens.fontSize, (entry) => ({
    slug: entry.slug!,
    size: entry.value,
    name: entry.name!,
  }));
  if (fontFamilies.length > 0 || fontSizes.length > 0) {
    themeJson.settings.typography = {};
    if (fontFamilies.length > 0) themeJson.settings.typography.fontFamilies = fontFamilies;
    if (fontSizes.length > 0) themeJson.settings.typography.fontSizes = fontSizes;
  }

  // Custom categories (fontWeight, lineHeight, radius, shadow, transition)
  const custom: Record<string, Record<string, string>> = {};
  for (const category of CUSTOM_CATEGORIES) {
    const group = config.tokens[category];
    if (!group) continue;

    const key = CUSTOM_KEY_MAP[category]!;
    const values: Record<string, string> = {};

    for (const [tokenKey, entry] of Object.entries(group)) {
      values[tokenKey] = entry.value;
    }

    if (Object.keys(values).length > 0) {
      custom[key] = values;
    }
  }
  if (Object.keys(custom).length > 0) {
    themeJson.settings.custom = custom;
  }

  return JSON.stringify(themeJson, null, 2) + '\n';
}

function buildNamedEntries<T>(
  group: TokenGroup | undefined,
  mapper: (entry: { value: string; name: string; slug: string }) => T,
): T[] {
  if (!group) return [];

  const entries: T[] = [];
  for (const entry of Object.values(group)) {
    if (entry.name && entry.slug) {
      entries.push(mapper(entry as { value: string; name: string; slug: string }));
    }
  }
  return entries;
}
