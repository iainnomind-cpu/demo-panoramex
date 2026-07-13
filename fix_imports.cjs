const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'api'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // Match import/export statements that point to local files (starting with . or ..)
  // and don't already have .js extension
  const updated = content.replace(/(import|export)\s+(?:.+?)\s+from\s+['"](\.[^'"]+)(?<!\.js)['"]/g, (match, p1, p2) => {
    return match.replace(p2, p2 + '.js');
  });
  
  if (content !== updated) {
    fs.writeFileSync(file, updated);
    console.log(`Updated ${file}`);
  }
});
