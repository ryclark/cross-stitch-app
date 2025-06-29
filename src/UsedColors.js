import React from 'react';
import { Flex, Box, Text, Tooltip } from '@chakra-ui/react';
import { DMC_COLORS } from './ColorPalette';

export default function UsedColors({ colors, usage = {}, showSkeins = false }) {
  return (
    <Flex wrap="wrap" gap={2} justify="center">
      {colors.map(hex => {
        const dmc = DMC_COLORS.find(c => c.hex.toLowerCase() === hex.toLowerCase());
        const count = usage[hex] || 0;
        const skeins = showSkeins && count
          ? ` - ${(count / 1800).toFixed(2)} skeins`
          : '';
        const label = dmc
          ? `${dmc.name} (#${dmc.code})${count ? ` - ${count} stitches` : ''}${skeins}`
          : `${hex}${count ? ` - ${count} stitches` : ''}${skeins}`;
        return (
          <Tooltip key={hex} label={label} hasArrow>
            <Box textAlign="center" fontSize="11px">
              <Box
                w="24px"
                h="24px"
                border="1px solid #ccc"
                bg={hex}
                borderRadius="4px"
                m="0 auto"
              />
              <Text mt={1}>{dmc ? dmc.code : ''}</Text>
            </Box>
          </Tooltip>
        );
      })}
    </Flex>
  );
}
