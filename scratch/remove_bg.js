const fs = require('fs');
const path = require('path');
const PNG = require('pngjs').PNG;
const jpeg = require('jpeg-js');

const inputPath = path.join(__dirname, '../client/public/gecm_logo.png');
const outputPath = path.join(__dirname, '../client/public/gecm_logo.png');

const fileBuffer = fs.readFileSync(inputPath);

let png;
try {
  png = PNG.sync.read(fileBuffer);
  console.log(`PNG loaded: ${png.width}x${png.height}`);
} catch (e) {
  console.log('Not a standard PNG, attempting JPEG decode...', e.message);
  const rawJpg = jpeg.decode(fileBuffer, { useTolerantUnknown: true });
  png = new PNG({ width: rawJpg.width, height: rawJpg.height });
  png.data = rawJpg.data;
  console.log(`JPEG decoded to PNG: ${png.width}x${png.height}`);
}

const { width, height, data } = png;

// Checkered background detector:
// The background consists of alternating light gray (~204, 204, 204 or ~220, 220, 220 or ~255, 255, 255) squares outside the blue/gold shield.
// We can run a BFS / Flood Fill starting from outer edge pixels (0,0), (width-1, 0), (0, height-1), (width-1, height-1) etc.
// Any pixel reached that is part of the checkered background (high lightness R=G=B within small variance or grey/white grid) is set to alpha = 0.

function getPixel(x, y) {
  const idx = (y * width + x) * 4;
  return {
    r: data[idx],
    g: data[idx + 1],
    b: data[idx + 2],
    a: data[idx + 3]
  };
}

function setAlpha(x, y, alpha) {
  const idx = (y * width + x) * 4;
  data[idx + 3] = alpha;
}

function isCheckeredOrBg(r, g, b) {
  // Check if pixel is grey/white (R approx G approx B, with high brightness or near pure white/light grey)
  const diff1 = Math.abs(r - g);
  const diff2 = Math.abs(g - b);
  const diff3 = Math.abs(r - b);
  const isNeutral = diff1 < 18 && diff2 < 18 && diff3 < 18;
  
  // Grey background checkers are around (200-245) or white (250-255)
  const avg = (r + g + b) / 3;
  if (isNeutral && avg > 175) return true;
  return false;
}

const visited = new Uint8Array(width * height);
const queue = [];

// Push all boundary pixels into queue
for (let x = 0; x < width; x++) {
  queue.push(x, 0);
  queue.push(x, height - 1);
}
for (let y = 0; y < height; y++) {
  queue.push(0, y);
  queue.push(width - 1, y);
}

let head = 0;
while (head < queue.length) {
  const x = queue[head++];
  const y = queue[head++];

  const index = y * width + x;
  if (visited[index]) continue;
  visited[index] = 1;

  const { r, g, b } = getPixel(x, y);

  if (isCheckeredOrBg(r, g, b)) {
    setAlpha(x, y, 0); // Make transparent!

    // Add 4-directional neighbors
    const neighbors = [
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1]
    ];

    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const nIndex = ny * width + nx;
        if (!visited[nIndex]) {
          queue.push(nx, ny);
        }
      }
    }
  }
}

// Write the modified PNG buffer back
const buffer = PNG.sync.write(png);
fs.writeFileSync(outputPath, buffer);
console.log('Transparent logo saved successfully to:', outputPath);
