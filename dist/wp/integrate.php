<?php
/**
 * Component Library WordPress Integration
 *
 * Loads the library's theme.json as a default base layer and enqueues
 * design token CSS variables. Automatically loads tokens.wp.css
 * (themeable) if present, otherwise falls back to tokens.css (locked).
 *
 * Setup:
 *   1. Copy this file, theme.json, and your token CSS file into your theme
 *      (e.g. assets/stb/)
 *   2. Add to your theme's functions.php:
 *      require_once get_template_directory() . '/assets/stb/integrate.php';
 *
 * @package story-to-block
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Inject the library's theme.json as a WordPress default base layer.
 *
 * This registers design tokens (colors, spacing, fonts, etc.) as
 * WordPress presets. The active theme's theme.json overrides any
 * values defined here.
 */
add_filter( 'wp_theme_json_data_default', function ( $theme_json ) {
	$library_json_path = __DIR__ . '/theme.json';

	if ( ! file_exists( $library_json_path ) ) {
		return $theme_json;
	}

	$library_data = json_decode(
		file_get_contents( $library_json_path ),
		true
	);

	if ( ! is_array( $library_data ) ) {
		return $theme_json;
	}

	return $theme_json->update_with( $library_data );
} );

/**
 * Enqueue design token CSS variables.
 *
 * Prefers tokens.wp.css (themeable — maps to --wp--preset--* variables)
 * over tokens.css (locked — hardcoded values). Both are looked for in
 * the same directory as this file.
 *
 * Loads on both the frontend and inside the block editor iframe.
 */
$stb_enqueue_tokens = function () {
	if ( file_exists( __DIR__ . '/tokens.wp.css' ) ) {
		$file = 'tokens.wp.css';
	} elseif ( file_exists( __DIR__ . '/tokens.css' ) ) {
		$file = 'tokens.css';
	} else {
		return;
	}

	$base_url = content_url(
		str_replace(
			wp_normalize_path( WP_CONTENT_DIR ),
			'',
			wp_normalize_path( __DIR__ )
		)
	);

	wp_enqueue_style(
		'stb-tokens',
		$base_url . '/' . $file,
		array(),
		filemtime( __DIR__ . '/' . $file )
	);
};

add_action( 'wp_enqueue_scripts', $stb_enqueue_tokens );
add_action( 'enqueue_block_editor_assets', $stb_enqueue_tokens );
