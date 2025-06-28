import React, { useState, useRef } from 'react';
import Grid from './Grid';
import ColorPalette from './ColorPalette';
import { exportGridAsPng, findClosestDmcColor } from './utils';
import { saveAs } from 'file-saver';
import ImageCropper from './ImageCropper';

function emptyGrid(size) {
  return Array.from({ length: size }, () => Array(size).fill(''));
}

function saveToLocal(name, grid) {
  localStorage.setItem(name, JSON.stringify(grid));
}
function loadFromLocal(name) {
  try {
    return JSON.parse(localStorage.getItem(name));
  } catch {
    return null;
  }
}

export default function App() {
  const [size, setSize] = useState(10);
  const [grid, setGrid] = useState(emptyGrid(10));
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [showGrid, setShowGrid] = useState(true);
  const [croppingImage, setCroppingImage] = useState(null);

  // --- Responsive grid width ---
  const maxGridPx = 400; // The grid will always be this many px wide.
  const cellSize = Math.floor(maxGridPx / size);

  // Ref for file input (image upload)
  const fileInputRef = useRef();
  const jsonInputRef = useRef();

  // --- Image Upload Handler ---
  const handleImageUpload = file => {
    if (!file) return;
    const img = new window.Image();
    const reader = new FileReader();
    reader.onload = evt => {
      img.onload = () => {
        setCroppingImage(img);
      };
      img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleCropApply = imageData => {
    const newGrid = [];
    for (let y = 0; y < size; y++) {
      const row = [];
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const rgb = [imageData[idx], imageData[idx + 1], imageData[idx + 2]];
        row.push(findClosestDmcColor(rgb));
      }
      newGrid.push(row);
    }
    setGrid(newGrid);
    setCroppingImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCropCancel = () => {
    setCroppingImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // For loading JSON file
  const handleFile = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const loaded = JSON.parse(evt.target.result);
        if (Array.isArray(loaded) && loaded.length > 0 && Array.isArray(loaded[0])) {
          setSize(loaded.length);
          setGrid(loaded);
        } else {
          alert('Invalid file format.');
        }
      } catch {
        alert('Invalid file.');
      } finally {
        if (jsonInputRef.current) jsonInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  // Save as JSON (download)
  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(grid)], { type: 'application/json' });
    saveAs(blob, 'cross_stitch.json');
  };

  // Export as PNG
  const handleExportPNG = () => {
    const url = exportGridAsPng(grid, cellSize, showGrid);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cross_stitch.png';
    link.click();
  };

  // New grid
  const handleNewGrid = () => {
    if (window.confirm('Clear current grid?')) {
      setGrid(emptyGrid(size));
    }
  };

  // Change grid size
  const handleSizeChange = e => {
    const newSize = Math.max(2, Math.min(40, Number(e.target.value)));
    setSize(newSize);
    setGrid(emptyGrid(newSize));
  };

  // Save/load to/from localStorage
  const handleLocalSave = () => saveToLocal('cross_stitch', grid);
  const handleLocalLoad = () => {
    const loaded = loadFromLocal('cross_stitch');
    if (loaded) {
      setSize(loaded.length);
      setGrid(loaded);
    } else {
      alert('No design found in local storage.');
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '30px auto', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h2>🧵 Cross Stitch Pattern Creator</h2>
      <div style={{ margin: '10px 0' }}>
        <label>
          Grid size:
          <input
            type="number"
            min="2"
            max="40"
            value={size}
            onChange={handleSizeChange}
            style={{ width: 50, marginLeft: 8 }}
          />
        </label>
        <button onClick={handleNewGrid} style={{ marginLeft: 8 }}>Clear Grid</button>
      </div>
      <ColorPalette selected={selectedColor} setSelected={setSelectedColor} />
      <div>
        <label>
          <input
            type="checkbox"
            checked={showGrid}
            onChange={() => setShowGrid(g => !g)}
          />{' '}
          Show Grid
        </label>
      </div>
      <Grid
        grid={grid}
        setGrid={setGrid}
        selectedColor={selectedColor}
        showGrid={showGrid}
        maxGridPx={maxGridPx}
      />

      <div style={{ margin: '16px 0', display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={handleLocalSave}>Save to Browser</button>
        <button onClick={handleLocalLoad}>Load from Browser</button>
        <button onClick={handleExportJSON}>Export JSON</button>
        <label style={{ cursor: 'pointer' }}>
          <input
            type="file"
            accept="application/json"
            style={{ display: 'none' }}
            onChange={handleFile}
            ref={jsonInputRef}
          />
          Import JSON
        </label>
        <button onClick={handleExportPNG}>Export PNG</button>
        {/* Image upload */}
        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={e => handleImageUpload(e.target.files[0])}
        />
        <button
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
        >
          Import from Image
        </button>
      </div>
      <small>
        Designs are saved locally. PNG export uses your browser. <br />
        Image import maps to the closest DMC floss color. <br />
        Made with React. Enjoy!
      </small>
      {croppingImage && (
        <ImageCropper
          img={croppingImage}
          size={size}
          maxGridPx={maxGridPx}
          onCancel={handleCropCancel}
          onApply={handleCropApply}
        />
      )}
    </div>
  );
}
