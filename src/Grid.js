import React from 'react';
import { Box } from '@chakra-ui/react';
import { DMC_COLORS } from './ColorPalette';

function hexToDmc(hex) {
  if (!hex) return '';
  const found = DMC_COLORS.find(c => c.hex.toLowerCase() === hex.toLowerCase());
  return found ? `${found.code} (${found.name})` : '';
}

export default function Grid({ grid, setGrid, selectedColor, showGrid, maxGridPx = 400 }) {
  const size = grid.length;
  const cellSize = Math.floor(maxGridPx / size);

  const handleCellClick = (y, x) => {
    setGrid(prev =>
      prev.map((row, rowIdx) =>
        rowIdx === y
          ? row.map((cell, colIdx) => (colIdx === x ? selectedColor : cell))
          : row
      )
    );
  };

  return (
    <Box
      display="grid"
      gridTemplateRows={`repeat(${size}, ${cellSize}px)`}
      gridTemplateColumns={`repeat(${size}, ${cellSize}px)`}
      border="2px solid #444"
      w={cellSize * size}
      m="auto"
    >
      {grid.map((row, y) =>
        row.map((color, x) => (
          <Box
            key={`${y}-${x}`}
            onClick={() => handleCellClick(y, x)}
            w={cellSize}
            h={cellSize}
            bg={color || '#fff'}
            border={showGrid ? '1px solid #ccc' : 'none'}
            boxSizing="border-box"
            cursor="pointer"
            title={hexToDmc(color) || `(${x + 1}, ${y + 1})`}
          />
        ))
      )}
    </Box>
  );
}
