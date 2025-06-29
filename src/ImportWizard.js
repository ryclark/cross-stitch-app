import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Flex,
  InputGroup,
  InputRightAddon,
  NumberInput,
  NumberInputField,
  Select,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Stepper,
  Step,
  StepIndicator,
  StepStatus,
  StepIcon,
  StepNumber,
  StepTitle,
  StepDescription,
  StepSeparator,
  Text
} from '@chakra-ui/react';
import Grid from './Grid';
import { findClosestDmcColor, getColorUsage, reduceColors } from './utils';
import Collapsible from './Collapsible';
import UsedColors from './UsedColors';

export default function ImportWizard({
  img,
  size: initialSize,
  maxGridPx = 400,
  onCancel,
  onComplete
}) {
  // Limit the preview/crop area so the wizard modal stays usable on large screens
  const containerSize = Math.min(maxGridPx, 700);
  // Outer modal width keeps a small margin around the image area
  const modalWidth = containerSize + 40;

  const [step, setStep] = useState(0); // 0-based index
  const [fabricCount, setFabricCount] = useState(14);
  const [widthIn, setWidthIn] = useState(4);
  const [heightIn, setHeightIn] = useState(4);

  const inchFormatter = useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        style: 'unit',
        unit: 'inch',
        unitDisplay: 'long',
        maximumFractionDigits: 1
      }),
    []
  );

  const inchCell = 12; // size of a single stitch preview cell

  const gridWidth = Math.round(widthIn * fabricCount);
  const gridHeight = Math.round(heightIn * fabricCount);

  // Dimensions for the cropping overlay in step 3
  const maxDim = Math.max(gridWidth, gridHeight);
  const cellPx = containerSize / maxDim;
  const cropWidth = gridWidth * cellPx;
  const cropHeight = gridHeight * cellPx;

  // Crop state
  const minScale = Math.min(cropWidth / img.width, cropHeight / img.height);
  const initialScale = Math.max(cropWidth / img.width, cropHeight / img.height);
  const [scale, setScale] = useState(initialScale);
  const scaleRef = useRef(initialScale);
  const [offset, setOffset] = useState({
    x: (cropWidth - img.width * initialScale) / 2,
    y: (cropHeight - img.height * initialScale) / 2
  });
  const dragRef = useRef(null);

  const [grid, setGrid] = useState(null);
  const [preview, setPreview] = useState(null);
  const [reduceTo, setReduceTo] = useState(1);
  const [maxColors, setMaxColors] = useState(1);
  const colorUsage = useMemo(() => (preview ? getColorUsage(preview) : {}), [preview]);

  // Size preview scale so the design preview fits inside the wizard
  const previewScale = Math.min(
    containerSize / gridWidth,
    containerSize / gridHeight
  );
  const inchPx = fabricCount * previewScale;

  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

  const updateOffset = (x, y, s) => {
    const w = img.width * s;
    const h = img.height * s;
    if (w <= cropWidth) x = (cropWidth - w) / 2;
    else x = clamp(x, cropWidth - w, 0);
    if (h <= cropHeight) y = (cropHeight - h) / 2;
    else y = clamp(y, cropHeight - h, 0);
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
    const prev = scaleRef.current;
    scaleRef.current = scale;
    updateOffset(
      offset.x + (img.width * prev - img.width * scale) / 2,
      offset.y + (img.height * prev - img.height * scale) / 2,
      scale
    );
  }, [scale]);

  const generateGrid = () => {
    const canvas = document.createElement('canvas');
    canvas.width = gridWidth;
    canvas.height = gridHeight;
    const ctx = canvas.getContext('2d');
    const srcX = Math.max(0, -offset.x / scale);
    const srcY = Math.max(0, -offset.y / scale);
    const srcW = cropWidth / scale;
    const srcH = cropHeight / scale;
    ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, gridWidth, gridHeight);
    const data = ctx.getImageData(0, 0, gridWidth, gridHeight).data;
    const g = [];
    for (let y = 0; y < gridHeight; y++) {
      const row = [];
      for (let x = 0; x < gridWidth; x++) {
        const idx = (y * gridWidth + x) * 4;
        const rgb = [data[idx], data[idx + 1], data[idx + 2]];
        row.push(findClosestDmcColor(rgb));
      }
      g.push(row);
    }
    return g;
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 0));

  const handleNext = () => {
    if (step === 2) {
      const g = generateGrid();
      setGrid(g);
      const count = Object.keys(getColorUsage(g)).length;
      setMaxColors(count);
      setReduceTo(count);
      setPreview(g);
    }
    if (step === 3) {
      // proceed to done
    }
    nextStep();
  };

  const handleFinish = () => {
    onComplete({
      grid: preview,
      fabricCount,
      widthIn,
      heightIn,
      colors: Object.keys(colorUsage),
      colorUsage
    });
  };

  const handleReduceChange = val => {
    setReduceTo(val);
    setPreview(reduceColors(grid, val));
  };

  const steps = [
    { title: 'Fabric', description: 'Select fabric type' },
    { title: 'Size', description: 'Design dimensions' },
    { title: 'Overlay', description: 'Position image' },
    { title: 'Colors', description: 'Limit palette' },
    { title: 'Done', description: 'Finish' }
  ];

  const overlayProps = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    bg: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  };

  return (
    <Box {...overlayProps}>
      <Box
        bg='white'
        p={4}
        borderRadius='md'
        width={modalWidth * 2}
        maxWidth="90vw"
        maxHeight="90vh"
        overflowY="auto"
      >
        <Stepper index={step} mb={4} size='sm'>
          {steps.map((s, i) => (
            <Step key={i}>
              <StepIndicator>
                <StepStatus complete={<StepIcon />} incomplete={<StepNumber />} active={<StepNumber />} />
              </StepIndicator>
              <Box flexShrink='0'>
                <StepTitle>{s.title}</StepTitle>
                <StepDescription>{s.description}</StepDescription>
              </Box>
              <StepSeparator />
            </Step>
          ))}
        </Stepper>

        {step === 0 && (
          <Box>
            <Select value={fabricCount} onChange={e => setFabricCount(Number(e.target.value))} mb={2}>
              <option value={11}>11-count Aida</option>
              <option value={14}>14-count Aida</option>
              <option value={16}>16-count Aida</option>
              <option value={18}>18-count Aida</option>
            </Select>
            <Text fontSize='sm' mb={4}>
              Fabric type is Aida and the number is stitches per inch. For example, 14-count Aida is Aida fabric with 14 stitches per inch.
            </Text>
            <Box textAlign='center' mb={4}>
              <Text mb={1}>1"</Text>
              <Box
                display='grid'
                gridTemplateColumns={`repeat(${fabricCount}, ${inchCell}px)`}
                gridTemplateRows={`${inchCell}px`}
                border='1px solid #444'
                w={fabricCount * inchCell}
                m='0 auto'
              >
                {Array.from({ length: fabricCount }).map((_, i) => (
                  <Box key={i} border='1px solid #ccc' />
                ))}
              </Box>
              <Text fontSize='sm' mt={1}>{fabricCount} stitches in 1"</Text>
            </Box>
            <Box textAlign='center' mb={4}>
              <Flex justify='center' align='center'>
                <Text transform='rotate(-90deg)' mr={1}>1"</Text>
                <Box>
                  <Text mb={1}>1"</Text>
                  <Box
                    display='grid'
                    gridTemplateColumns={`repeat(${fabricCount}, ${inchCell}px)`}
                    gridTemplateRows={`repeat(${fabricCount}, ${inchCell}px)`}
                    border='1px solid #444'
                    w={fabricCount * inchCell}
                    m='0 auto'
                  >
                    {Array.from({ length: fabricCount * fabricCount }).map((_, i) => (
                      <Box key={i} border='1px solid #ccc' />
                    ))}
                  </Box>
                </Box>
                <Text transform='rotate(90deg)' ml={1}>1"</Text>
              </Flex>
              <Text fontSize='sm' mt={1}>
                {fabricCount} × {fabricCount} = {fabricCount * fabricCount} stitches per square inch
              </Text>
            </Box>
            <Flex justify='flex-end'>
              <Button mr={2} onClick={onCancel}>Cancel</Button>
              <Button colorScheme='teal' onClick={handleNext}>Next</Button>
            </Flex>
          </Box>
        )}

        {step === 1 && (
          <Box>
            <Flex gap={2} mb={2} align='center' flexDir={{ base: 'column', sm: 'row' }}>
              <FormControl isInvalid={widthIn < 2} sx={{
                position: 'relative',
                _focusWithin: { label: { transform: 'scale(0.85) translateY(-1.5rem)' } },
                'input:not(:placeholder-shown) + label, input[data-has-value="true"] + label': {
                  transform: 'scale(0.85) translateY(-1.5rem)'
                },
                label: {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  zIndex: 2,
                  backgroundColor: 'white',
                  pointerEvents: 'none',
                  mx: 3,
                  px: 1,
                  my: 2,
                  transformOrigin: 'left top',
                  transition: 'transform 0.2s ease-in-out'
                }
              }}>
                <InputGroup>
                  <NumberInput
                    value={widthIn}
                    onChange={(_, v) => setWidthIn(v)}
                    min={2}
                    max={10}
                    width='full'
                  >
                    <NumberInputField
                      placeholder=' '
                      data-has-value={widthIn > 0}
                    />
                  </NumberInput>
                  <InputRightAddon>Inches</InputRightAddon>
                </InputGroup>
                <FormLabel>Width</FormLabel>
                <FormErrorMessage>
                  Patterns need to be at least 2 inches by 2 inches
                </FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={heightIn < 2} sx={{
                position: 'relative',
                _focusWithin: { label: { transform: 'scale(0.85) translateY(-1.5rem)' } },
                'input:not(:placeholder-shown) + label, input[data-has-value="true"] + label': {
                  transform: 'scale(0.85) translateY(-1.5rem)'
                },
                label: {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  zIndex: 2,
                  backgroundColor: 'white',
                  pointerEvents: 'none',
                  mx: 3,
                  px: 1,
                  my: 2,
                  transformOrigin: 'left top',
                  transition: 'transform 0.2s ease-in-out'
                }
              }}>
                  <InputGroup>
                    <NumberInput
                      value={heightIn}
                      onChange={(_, v) => setHeightIn(v)}
                      min={2}
                      max={10}
                      width='full'
                    >
                      <NumberInputField
                        placeholder=' '
                        data-has-value={heightIn > 0}
                      />
                    </NumberInput>
                    <InputRightAddon>Inches</InputRightAddon>
                  </InputGroup>
                <FormLabel>Height</FormLabel>
                <FormErrorMessage>
                  Patterns need to be at least 2 inches by 2 inches
                </FormErrorMessage>
              </FormControl>
            </Flex>
            <Text fontSize='sm'>
              Ratio {widthIn}:{heightIn}. Add a 2" border on each side for framing or hooping.
              Total fabric ~ {inchFormatter.format(widthIn + 4)}–{inchFormatter.format(widthIn + 6)} x {inchFormatter.format(heightIn + 4)}–{inchFormatter.format(heightIn + 6)}.
            </Text>
            <Box textAlign='center' mt={4}>
              <Box
                position='relative'
                width={gridWidth * previewScale}
                height={gridHeight * previewScale}
                bg='#f8f8f8'
                display='inline-block'
              >
                <Box
                  pointerEvents='none'
                  position='absolute'
                  left={0}
                  top={0}
                  right={0}
                  bottom={0}
                  style={{
                    backgroundImage: `repeating-linear-gradient(to right, rgba(0,0,0,0.6) 0, rgba(0,0,0,0.6) 2px, transparent 2px, transparent ${inchPx}px), repeating-linear-gradient(to bottom, rgba(0,0,0,0.6) 0, rgba(0,0,0,0.6) 2px, transparent 2px, transparent ${inchPx}px), repeating-linear-gradient(to right, rgba(0,0,0,0.3) 0, rgba(0,0,0,0.3) 1px, transparent 1px, transparent ${previewScale}px), repeating-linear-gradient(to bottom, rgba(0,0,0,0.3) 0, rgba(0,0,0,0.3) 1px, transparent 1px, transparent ${previewScale}px)`,
                    backgroundSize: '100% 100%'
                  }}
                />
              </Box>
            </Box>
            <Flex justify='space-between' mt={4}>
              <Button onClick={prevStep}>Back</Button>
              <Button colorScheme='teal' onClick={handleNext}>Next</Button>
            </Flex>
          </Box>
        )}

        {step === 2 && (
          <Box>
            <Box
              position='relative'
              width={cropWidth}
              height={cropHeight}
              overflow='hidden'
              bg='#fff'
              m='0 auto'
              cursor='move'
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
            >
              <img
                src={img.src}
                alt='crop'
                draggable={false}
                style={{
                  position: 'absolute',
                  left: offset.x,
                  top: offset.y,
                  width: img.width * scale,
                  height: img.height * scale,
                  maxWidth: 'none',
                  userSelect: 'none'
                }}
              />
              <Box
                pointerEvents='none'
                position='absolute'
                left={0}
                top={0}
                right={0}
                bottom={0}
                style={{
                  backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.3) 1px, transparent 1px)`,
                  backgroundSize: `${cellPx}px ${cellPx}px`
                }}
              />
            </Box>
            <Box mt={2} textAlign='center'>
              <Slider min={minScale} max={initialScale * 3} step={0.1} value={scale} onChange={setScale}>
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </Box>
            <Text fontSize='sm' mt={2} textAlign='center'>
              Drag the image so the part inside the grid looks right. Only what you see here will turn into stitches.
            </Text>
            <Flex justify='space-between' mt={4}>
              <Button onClick={prevStep}>Back</Button>
              <Button colorScheme='teal' onClick={handleNext}>Next</Button>
            </Flex>
          </Box>
        )}

        {step === 3 && (
          <Box>
            <Grid
              grid={preview}
              setGrid={() => {}}
              selectedColor={null}
              showGrid={false}
              maxGridPx={containerSize}
            />
            <Box mt={2} px={2}>
              <Slider min={1} max={maxColors} value={reduceTo} onChange={handleReduceChange}>
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
              <Collapsible label={<Text textAlign='center'>{reduceTo} colors</Text>}>
                <UsedColors colors={Object.keys(colorUsage)} usage={colorUsage} />
              </Collapsible>
            </Box>
            <Flex justify='space-between' mt={4}>
              <Button onClick={prevStep}>Back</Button>
              <Button colorScheme='teal' onClick={handleNext}>Next</Button>
            </Flex>
          </Box>
        )}

        {step === 4 && (
          <Box textAlign='center'>
            <Text mb={4}>All set! Use this image?</Text>
            <Button colorScheme='teal' mr={2} onClick={handleFinish}>Use Image</Button>
            <Button onClick={onCancel}>Cancel</Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}
