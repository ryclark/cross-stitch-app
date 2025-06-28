import React from 'react';
import { Box, Flex, Heading, Spacer, Button } from '@chakra-ui/react';

export default function Header() {
  return (
    <Box as="header" position="sticky" top="0" zIndex="docked" bg="gray.100" boxShadow="sm">
      <Flex align="center" maxW="960px" mx="auto" p={2}>
        <Box boxSize="32px" bg="gray.300" borderRadius="md" mr={3} />
        <Heading size="md">SnapStitch</Heading>
        <Spacer />
        <Button colorScheme="teal" size="sm">Log In</Button>
      </Flex>
    </Box>
  );
}
