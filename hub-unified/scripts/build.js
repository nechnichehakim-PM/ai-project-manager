/**
 * Hub Unifie — Build script
 * Copies public/app to dist/ for deployment.
 * Run: node scripts/build.js
 */
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'public', 'app');
const DIST = path.join(__dirname, '..', 'dist');

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Clean dist
if (fs.existsSync(DIST)) {
  fs.rmSync(DIST, { recursive: true, force: true });
}

// Copy all files
copyDir(SRC, DIST);

// Count files
let count = 0;
function countFiles(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) countFiles(path.join(dir, entry.name));
    else count++;
  }
}
countFiles(DIST);

console.log('[Build] Copied ' + count + ' files to dist/');
console.log('[Build] Done. Deploy dist/ to your hosting provider.');
