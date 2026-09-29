const fs = require('fs');
const path = require('path');

const imgPath = path.join(__dirname, '../client/public/gecm_logo.png');
console.log('Img path:', imgPath);
const stats = fs.statSync(imgPath);
console.log('Image file size:', stats.size, 'bytes');
