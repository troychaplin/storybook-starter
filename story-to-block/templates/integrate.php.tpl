<?php
/**
 * Component Library WordPress Integration
 *
 * Loads the library's theme.json as a default base layer using
 * wp_theme_json_data_default. The active theme's theme.json
 * overrides any values defined here.
 *
 * Usage: require this file in your theme's functions.php:
 *
 *   require_once get_template_directory() . '/node_modules/your-component-library/dist/wp/integrate.php';
 *
 * @package story-to-block
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

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
