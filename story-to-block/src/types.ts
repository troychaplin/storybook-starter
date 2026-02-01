export interface TokenEntry {
  value: string;
  name?: string;
  slug?: string;
  fluid?: { min: string; max: string };
}

export type TokenGroup = Record<string, TokenEntry>;

/**
 * Defines how a token category maps to CSS variables,
 * WordPress preset CSS variables, and theme.json output.
 */
export interface CategoryDef {
  /** CSS variable segment: e.g. "color" → --prefix-color-*, "font-family" → --prefix-font-family-* */
  cssSegment: string;
  /** Human-readable label for CSS comments */
  label: string;
  /** Output order in generated CSS files */
  order: number;
  /**
   * Where named tokens (with name+slug) go in theme.json settings.
   * - `path`: dot-separated path under settings, e.g. "color.palette" or "shadow.presets"
   * - `valueKey`: the property name for the token value in the preset object, e.g. "color", "size", "shadow"
   *
   * Omit for categories that don't produce theme.json presets (fontWeight, lineHeight, etc.)
   */
  themeJson?: {
    path: string;
    valueKey: string;
  };
  /** WordPress preset CSS variable prefix, e.g. "--wp--preset--color". Omit = hardcoded in wp css. */
  wpPreset?: string;
  /** Key under settings.custom for tokens without a native preset mapping, e.g. "fontWeight" */
  custom?: string;
  /** If true, category is excluded from theme.json entirely (e.g. zIndex) */
  exclude?: boolean;
  /** If true, tokens map directly to a settings object (not a preset array). Used by layout. */
  directMap?: boolean;
}

/**
 * Central registry mapping token category names to their output behavior.
 * Adding a new category here is all that's needed to support it across all generators.
 */
/**
 * Categories that are nested under a parent key in the config file.
 * e.g. "color" in the config contains "palette" and "gradient" sub-keys,
 * which map to the flat registry categories "colorPalette" and "colorGradient".
 */
export const NESTED_CATEGORIES: Record<string, Record<string, string>> = {
  color: {
    palette: 'colorPalette',
    gradient: 'colorGradient',
  },
};

export const CATEGORY_REGISTRY: Record<string, CategoryDef> = {
  colorPalette: {
    cssSegment: 'color',
    label: 'Colors',
    order: 0,
    themeJson: { path: 'color.palette', valueKey: 'color' },
    wpPreset: '--wp--preset--color',
  },
  colorGradient: {
    cssSegment: 'gradient',
    label: 'Gradients',
    order: 1,
    themeJson: { path: 'color.gradients', valueKey: 'gradient' },
    wpPreset: '--wp--preset--gradient',
  },
  spacing: {
    cssSegment: 'spacing',
    label: 'Spacing',
    order: 2,
    themeJson: { path: 'spacing.spacingSizes', valueKey: 'size' },
    wpPreset: '--wp--preset--spacing',
  },
  fontFamily: {
    cssSegment: 'font-family',
    label: 'Font Families',
    order: 3,
    themeJson: { path: 'typography.fontFamilies', valueKey: 'fontFamily' },
    wpPreset: '--wp--preset--font-family',
  },
  fontSize: {
    cssSegment: 'font-size',
    label: 'Font Sizes',
    order: 4,
    themeJson: { path: 'typography.fontSizes', valueKey: 'size' },
    wpPreset: '--wp--preset--font-size',
  },
  shadow: {
    cssSegment: 'shadow',
    label: 'Shadows',
    order: 5,
    themeJson: { path: 'shadow.presets', valueKey: 'shadow' },
    wpPreset: '--wp--preset--shadow',
    custom: 'shadow',
  },
  fontWeight: {
    cssSegment: 'font-weight',
    label: 'Font Weights',
    order: 6,
    custom: 'fontWeight',
  },
  lineHeight: {
    cssSegment: 'line-height',
    label: 'Line Heights',
    order: 7,
    custom: 'lineHeight',
  },
  radius: {
    cssSegment: 'radius',
    label: 'Border Radius',
    order: 8,
    custom: 'radius',
  },
  transition: {
    cssSegment: 'transition',
    label: 'Transitions',
    order: 9,
    custom: 'transition',
  },
  zIndex: {
    cssSegment: 'z',
    label: 'Z-Index',
    order: 10,
    exclude: true,
  },
  layout: {
    cssSegment: 'layout',
    label: 'Layout',
    order: 11,
    directMap: true,
    themeJson: { path: 'layout', valueKey: 'direct' },
  },
};

export type TokenCategory =
  | 'colorPalette' | 'colorGradient' | 'spacing' | 'fontFamily' | 'fontSize'
  | 'shadow' | 'fontWeight' | 'lineHeight' | 'radius' | 'transition' | 'zIndex'
  | 'layout';

/** All valid category names, derived from the registry */
export const VALID_CATEGORIES = Object.keys(CATEGORY_REGISTRY) as TokenCategory[];

/** Categories sorted by their output order */
export const CATEGORY_ORDER = [...VALID_CATEGORIES].sort(
  (a, b) => CATEGORY_REGISTRY[a].order - CATEGORY_REGISTRY[b].order,
);

/** Internal config after normalization — uses flat category keys like colorPalette */
export interface StbConfig {
  prefix: string;
  tokensPath: string;
  outDir: string;
  tokens: Partial<Record<TokenCategory, TokenGroup>>;
}

/** Config as written by the user — supports nested keys like color.palette */
export interface StbConfigInput {
  prefix: string;
  tokensPath?: string;
  outDir?: string;
  tokens: Record<string, TokenGroup | Record<string, TokenGroup>>;
}

/**
 * Convert a kebab-case key to camelCase.
 * e.g. "content-size" → "contentSize"
 */
export function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}
