import React, { useState, useEffect } from 'react';
import { Box, Flex, Button } from '@chakra-ui/react';
import UsedColors from './UsedColors';
import { getColorUsage } from './utils';
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
  const inchPx = cellSize * fabricCount;
  const inchCols = Math.ceil(cols / fabricCount);
  const inchRows = Math.ceil(rows / fabricCount);

  const [hover, setHover] = useState(null);
  const [selected, setSelected] = useState(null);
  const [focusedCell, setFocusedCell] = useState(null);
  const [focusedColor, setFocusedColor] = useState(null);
  const [sectionComplete, setSectionComplete] = useState(false);

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

  const active = selected || hover;

  useEffect(() => {
    setFocusedCell(null);
    setFocusedColor(null);
    setSectionComplete(false);
  }, [active]);

  const subGrid = active
    ? grid
        .slice(active.y * fabricCount, active.y * fabricCount + fabricCount)
        .map(row => row.slice(active.x * fabricCount, active.x * fabricCount + fabricCount))
    : null;

  const colorUsage = subGrid ? getColorUsage(subGrid) : {};

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
          />
          <Box position="absolute" top={0} left={0} right={0} bottom={0}>
            {overlays}
          </Box>
          {active && (
            <Box
              pointerEvents="none"
              position="absolute"
              left={active.x * inchPx}
              top={active.y * inchPx}
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
              setFocusedColor(color);
            }}
          />
            <Box mt={2}>
              <UsedColors
                colors={Object.keys(colorUsage)}
                usage={colorUsage}
                activeColor={focusedColor}
                onColorClick={color => {
                  setFocusedCell(null);
                  setFocusedColor(color);
                }}
              />
              <Button
                mt={2}
                colorScheme="teal"
                onClick={() => setSectionComplete(prev => !prev)}
              >
                {sectionComplete ? 'Revisit Section' : 'Section Complete'}
              </Button>
            </Box>
          </Box>
        )}
      </Flex>
    </Box>
  );
}
