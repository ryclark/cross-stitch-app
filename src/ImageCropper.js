import React, { useState, useRef, useEffect } from 'react';
import { Box, Button, Input } from '@chakra-ui/react';

export default function ImageCropper({ img, size, maxGridPx = 400, onCancel, onApply }) {
  const containerSize = maxGridPx;

  const minScale = containerSize / Math.max(img.width, img.height);
  const initialScale = containerSize / Math.min(img.width, img.height);

  const [scale, setScale] = useState(initialScale);
  const scaleRef = useRef(initialScale);
  const [offset, setOffset] = useState({
    x: (containerSize - img.width * initialScale) / 2,
    y: (containerSize - img.height * initialScale) / 2
  });

  const dragRef = useRef(null);

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const updateOffset = (x, y, s) => {
    const w = img.width * s;
    const h = img.height * s;
    if (w <= containerSize) x = (containerSize - w) / 2;
    else x = clamp(x, containerSize - w, 0);
    if (h <= containerSize) y = (containerSize - h) / 2;
    else y = clamp(y, containerSize - h, 0);
    setOffset({ x, y });
  };

  const handleMouseDown = e => {
    dragRef.current = { x: e.clientX, y: e.clientY, start: offset };
    window.addEventListener('mousemove', handleMouseMove);
  };

  const handleMouseMove = e => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    updateOffset(dragRef.current.start.x + dx, dragRef.current.start.y + dy, scale);
  };

  useEffect(() => {
    const handleUp = () => {
      dragRef.current = null;
      window.removeEventListener('mousemove', handleMouseMove);
    };
    window.addEventListener('mouseup', handleUp);
    return () => window.removeEventListener('mouseup', handleUp);
  }, []);

  useEffect(() => {
    const prevScale = scaleRef.current;
    scaleRef.current = scale;
    updateOffset(
      offset.x + (img.width * prevScale - img.width * scale) / 2,
      offset.y + (img.height * prevScale - img.height * scale) / 2,
      scale
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scale]);

  const handleApply = () => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    const srcX = Math.max(0, -offset.x / scale);
    const srcY = Math.max(0, -offset.y / scale);
    const srcW = containerSize / scale;
    const srcH = containerSize / scale;
    ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, size, size);
    const imageData = ctx.getImageData(0, 0, size, size).data;
    onApply(imageData);
  };

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="rgba(0,0,0,0.7)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex={1000}
    >
      <Box>
        <Box
          position="relative"
          width={containerSize}
          height={containerSize}
          overflow="hidden"
          bg="#fff"
          m="0 auto"
          cursor="move"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
        >
          <img
            src={img.src}
            alt="crop"
            style={{
              position: 'absolute',
              left: offset.x,
              top: offset.y,
              width: img.width * scale,
              height: img.height * scale
            }}
          />
        </Box>
        <Box mt={2} textAlign="center">
          <Input
            type="range"
            min={minScale}
            max={initialScale * 3}
            step={0.1}
            value={scale}
            onChange={e => setScale(Number(e.target.value))}
          />
        </Box>
        <Box mt={2} textAlign="center">
          <Button onClick={handleApply} mr={2}>
            Use Image
          </Button>
          <Button onClick={onCancel}>Cancel</Button>
        </Box>
      </Box>
    </Box>
  );
}
