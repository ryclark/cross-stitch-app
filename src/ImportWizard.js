import React, { useState, useRef, useEffect } from 'react';
import Grid from './Grid';
import { findClosestDmcColor, getColorUsage, reduceColors } from './utils';

export default function ImportWizard({
  img,
  size: initialSize,
  maxGridPx = 400,
  onCancel,
  onComplete
}) {
  const containerSize = maxGridPx;

  const minScale = containerSize / Math.max(img.width, img.height);
  const initialScale = containerSize / Math.min(img.width, img.height);

  const [step, setStep] = useState(1);
  const [size, setSize] = useState(initialSize);
  const [scale, setScale] = useState(initialScale);
  const scaleRef = useRef(initialScale);
  const [offset, setOffset] = useState({
    x: (containerSize - img.width * initialScale) / 2,
    y: (containerSize - img.height * initialScale) / 2
  });
  const dragRef = useRef(null);

  const [grid, setGrid] = useState(null);
  const [preview, setPreview] = useState(null);
  const [reduceTo, setReduceTo] = useState(1);
  const [maxColors, setMaxColors] = useState(1);

  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

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
    };
    window.addEventListener('mouseup', handleUp);
    return () => window.removeEventListener('mouseup', handleUp);
  }, []);

  useEffect(() => {
    const prev = scaleRef.current;
    scaleRef.current = scale;
    updateOffset(
      offset.x + (img.width * prev - img.width * scale) / 2,
      offset.y + (img.height * prev - img.height * scale) / 2,
      scale
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scale]);

  const generateGrid = () => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    const srcX = Math.max(0, -offset.x / scale);
    const srcY = Math.max(0, -offset.y / scale);
    const srcW = containerSize / scale;
    const srcH = containerSize / scale;
    ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, size, size);
    const data = ctx.getImageData(0, 0, size, size).data;
    const g = [];
    for (let y = 0; y < size; y++) {
      const row = [];
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const rgb = [data[idx], data[idx + 1], data[idx + 2]];
        row.push(findClosestDmcColor(rgb));
      }
      g.push(row);
    }
    return g;
  };

  const handleNext = () => {
    const g = generateGrid();
    setGrid(g);
    const count = Object.keys(getColorUsage(g)).length;
    setMaxColors(count);
    setReduceTo(count);
    setPreview(g);
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleReduceChange = e => {
    const val = Number(e.target.value);
    setReduceTo(val);
    setPreview(reduceColors(grid, val));
  };

  const handleConfirm = () => {
    onComplete(preview);
  };

  if (step === 1) {
    const cellSize = containerSize / size;
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}
      >
        <div>
          <div
            style={{
              position: 'relative',
              width: containerSize,
              height: containerSize,
              overflow: 'hidden',
              background: '#fff',
              margin: '0 auto',
              cursor: 'move'
            }}
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
            <div
              style={{
                pointerEvents: 'none',
                position: 'absolute',
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.3) 1px, transparent 1px)`,
                backgroundSize: `${cellSize}px ${cellSize}px`
              }}
            />
          </div>
          <div style={{ marginTop: 8, textAlign: 'center' }}>
            <label>
              Grid size:
              <select
                value={size}
                onChange={e => setSize(Number(e.target.value))}
                style={{ marginLeft: 8 }}
              >
                <option value={100}>100 x 100</option>
                <option value={200}>200 x 200</option>
                <option value={300}>300 x 300</option>
              </select>
            </label>
          </div>
          <div style={{ marginTop: 8, textAlign: 'center' }}>
            <input
              type="range"
              min={minScale}
              max={initialScale * 3}
              step={0.1}
              value={scale}
              onChange={e => setScale(Number(e.target.value))}
            />
          </div>
          <div style={{ marginTop: 8, textAlign: 'center' }}>
            <button onClick={handleNext} style={{ marginRight: 8 }}>
              Next
            </button>
            <button onClick={onCancel}>Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
    >
      <div>
        <Grid
          grid={preview}
          setGrid={() => {}}
          selectedColor={null}
          showGrid={false}
          maxGridPx={maxGridPx}
        />
        <div style={{ marginTop: 8, textAlign: 'center' }}>
          <input
            type="range"
            min={1}
            max={maxColors}
            value={reduceTo}
            onChange={handleReduceChange}
          />
          <span style={{ marginLeft: 8 }}>{reduceTo} colors</span>
        </div>
        <div style={{ marginTop: 8, textAlign: 'center' }}>
          <button onClick={handleBack} style={{ marginRight: 8 }}>
            Back
          </button>
          <button onClick={handleConfirm}>Use Image</button>
        </div>
      </div>
    </div>
  );
}
