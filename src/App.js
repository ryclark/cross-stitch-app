import React, { useState, useRef } from 'react';
import { Box, Button } from '@chakra-ui/react';
import ImportWizard from './ImportWizard';
import Header from './Header';
import Footer from './Footer';

export default function App() {
  const [importImage, setImportImage] = useState(null);
  const fileInputRef = useRef();

  const handleImageUpload = file => {
    if (!file) return;
    const img = new window.Image();
    const reader = new FileReader();
    reader.onload = evt => {
      img.onload = () => setImportImage(img);
      img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleWizardComplete = () => {
    setImportImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleWizardCancel = () => {
    setImportImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <>
      <Header />
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        height="70vh"
      >
        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={e => handleImageUpload(e.target.files[0])}
        />
        <Button
          size="lg"
          colorScheme="teal"
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
        >
          Try it out!
        </Button>
      </Box>
      <Footer />
      {importImage && (
        <ImportWizard
          img={importImage}
          onCancel={handleWizardCancel}
          onComplete={handleWizardComplete}
        />
      )}
    </>
  );
}
