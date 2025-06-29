import React from 'react';
import { Box, Tooltip } from '@chakra-ui/react';
import { DMC_COLORS } from './ColorPalette';
import { overlayShade } from './utils';

function hexToDmc(hex) {
  if (!hex) return null;
  const found = DMC_COLORS.find(c => c.hex.toLowerCase() === hex.toLowerCase());
  return found ? `${found.name} (#${found.code})` : null;
}

export default function Grid({
  grid,
  setGrid,
  selectedColor,
  showGrid,
  maxGridPx = 400,
  activeCell = null,
  activeColor = null,
  onCellClick = null,
  markComplete = false,
  completedCells = null
}) {
  const rows = grid.length;
  const cols = grid[0]?.length || 0;
  const BORDER = 4; // total px for the 2px border around the grid
  const cellSize = Math.floor((maxGridPx - BORDER) / Math.max(rows, cols));

  const handleCellClick = (y, x) => {
    if (onCellClick) onCellClick(y, x, grid[y][x]);
    if (setGrid && selectedColor !== undefined && selectedColor !== null) {
      setGrid(prev =>
        prev.map((row, rowIdx) =>
          rowIdx === y
            ? row.map((cell, colIdx) => (colIdx === x ? selectedColor : cell))
            : row
        )
      );
    }
  };

  return (
    <Box
      display="grid"
      gridTemplateRows={`repeat(${rows}, ${cellSize}px)`}
      gridTemplateColumns={`repeat(${cols}, ${cellSize}px)`}
      border="2px solid #444"
      boxSizing="border-box"
      boxSizing="border-box"
      w={cellSize * cols + BORDER}
      h={cellSize * rows + BORDER}
      overflow="hidden"
      m="auto"
    >
      {grid.map((row, y) =>
        row.map((color, x) => {
          const dmcLabel = hexToDmc(color) || `(${x + 1}, ${y + 1})`;
          const dimmed = activeCell
            ? !(activeCell.y === y && activeCell.x === x)
            : activeColor
            ? color !== activeColor
            : false;
          const cellKey = `${y}-${x}`;
          const isComplete =
            markComplete || (completedCells && completedCells.has(cellKey));
          return (
            <Tooltip key={`${y}-${x}`} label={dmcLabel} hasArrow>
              <Box
                onClick={() => handleCellClick(y, x)}
                w={cellSize}
                h={cellSize}
                bg={color || '#fff'}
                border={showGrid ? '1px solid #ccc' : 'none'}
                boxSizing="border-box"
                cursor="pointer"
                opacity={dimmed ? 0.3 : 1}
                display="flex"
                alignItems="center"
                justifyContent="center"
                color={isComplete ? overlayShade(color || '#fff') : 'inherit'}
                fontWeight={isComplete ? 'bold' : 'normal'}
              >
                {isComplete ? 'X' : null}
              </Box>
            </Tooltip>
          );
        })
      )}
    </Box>
  );
}
