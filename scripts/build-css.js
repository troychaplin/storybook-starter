/**
 * CSS Build Script
 *
 * This script:
 * 1. Compiles SCSS files to CSS
 * 2. Copies component CSS to dist/components/{Name}/ (co-located with JS)
 * 3. Copies global CSS to dist/css/ (tokens, reset, fonts)
 * 4. Concatenates all CSS into dist/styles.css for bundled consumption
 */

import { readdir, readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname, basename, extname } from 'path';
import { fileURLToPath } from 'url';
import * as sass from 'sass';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const srcDir = join(rootDir, 'src');
const distDir = join(rootDir, 'dist');
const distCssDir = join(distDir, 'css');

/**
 * Recursively find all style files (.scss and .css) in a directory
 * Excludes partials (files starting with _)
 */
async function findStyleFiles(dir, files = []) {
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      await findStyleFiles(fullPath, files);
    } else if (
      (entry.name.endsWith('.scss') || entry.name.endsWith('.css')) &&
      !entry.name.startsWith('_') // Exclude partials
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Determine if a style file is a component style (in components folder)
 * or a global style (in styles folder)
 */
function isComponentStyle(filePath) {
  return filePath.includes('/components/');
}

/**
 * Get the component name from a component style path
 * e.g., src/components/Button/Button.scss → Button
 */
function getComponentName(filePath) {
  const parts = filePath.split('/');
  const componentsIndex = parts.indexOf('components');
  return parts[componentsIndex + 1];
}

/**
 * Get the output path for a style file (always outputs .css)
 */
function getOutputPath(filePath) {
  const fileName = basename(filePath).replace(/\.scss$/, '.css');

  if (isComponentStyle(filePath)) {
    // Component CSS: dist/components/{Name}/{Name}.css
    const componentName = getComponentName(filePath);
    return join(distDir, 'components', componentName, fileName);
  } else {
    // Global CSS: dist/css/{name}.css
    return join(distCssDir, fileName);
  }
}

/**
 * Get the relative path for display
 */
function getDisplayPath(outputPath) {
  return outputPath.replace(distDir + '/', 'dist/');
}

/**
 * Compile SCSS or read CSS file
 */
async function compileStyle(filePath) {
  const ext = extname(filePath);

  if (ext === '.scss') {
    // Compile SCSS
    const result = sass.compile(filePath, {
      style: 'compressed',
      loadPaths: [srcDir],
    });
    return result.css;
  } else {
    // Read CSS as-is
    return await readFile(filePath, 'utf-8');
  }
}

/**
 * Main build function
 */
async function buildCss() {
  console.log('Building CSS...\n');

  // Find all style files
  const styleFiles = await findStyleFiles(srcDir);

  if (styleFiles.length === 0) {
    console.log('No style files found.');
    return;
  }

  // Separate component and global styles
  const componentStyles = styleFiles.filter(isComponentStyle);
  const globalStyles = styleFiles.filter((f) => !isComponentStyle(f));

  // Order for bundling: tokens first, fonts second, reset third, then components alphabetically
  const orderedFiles = [...globalStyles, ...componentStyles].sort((a, b) => {
    const aName = basename(a).replace(/\.scss$/, '.css');
    const bName = basename(b).replace(/\.scss$/, '.css');

    // tokens.css always first
    if (aName === 'tokens.css') return -1;
    if (bName === 'tokens.css') return 1;

    // fonts.css second
    if (aName === 'fonts.css') return -1;
    if (bName === 'fonts.css') return 1;

    // reset.css third
    if (aName === 'reset.css') return -1;
    if (bName === 'reset.css') return 1;

    // Everything else alphabetically
    return aName.localeCompare(bName);
  });

  // Ensure dist/css directory exists
  await mkdir(distCssDir, { recursive: true });

  // Compile/copy individual files and collect content for bundling
  const bundledContent = [];

  for (const filePath of orderedFiles) {
    const outputPath = getOutputPath(filePath);
    const outputName = basename(outputPath);

    try {
      // Compile SCSS or read CSS
      const css = await compileStyle(filePath);

      // Ensure output directory exists
      await mkdir(dirname(outputPath), { recursive: true });

      // Write compiled CSS
      await writeFile(outputPath, css);
      console.log(`  Compiled: ${getDisplayPath(outputPath)}`);

      // Add to bundled content with header comment
      bundledContent.push(`/* === ${outputName} === */`);
      bundledContent.push(css);
      bundledContent.push('');
    } catch (error) {
      console.error(`  Error compiling ${filePath}:`, error.message);
      process.exit(1);
    }
  }

  // Write bundled CSS
  const bundledPath = join(distDir, 'styles.css');
  await writeFile(bundledPath, bundledContent.join('\n'));
  console.log(`\n  Bundled: dist/styles.css`);

  console.log(`\nCSS build complete! ${styleFiles.length} files processed.`);
  console.log(`  - ${globalStyles.length} global styles → dist/css/`);
  console.log(`  - ${componentStyles.length} component styles → dist/components/*/`);
}

// Run
buildCss().catch((err) => {
  console.error('CSS build failed:', err);
  process.exit(1);
});
