import React, { useState } from 'react';
import { Box } from '@chakra-ui/react';
import Grid from './Grid';

export default function GridMagnifier({
  grid,
  showGrid,
  maxGridPx = 500,
  zoom = 3,
  lensSize = 150
}) {
  const [pos, setPos] = useState(null);

  const handleMove = e => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleLeave = () => setPos(null);

  const lensStyle = pos
    ? {
        position: 'absolute',
        pointerEvents: 'none',
        left: pos.x - lensSize / 2,
        top: pos.y - lensSize / 2,
        width: lensSize,
        height: lensSize,
        borderRadius: '50%',
        overflow: 'hidden',
        border: '2px solid #333',
        boxShadow: '0 0 4px rgba(0,0,0,0.5)'
      }
    : { display: 'none' };

  const translateX = pos ? -pos.x * (zoom - 1) : 0;
  const translateY = pos ? -pos.y * (zoom - 1) : 0;
  const zoomStyle = {
    transform: `translate(${translateX}px, ${translateY}px) scale(${zoom})`,
    transformOrigin: '0 0'
  };

  return (
    <Box position="relative" width="fit-content" onMouseMove={handleMove} onMouseLeave={handleLeave}>
      <Grid
        grid={grid}
        setGrid={() => {}}
        selectedColor={null}
        showGrid={showGrid}
        maxGridPx={maxGridPx}
      />
      <Box style={lensStyle}>
        <Box style={zoomStyle}>
          <Grid
            grid={grid}
            setGrid={() => {}}
            selectedColor={null}
            showGrid={showGrid}
            maxGridPx={maxGridPx}
          />
        </Box>
      </Box>
    </Box>
  );
}
