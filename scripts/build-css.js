/**
 * CSS Build Script
 *
 * This script:
 * 1. Copies individual CSS files to dist/css/ for per-component loading
 * 2. Concatenates all CSS into dist/styles.css for bundled consumption
 */

import { readdir, readFile, writeFile, mkdir, copyFile, unlink } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const srcDir = join(rootDir, 'src');
const distDir = join(rootDir, 'dist');
const distCssDir = join(distDir, 'css');

// Vite generates this file from component CSS imports - we'll remove it
const viteGeneratedCss = join(distCssDir, 'index.css');

/**
 * Recursively find all CSS files in a directory
 */
async function findCssFiles(dir, files = []) {
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      await findCssFiles(fullPath, files);
    } else if (entry.name.endsWith('.css')) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Get the output filename for a CSS file
 */
function getOutputName(filePath) {
  const relativePath = filePath.replace(srcDir, '');
  const fileName = relativePath.split('/').pop();
  return fileName;
}

/**
 * Main build function
 */
async function buildCss() {
  console.log('Building CSS...\n');

  // Ensure dist/css directory exists
  await mkdir(distCssDir, { recursive: true });

  // Find all CSS files
  const cssFiles = await findCssFiles(srcDir);

  if (cssFiles.length === 0) {
    console.log('No CSS files found.');
    return;
  }

  // Order: tokens first, reset second, then components alphabetically
  const orderedFiles = cssFiles.sort((a, b) => {
    const aName = getOutputName(a);
    const bName = getOutputName(b);

    // tokens.css always first
    if (aName === 'tokens.css') return -1;
    if (bName === 'tokens.css') return 1;

    // reset.css second
    if (aName === 'reset.css') return -1;
    if (bName === 'reset.css') return 1;

    // Everything else alphabetically
    return aName.localeCompare(bName);
  });

  // Copy individual files and collect content for bundling
  const bundledContent = [];

  for (const filePath of orderedFiles) {
    const outputName = getOutputName(filePath);
    const content = await readFile(filePath, 'utf-8');

    // Copy to dist/css/
    const outputPath = join(distCssDir, outputName);
    await copyFile(filePath, outputPath);
    console.log(`  Copied: dist/css/${outputName}`);

    // Add to bundled content with header comment
    bundledContent.push(`/* === ${outputName} === */`);
    bundledContent.push(content);
    bundledContent.push('');
  }

  // Write bundled CSS
  const bundledPath = join(distDir, 'styles.css');
  await writeFile(bundledPath, bundledContent.join('\n'));
  console.log(`\n  Bundled: dist/styles.css`);

  // Clean up Vite-generated CSS (we manage CSS ourselves)
  try {
    await unlink(viteGeneratedCss);
    console.log(`  Removed: dist/css/index.css (Vite-generated)`);
  } catch {
    // File may not exist, that's fine
  }

  console.log(`\nCSS build complete! ${cssFiles.length} files processed.`);
}

// Run
buildCss().catch((err) => {
  console.error('CSS build failed:', err);
  process.exit(1);
});
