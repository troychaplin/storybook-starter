import type { StbConfig, TokenCategory, TokenGroup, BaseStylesConfig, BaseStyleElementDef } from '../types.js';
import { CATEGORY_REGISTRY, CATEGORY_ORDER, kebabToCamel } from '../types.js';
import { resolveForThemeJson, ensureFontStyle } from '../config.js';

/* eslint-disable @typescript-eslint/no-explicit-any */
type AnySettings = Record<string, any>;

export function generateThemeJson(config: StbConfig): string {
  const settings: AnySettings = {};
  const custom: Record<string, Record<string, string>> = {};

  // WordPress default preset flags — set first so they appear at the top of each section
  if (config.tokens.colorPalette || config.tokens.colorGradient) {
    settings.color = {
      defaultDuotone: config.wpThemeable,
      defaultPalette: config.wpThemeable,
      defaultGradients: config.wpThemeable,
    };
  }

  if (config.tokens.spacing) {
    settings.spacing = {
      defaultSpacingSizes: config.wpThemeable,
    };
  }

  if (config.tokens.shadow) {
    settings.shadow = {
      defaultPresets: config.wpThemeable,
    };
  }

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
  if (config.tokens.fontSize) {
    if (!settings.typography) settings.typography = {};
    settings.typography.fluid = true;
  }

  // Merge custom values into settings
  if (Object.keys(custom).length > 0) {
    settings.custom = custom;
  }

  settings.useRootPaddingAwareAlignments = true;

  const themeJson: Record<string, unknown> = {
    $schema: 'https://schemas.wp.org/trunk/theme.json',
    version: 3,
    settings,
  };

  // Build styles block from baseStyles config
  if (config.baseStyles) {
    const styles = buildStylesBlock(config.baseStyles, config.tokens);
    if (styles) {
      themeJson.styles = styles;
    }
  }

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

/**
 * Build the theme.json styles block from baseStyles config.
 */
function buildStylesBlock(
  baseStyles: BaseStylesConfig,
  tokens: StbConfig['tokens'],
): Record<string, unknown> | null {
  const styles: Record<string, unknown> = {};

  // Body typography → styles.typography
  if (baseStyles.body) {
    const bodyTypo = buildTypographyObject(baseStyles.body, tokens);
    if (Object.keys(bodyTypo).length > 0) {
      styles.typography = bodyTypo;
    }
  }

  // Spacing → styles.spacing (prefer spacing category for ambiguous keys)
  if (baseStyles.spacing?.padding) {
    const padding: Record<string, string> = {};
    for (const [side, value] of Object.entries(baseStyles.spacing.padding)) {
      if (value !== undefined) {
        padding[side] = resolveForThemeJson(value, tokens, 'spacing');
      }
    }
    if (Object.keys(padding).length > 0) {
      styles.spacing = { padding };
    }
  }

  // Elements → styles.elements
  const elements: Record<string, unknown> = {};
  const elementKeys = ['heading', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'caption'] as const;

  for (const element of elementKeys) {
    const def = baseStyles[element];
    if (!def) continue;

    // Individual headings get fontStyle: normal default
    const isIndividualHeading = /^h[1-6]$/.test(element);
    const withDefaults = isIndividualHeading ? ensureFontStyle(def) : def;

    const typo = buildTypographyObject(withDefaults, tokens);
    if (Object.keys(typo).length > 0) {
      elements[element] = { typography: typo };
    }
  }

  if (Object.keys(elements).length > 0) {
    styles.elements = elements;
  }

  return Object.keys(styles).length > 0 ? styles : null;
}

/**
 * Build a theme.json typography object from a BaseStyleElementDef.
 * Values are resolved through resolveForThemeJson.
 */
function buildTypographyObject(
  def: BaseStyleElementDef,
  tokens: StbConfig['tokens'],
): Record<string, string> {
  const result: Record<string, string> = {};

  if (def.fontFamily !== undefined) {
    result.fontFamily = resolveForThemeJson(def.fontFamily, tokens);
  }
  if (def.fontSize !== undefined) {
    result.fontSize = resolveForThemeJson(def.fontSize, tokens);
  }
  if (def.fontStyle !== undefined) {
    result.fontStyle = def.fontStyle;
  }
  if (def.fontWeight !== undefined) {
    result.fontWeight = def.fontWeight;
  }
  if (def.lineHeight !== undefined) {
    result.lineHeight = def.lineHeight;
  }

  return result;
}
