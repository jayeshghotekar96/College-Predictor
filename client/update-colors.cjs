const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    if (fs.statSync(dirPath).isDirectory()) walk(dirPath, callback);
    else callback(dirPath);
  });
}

walk('./src', (filePath) => {
  if (!filePath.endsWith('.jsx')) return;
  
  let content = fs.readFileSync(filePath, 'utf-8');
  let original = content;
  
  // Replace gradient stops
  content = content.replace(/from-blue-([0-9]{3})/g, 'from-emerald-$1');
  content = content.replace(/via-cyan-([0-9]{3})/g, 'via-emerald-$1');
  content = content.replace(/to-indigo-([0-9]{3})/g, 'to-emerald-$1');
  content = content.replace(/via-indigo-([0-9]{3})/g, 'via-emerald-$1');
  content = content.replace(/from-indigo-([0-9]{3})/g, 'from-emerald-$1');
  content = content.replace(/to-purple-([0-9]{3})/g, 'to-emerald-$1');
  content = content.replace(/from-purple-([0-9]{3})/g, 'from-emerald-$1');
  content = content.replace(/via-purple-([0-9]{3})/g, 'via-emerald-$1');
  
  // Replace solid colors
  content = content.replace(/bg-blue-([0-9]{3})/g, 'bg-emerald-$1');
  content = content.replace(/text-blue-([0-9]{3})/g, 'text-emerald-$1');
  content = content.replace(/border-blue-([0-9]{3})/g, 'border-emerald-$1');
  
  // Replace indigo colors
  content = content.replace(/bg-indigo-([0-9]{3})/g, 'bg-emerald-$1');
  content = content.replace(/text-indigo-([0-9]{3})/g, 'text-emerald-$1');
  content = content.replace(/border-indigo-([0-9]{3})/g, 'border-emerald-$1');
  content = content.replace(/ring-indigo-([0-9]{3})/g, 'ring-emerald-$1');
  
  // Replace purple colors
  content = content.replace(/bg-purple-([0-9]{3})/g, 'bg-emerald-$1');
  content = content.replace(/text-purple-([0-9]{3})/g, 'text-emerald-$1');
  content = content.replace(/border-purple-([0-9]{3})/g, 'border-emerald-$1');

  // Replace cyan colors
  content = content.replace(/bg-cyan-([0-9]{3})/g, 'bg-emerald-$1');
  content = content.replace(/text-cyan-([0-9]{3})/g, 'text-emerald-$1');
  content = content.replace(/border-cyan-([0-9]{3})/g, 'border-emerald-$1');

  // Specific glowing shadows
  content = content.replace(/rgba\(37,99,235/g, 'rgba(16,185,129'); // blue-600 to emerald-500
  content = content.replace(/rgba\(56,189,248/g, 'rgba(16,185,129'); // cyan-400 to emerald-500
  content = content.replace(/rgba\(59,130,246/g, 'rgba(16,185,129'); // blue-500 to emerald-500
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('Updated ' + filePath);
  }
});
console.log('Done');
