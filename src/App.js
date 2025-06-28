import React, { useState, useRef, useEffect, useMemo } from 'react';
import Grid from './Grid';
import ColorPalette from './ColorPalette';
import {
  exportGridAsPng,
  getColorUsage,
  reduceColors
} from './utils';
import { saveAs } from 'file-saver';
import ImportWizard from './ImportWizard';
import Header from './Header';

function emptyGrid(width, height = width) {
  return Array.from({ length: height }, () => Array(width).fill(''));
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

function getMaxDim(grid) {
  return Math.max(grid.length, grid[0]?.length || 0);
}

export default function App() {
  const [size, setSize] = useState(100);
  const [grid, setGrid] = useState(emptyGrid(100, 100));
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [showGrid, setShowGrid] = useState(true);
  const [importImage, setImportImage] = useState(null);
  const colorUsage = useMemo(() => getColorUsage(grid), [grid]);
  const [reduceTo, setReduceTo] = useState(10);

  // --- Responsive grid width ---
  const getMaxGridPx = () => Math.max(100, window.innerWidth - 40);
  const [maxGridPx, setMaxGridPx] = useState(getMaxGridPx());
  const cellSize = Math.floor(maxGridPx / size);

  useEffect(() => {
    const handleResize = () => setMaxGridPx(getMaxGridPx());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const count = Object.keys(colorUsage).length;
    if (reduceTo > count) setReduceTo(count);
  }, [colorUsage, reduceTo]);

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
        setImportImage(img);
      };
      img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleWizardComplete = newGrid => {
    setGrid(newGrid);
    setSize(getMaxDim(newGrid));
    setImportImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleWizardCancel = () => {
    setImportImage(null);
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
          setSize(getMaxDim(loaded));
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
      setGrid(emptyGrid(size, size));
    }
  };

  // Change grid size
  const handleSizeChange = e => {
    const newSize = Number(e.target.value);
    setSize(newSize);
    setGrid(emptyGrid(newSize, newSize));
  };

  // Save/load to/from localStorage
  const handleLocalSave = () => saveToLocal('cross_stitch', grid);
  const handleLocalLoad = () => {
    const loaded = loadFromLocal('cross_stitch');
    if (loaded) {
      setSize(getMaxDim(loaded));
      setGrid(loaded);
    } else {
      alert('No design found in local storage.');
    }
  };

  const handleReduceColors = () => {
    setGrid(prev => reduceColors(prev, reduceTo));
  };

  return (
    <>
      <Header />
      <div
        style={{
          margin: '30px auto',
          fontFamily: 'sans-serif',
          textAlign: 'center',
          padding: '0 20px'
        }}
      >
      

    

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
      {importImage && (
        <ImportWizard
          img={importImage}
          size={size}
          maxGridPx={maxGridPx}
          onCancel={handleWizardCancel}
          onComplete={handleWizardComplete}
        />
      )}
    </div>
    </>
  );
}
