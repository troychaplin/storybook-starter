export interface TokenEntry {
  value: string;
  name?: string;
  slug?: string;
}

export type TokenGroup = Record<string, TokenEntry>;

export type TokenCategory =
  | 'color'
  | 'spacing'
  | 'fontFamily'
  | 'fontSize'
  | 'fontWeight'
  | 'lineHeight'
  | 'radius'
  | 'shadow'
  | 'transition'
  | 'zIndex';

export interface StbConfig {
  prefix: string;
  tokensPath: string;
  outDir: string;
  tokens: Partial<Record<TokenCategory, TokenGroup>>;
}

export interface StbConfigInput {
  prefix: string;
  tokensPath?: string;
  outDir?: string;
  tokens: Partial<Record<TokenCategory, TokenGroup>>;
}

/**
 * Maps token categories to their CSS variable segment.
 * e.g. fontFamily -> "font-family", zIndex -> "z"
 */
export const CATEGORY_CSS_SEGMENT: Record<TokenCategory, string> = {
  color: 'color',
  spacing: 'spacing',
  fontFamily: 'font-family',
  fontSize: 'font-size',
  fontWeight: 'font-weight',
  lineHeight: 'line-height',
  radius: 'radius',
  shadow: 'shadow',
  transition: 'transition',
  zIndex: 'z',
};

/**
 * Maps token categories to their WordPress preset CSS variable path.
 * Only categories with a native theme.json preset mapping are included.
 * Categories not listed here use hardcoded values in tokens.wp.css.
 */
export const WP_PRESET_MAPPING: Partial<Record<TokenCategory, string>> = {
  color: '--wp--preset--color',
  spacing: '--wp--preset--spacing',
  fontFamily: '--wp--preset--font-family',
  fontSize: '--wp--preset--font-size',
};
