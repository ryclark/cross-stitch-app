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
  const size = grid.length;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size * cellSize;
  const ctx = canvas.getContext('2d');

  // Draw cells
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      ctx.fillStyle = grid[y][x] || '#fff';
      ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
    }
  }

  // Optional grid overlay
  if (showGrid) {
    ctx.strokeStyle = '#888';
    for (let i = 0; i <= size; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, size * cellSize);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(size * cellSize, i * cellSize);
      ctx.stroke();
    }
  }

  return canvas.toDataURL('image/png');
}
