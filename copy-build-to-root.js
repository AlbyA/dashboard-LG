const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, 'client', 'build');
const destDir = __dirname;

console.log(`Copying build files from ${sourceDir} to ${destDir}`);

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(childItemName => {
      // Skip copying node_modules or other unnecessary files
      if (childItemName === 'node_modules' || childItemName === '.git') {
        return;
      }
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

try {
  if (!fs.existsSync(sourceDir)) {
    console.error(`Error: Build directory ${sourceDir} does not exist.`);
    console.error('Please run "cd client && npm run build" first.');
    process.exit(1);
  }

  // Copy all files from client/build to root
  copyRecursiveSync(sourceDir, destDir);
  console.log('✅ Build files copied to root successfully!');
  console.log('✅ index.html is now in the root directory');
} catch (error) {
  console.error('❌ Error copying build files:', error);
  process.exit(1);
}

