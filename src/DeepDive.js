import React, { useState, useEffect, useMemo } from 'react';
import { Box, Flex, Button } from '@chakra-ui/react';
import UsedColors from './UsedColors';
import { getColorUsage } from './utils';
import { DMC_COLORS } from './ColorPalette';
import { useLocation, useNavigate } from 'react-router-dom';
import Grid from './Grid';

export default function DeepDive() {
  const location = useLocation();
  const navigate = useNavigate();
  const pattern = location.state?.pattern;

  if (!pattern) {
    return (
      <Box p={4}>No pattern available.</Box>
    );
  }

  const { grid, fabricCount } = pattern;
  const maxGridPx = 500;
  const rows = grid.length;
  const cols = grid[0]?.length || 0;
  const BORDER = 4;
  const cellSize = Math.floor((maxGridPx - BORDER) / Math.max(rows, cols));
  const gridWidth = cellSize * cols + BORDER;
  const gridHeight = cellSize * rows + BORDER;
  const borderOffset = BORDER / 2; // offset for the 2px grid border
  const inchPx = cellSize * fabricCount;
  const inchCols = Math.ceil(cols / fabricCount);
  const inchRows = Math.ceil(rows / fabricCount);

  const [hover, setHover] = useState(null);
  const [selected, setSelected] = useState(null);
  const [focusedCell, setFocusedCell] = useState(null);
  const [focusedColor, setFocusedColor] = useState(null);
  const [sectionComplete, setSectionComplete] = useState(false);
  const [completedCells, setCompletedCells] = useState(new Set());

  const overlays = [];
  for (let y = 0; y < inchRows; y++) {
    for (let x = 0; x < inchCols; x++) {
      const w = cellSize * Math.min(fabricCount, cols - x * fabricCount);
      const h = cellSize * Math.min(fabricCount, rows - y * fabricCount);
      overlays.push(
        <Box
          key={`${y}-${x}`}
          position="absolute"
          left={x * inchPx}
          top={y * inchPx}
          width={w}
          height={h}
          cursor="pointer"
          onMouseEnter={() => !selected && setHover({ x, y, w, h })}
          onMouseLeave={() => !selected && setHover(null)}
          onClick={() => {
            setSelected({ x, y, w, h });
            setHover(null);
          }}
        />
      );
    }
  }

  const getSectionKeys = section => {
    const keys = [];
    for (let dy = 0; dy < fabricCount; dy++) {
      for (let dx = 0; dx < fabricCount; dx++) {
        const yy = section.y * fabricCount + dy;
        const xx = section.x * fabricCount + dx;
        if (yy < rows && xx < cols) keys.push(`${yy}-${xx}`);
      }
    }
    return keys;
  };

  const active = selected || hover;

  useEffect(() => {
    setFocusedCell(null);
    setFocusedColor(null);
    if (selected) {
      const keys = getSectionKeys(selected);
      const done = keys.every(k => completedCells.has(k));
      setSectionComplete(done);
    } else {
      setSectionComplete(false);
    }
  }, [active, completedCells]);

  const subGrid = active
    ? grid
        .slice(active.y * fabricCount, active.y * fabricCount + fabricCount)
        .map(row => row.slice(active.x * fabricCount, active.x * fabricCount + fabricCount))
    : null;

  const colorUsage = subGrid ? getColorUsage(subGrid) : {};
  const completedUsage = useMemo(() => {
    const counts = {};
    completedCells.forEach(key => {
      const [y, x] = key.split('-').map(Number);
      const c = grid[y][x];
      if (!c) return;
      counts[c] = (counts[c] || 0) + 1;
    });
    return counts;
  }, [completedCells, grid]);

  return (
    <Box p={4}>
      <Button mb={4} onClick={() => navigate(-1)} colorScheme="teal">
        Back
      </Button>
      <Flex gap={4} flexDir={{ base: 'column', md: 'row' }} align="flex-start">
        <Box position="relative" width={gridWidth} height={gridHeight} flexShrink={0} overflow="hidden">
          <Grid
            grid={grid}
            setGrid={() => {}}
            selectedColor={null}
            showGrid={true}
            maxGridPx={maxGridPx}
            completedCells={completedCells}
          />
          <Box
            position="absolute"
            top={borderOffset}
            left={borderOffset}
            right={borderOffset}
            bottom={borderOffset}
          >
            {overlays}
          </Box>
          {active && (
            <Box
              pointerEvents="none"
              position="absolute"
              left={borderOffset + active.x * inchPx}
              top={borderOffset + active.y * inchPx}
              width={active.w}
              height={active.h}
              boxShadow="0 0 0 9999px rgba(0,0,0,0.5)"
              border="2px solid teal"
            />
          )}
        </Box>
        {active && (
          <Box>
          <Grid
            grid={subGrid}
            setGrid={() => {}}
            selectedColor={null}
            showGrid={true}
            maxGridPx={300}
            activeCell={focusedCell}
            activeColor={focusedColor}
            markComplete={sectionComplete}
            onCellClick={(y, x, color) => {
              setFocusedCell(null);
              setFocusedColor(prev => (prev === color ? prev : color));
            }}
          />
            <Box mt={2}>
              <UsedColors
                colors={Object.keys(colorUsage)}
                usage={colorUsage}
                activeColor={focusedColor}
                onColorClick={color => {
                  setFocusedCell(null);
                  setFocusedColor(prev => (prev === color ? prev : color));
                }}
              />
              <Button
                mt={2}
                colorScheme="teal"
                onClick={() => {
                  const keys = getSectionKeys(selected);
                  setCompletedCells(prev => {
                    const next = new Set(prev);
                    if (sectionComplete) {
                      keys.forEach(k => next.delete(k));
                    } else {
                      keys.forEach(k => next.add(k));
                    }
                    return next;
                  });
                  setSectionComplete(prev => !prev);
                }}
              >
                {sectionComplete ? 'Revisit Section' : 'Section Complete'}
              </Button>
              {focusedColor && (
                <Box mt={3} textAlign="center">
                  {(() => {
                    const dmc = DMC_COLORS.find(
                      c => c.hex.toLowerCase() === focusedColor.toLowerCase()
                    );
                    const name = dmc
                      ? `${dmc.name} (#${dmc.code})`
                      : focusedColor;
                    const sectionCount = colorUsage[focusedColor] || 0;
                    const remaining =
                      (pattern.colorUsage[focusedColor] || 0) -
                      (completedUsage[focusedColor] || 0);
                    const skeins = (remaining / 1800).toFixed(2);
                    return (
                      <>
                        <Box fontWeight="bold">{name}</Box>
                        <Box fontSize="sm">
                          {sectionCount} stitches in this section
                          <br />
                          {remaining} stitches remaining overall
                          <br />
                          {skeins} skeins needed
                        </Box>
                      </>
                    );
                  })()}
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Flex>
    </Box>
  );
}
