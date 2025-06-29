import { DMC_COLORS } from './ColorPalette';

// Convert hex to RGB array
export function hexToRgb(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const num = parseInt(h, 16);
  return [
    (num >> 16) & 255,
    (num >> 8) & 255,
    num & 255
  ];
}

// Euclidean distance in RGB space
function colorDist(a, b) {
  return Math.sqrt(
    Math.pow(a[0] - b[0], 2) +
    Math.pow(a[1] - b[1], 2) +
    Math.pow(a[2] - b[2], 2)
  );
}

// Count how many times each color is used
export function getColorUsage(grid) {
  const counts = {};
  grid.forEach(row =>
    row.forEach(hex => {
      if (!hex) return;
      counts[hex] = (counts[hex] || 0) + 1;
    })
  );
  return counts;
}

// Reduce the number of colors used in the grid to the desired count
export function reduceColors(grid, targetCount) {
  if (targetCount <= 0) return grid;
  const counts = getColorUsage(grid);
  const topColors = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, targetCount)
    .map(([hex]) => hex);
  if (topColors.length === 0) return grid;
  return grid.map(row =>
    row.map(hex => {
      if (!hex) return hex;
      if (topColors.includes(hex)) return hex;
      const rgb = hexToRgb(hex);
      let best = topColors[0];
      let min = Infinity;
      topColors.forEach(tc => {
        const d = colorDist(rgb, hexToRgb(tc));
        if (d < min) {
          min = d;
          best = tc;
        }
      });
      return best;
    })
  );
}

// Find the closest DMC color (by RGB distance)
export function findClosestDmcColor(rgb) {
  let minDist = Infinity;
  let closest = DMC_COLORS[0];
  DMC_COLORS.forEach(c => {
    const dmcRgb = hexToRgb(c.hex);
    const dist = colorDist(rgb, dmcRgb);
    if (dist < minDist) {
      minDist = dist;
      closest = c;
    }
  });
  return closest.hex;
}

// Export the grid as PNG (with optional grid overlay)
export function exportGridAsPng(grid, cellSize, showGrid) {
  const rows = grid.length;
  const cols = grid[0]?.length || 0;
  const canvas = document.createElement('canvas');
  canvas.width = cols * cellSize;
  canvas.height = rows * cellSize;
  const ctx = canvas.getContext('2d');

  // Draw cells
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      ctx.fillStyle = grid[y][x] || '#fff';
      ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
    }
  }

  // Optional grid overlay
  if (showGrid) {
    ctx.strokeStyle = '#888';
    for (let i = 0; i <= cols; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, rows * cellSize);
      ctx.stroke();
    }
    for (let j = 0; j <= rows; j++) {
      ctx.beginPath();
      ctx.moveTo(0, j * cellSize);
      ctx.lineTo(cols * cellSize, j * cellSize);
      ctx.stroke();
    }
  }

  return canvas.toDataURL('image/png');
}

// Return a shade slightly lighter or darker than the given color
export function slightShade(hex, amount = 40) {
  const [r, g, b] = hexToRgb(hex);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  const adj = brightness > 128 ? -amount : amount;
  const clamp = v => Math.max(0, Math.min(255, v));
  const toHex = v => v.toString(16).padStart(2, '0');
  return (
    '#' +
    toHex(clamp(r + adj)) +
    toHex(clamp(g + adj)) +
    toHex(clamp(b + adj))
  );
}
