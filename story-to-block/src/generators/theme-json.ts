import type { StbConfig, TokenCategory, TokenGroup } from '../types.js';
import { CATEGORY_REGISTRY, CATEGORY_ORDER, kebabToCamel } from '../types.js';

/* eslint-disable @typescript-eslint/no-explicit-any */
type AnySettings = Record<string, any>;

export function generateThemeJson(config: StbConfig): string {
  const settings: AnySettings = {};
  const custom: Record<string, Record<string, string>> = {};

  for (const category of CATEGORY_ORDER) {
    const group = config.tokens[category];
    if (!group) continue;

    const def = CATEGORY_REGISTRY[category];

    // Excluded categories (zIndex) — skip entirely
    if (def.exclude) continue;

    // Direct-map categories (layout) — map token keys directly to a settings object
    if (def.directMap && def.themeJson) {
      const obj: Record<string, string> = {};
      for (const [key, entry] of Object.entries(group)) {
        obj[kebabToCamel(key)] = entry.value;
      }
      if (Object.keys(obj).length > 0) {
        setNestedValue(settings, def.themeJson.path, obj);
      }
      continue;
    }

    // Preset categories (color, spacing, etc.) — build arrays from named tokens
    if (def.themeJson) {
      const presets = buildNamedEntries(group, def.themeJson.valueKey);
      if (presets.length > 0) {
        setNestedValue(settings, def.themeJson.path, presets);
      }
    }

    // Custom categories — tokens without name+slug (or all tokens if custom-only)
    if (def.custom) {
      const values: Record<string, string> = {};
      for (const [tokenKey, entry] of Object.entries(group)) {
        // If category has both themeJson and custom (like shadow),
        // only put tokens WITHOUT name+slug into custom
        if (def.themeJson && entry.name && entry.slug) continue;
        values[tokenKey] = entry.value;
      }
      if (Object.keys(values).length > 0) {
        custom[def.custom] = values;
      }
    }
  }

  // When custom font sizes are defined, enable fluid typography
  // and disable WP default font sizes so only ours appear
  if (config.tokens.fontSize) {
    if (!settings.typography) settings.typography = {};
    settings.typography.fluid = true;
    settings.typography.defaultFontSizes = false;
  }

  // Merge custom values into settings
  if (Object.keys(custom).length > 0) {
    settings.custom = custom;
  }

  const themeJson = {
    $schema: 'https://schemas.wp.org/trunk/theme.json',
    version: 3,
    settings,
  };

  return JSON.stringify(themeJson, null, 2) + '\n';
}

/**
 * Build an array of preset objects from tokens that have name + slug.
 */
function buildNamedEntries(
  group: TokenGroup,
  valueKey: string,
): Array<Record<string, unknown>> {
  const entries: Array<Record<string, unknown>> = [];
  for (const entry of Object.values(group)) {
    if (entry.name && entry.slug) {
      const obj: Record<string, unknown> = {
        slug: entry.slug,
        [valueKey]: entry.value,
        name: entry.name,
      };
      if (entry.fluid) {
        obj.fluid = entry.fluid;
      }
      if (entry.fontFace && entry.fontFace.length > 0) {
        obj.fontFace = entry.fontFace.map(face => ({
          fontFamily: entry.name,
          fontStyle: face.style,
          fontWeight: face.weight,
          src: [`file:./assets/fonts/${entry.slug}/${face.src}`],
        }));
      }
      entries.push(obj);
    }
  }
  return entries;
}

/**
 * Set a value at a dot-separated path in a nested object.
 * e.g. setNestedValue(obj, "color.palette", [...]) → obj.color.palette = [...]
 */
function setNestedValue(obj: AnySettings, path: string, value: unknown): void {
  const parts = path.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]]) current[parts[i]] = {};
    current = current[parts[i]];
  }
  current[parts[parts.length - 1]] = value;
}
