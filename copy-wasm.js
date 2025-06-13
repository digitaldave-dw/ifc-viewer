import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const wasmFiles = ['web-ifc.wasm', 'web-ifc-mt.wasm'];
const srcDir = join(__dirname, 'node_modules', 'web-ifc');
const destDir = join(__dirname, 'dist');

// Ensure dist directory exists
if (!existsSync(destDir)) {
  mkdirSync(destDir, { recursive: true });
}

// Copy WASM files
wasmFiles.forEach(file => {
  const src = join(srcDir, file);
  const dest = join(destDir, file);
  
  if (existsSync(src)) {
    copyFileSync(src, dest);
    console.log(`Copied ${file} to dist/`);
  } else {
    console.warn(`Warning: ${file} not found in node_modules/web-ifc`);
  }
});

console.log('WASM files copy completed.');