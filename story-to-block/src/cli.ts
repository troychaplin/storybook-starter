#!/usr/bin/env node

import { generate } from './index.js';

const args = process.argv.slice(2);
const command = args[0];

if (!command || command === 'help' || command === '--help') {
  printUsage();
  process.exit(0);
}

if (command !== 'generate') {
  console.error(`Unknown command: ${command}`);
  printUsage();
  process.exit(1);
}

// Parse flags
let configPath: string | undefined;
let dryRun = false;

for (let i = 1; i < args.length; i++) {
  if (args[i] === '--config' && args[i + 1]) {
    configPath = args[++i];
  } else if (args[i] === '--dry-run') {
    dryRun = true;
  }
}

try {
  if (dryRun) {
    const { loadConfig } = await import('./config.js');
    const { generateTokensCss } = await import('./generators/tokens-css.js');
    const { generateTokensWpCss } = await import('./generators/tokens-wp-css.js');
    const { generateThemeJson } = await import('./generators/theme-json.js');
    const { generateIntegratePhp } = await import('./generators/integrate-php.js');

    const config = loadConfig(configPath);

    console.log('=== tokens.css ===');
    console.log(generateTokensCss(config));
    console.log('=== tokens.wp.css ===');
    console.log(generateTokensWpCss(config));
    console.log('=== theme.json ===');
    console.log(generateThemeJson(config));
    console.log('=== integrate.php ===');
    console.log(generateIntegratePhp());
  } else {
    const result = generate(configPath);
    console.log('story-to-block: generated files:');
    for (const file of result.files) {
      console.log(`  ${file.path} (${file.size} bytes)`);
    }
  }
} catch (error) {
  if (error instanceof Error) {
    console.error(`story-to-block: ${error.message}`);
  } else {
    console.error('story-to-block: An unexpected error occurred.');
  }
  process.exit(1);
}

function printUsage(): void {
  console.log(`
story-to-block — Generate WordPress assets from design token config

Usage:
  story-to-block generate [options]

Options:
  --config <path>   Path to config file (default: ./stb.config.json)
  --dry-run         Output to stdout instead of writing files

Commands:
  generate          Read config and generate all output files
  help              Show this help message
`.trim());
}
