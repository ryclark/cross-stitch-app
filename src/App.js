import React, { useState, useRef } from 'react';
import { Box, Button, Image, SimpleGrid } from '@chakra-ui/react';
import ImportWizard from './ImportWizard';
import Header from './Header';
import Footer from './Footer';
import sample1 from './images/samples/dancer.png';
import sample2 from './images/samples/baloons.png';
import sample3 from './images/samples/rain.png';

export default function App() {
  const [importImage, setImportImage] = useState(null);
  const [showImageOptions, setShowImageOptions] = useState(false);
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
    setShowImageOptions(false);
  };

  const handleWizardComplete = () => {
    setImportImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleWizardCancel = () => {
    setImportImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSelectSample = src => {
    const img = new window.Image();
    img.onload = () => setImportImage(img);
    img.src = src;
    setShowImageOptions(false);
  };

  const openFileDialog = () => {
    setShowImageOptions(false);
    if (fileInputRef.current) fileInputRef.current.click();
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
          onClick={() => setShowImageOptions(true)}
        >
          Try it out!
        </Button>
      </Box>
      <Footer />
      {showImageOptions && (
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
          <Box bg="white" p={4} borderRadius="md">
            <SimpleGrid columns={[1, 2]} spacing={4} minChildWidth="120px">
              <Image
                src={sample1}
                alt="Sample 1"
                cursor="pointer"
                onClick={() => handleSelectSample(sample1)}
              />
              <Image
                src={sample2}
                alt="Sample 2"
                cursor="pointer"
                onClick={() => handleSelectSample(sample2)}
              />
              <Image
                src={sample3}
                alt="Sample 3"
                cursor="pointer"
                onClick={() => handleSelectSample(sample3)}
              />
              <Button onClick={openFileDialog}>Upload your own image</Button>
            </SimpleGrid>
            <Box textAlign="right" mt={4}>
              <Button onClick={() => setShowImageOptions(false)}>Cancel</Button>
            </Box>
          </Box>
        </Box>
      )}
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
