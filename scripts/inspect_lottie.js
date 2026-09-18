const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/interactive-volume.json', 'utf8'));

// Check colors
function findColors(obj, found = []) {
  if (!obj || typeof obj !== 'object') return found;
  if (obj.ty === 'fl' || obj.ty === 'st') {
    if (obj.c && obj.c.k) {
      const k = obj.c.k;
      if (Array.isArray(k) && typeof k[0] === 'number') {
        found.push(k.map(v => Math.round(v <= 1 ? v * 255 : v)));
      }
    }
  }
  for (const key of Object.keys(obj)) {
    findColors(obj[key], found);
  }
  return found;
}

const colors = findColors(data);
const unique = [...new Set(colors.map(c => `rgb(${c[0]},${c[1]},${c[2]})`))];
console.log('Unique colors in animation:', unique);
console.log('Markers:', data.markers);
