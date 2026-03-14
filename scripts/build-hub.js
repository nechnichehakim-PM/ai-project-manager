/**
 * Build PM Hub for deploy: copy hub to dist, use pm-hub.html as index.html
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const srcDir = path.join(root, 'public', 'hub');
const outDir = path.join(root, 'dist');

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const name of fs.readdirSync(src)) {
      copyRecursive(path.join(src, name), path.join(dest, name));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Clean and copy hub to dist
if (fs.existsSync(outDir)) fs.rmSync(outDir, { recursive: true });
fs.mkdirSync(outDir, { recursive: true });
copyRecursive(srcDir, outDir);

// Create index.html from pm-hub.html (main dashboard at root)
const pmHubPath = path.join(outDir, 'pm-hub.html');
const indexPath = path.join(outDir, 'index.html');
if (fs.existsSync(pmHubPath)) {
  fs.copyFileSync(pmHubPath, indexPath);
}

// Replace pm-hub.html with index.html in all HTML files (so root URL is dashboard)
function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/href="pm-hub\.html"/g, 'href="index.html"');
  content = content.replace(/href='pm-hub\.html'/g, "href='index.html'");
  fs.writeFileSync(filePath, content);
}

function walkDir(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) walkDir(full);
    else if (name.endsWith('.html')) replaceInFile(full);
  }
}
walkDir(outDir);

console.log('PM Hub built to dist/');
console.log('  index.html = dashboard (root)');
console.log('  Other pages: pm-hub-gantt.html, pm-hub-kanban.html, etc.');
