import React from 'react';
import { Box, Flex, Link } from '@chakra-ui/react';

export default function Footer() {
  return (
    <Box as="footer" bg="teal.100" color="teal.800" py={4} mt={8}>
      <Flex maxW="960px" mx="auto" justify="center">
        <Link href="/about" color="teal.800">About</Link>
      </Flex>
    </Box>
  );
}
