const fs = require('fs');
const path = require('path');

const files = [
  path.join(__dirname, '../frontend/src/pages/Temples.jsx'),
  path.join(__dirname, '../frontend/src/pages/BookDarshan.jsx'),
  path.join(__dirname, '../backend/data/templesData.js'),
  path.join(__dirname, '../backend/scripts/updateTempleImages.js')
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Remove JSX comments `{/* ... */}`
    content = content.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
    
    // Remove multi-line comments `/* ... */`
    content = content.replace(/\/\*[\s\S]*?\*\//g, '');
    
    // Remove single line comments `// ...` (excluding http:// and https://)
    const lines = content.split('\n');
    const cleanedLines = lines.map(line => {
      const idx = line.indexOf('//');
      if (idx !== -1) {
        const pre = line.substring(0, idx);
        // Check if // is part of http:// or https:// or string literal
        if (!pre.includes('http:') && !pre.includes('https:') && !pre.includes("'//") && !pre.includes('"//')) {
          return line.substring(0, idx).trimEnd();
        }
      }
      return line;
    });

    content = cleanedLines.join('\n');
    fs.writeFileSync(file, content, 'utf8');
    console.log('Successfully removed comments from:', file);
  }
});
