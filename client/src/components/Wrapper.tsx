import React from 'react'
import { Box } from '@chakra-ui/core';

export type WrapperVariant = 'small' | 'regular';

interface WrapperProps {
  variant?: WrapperVariant;
}

export const Wrapper: React.FC<WrapperProps> = ({children, variant = "regular"}) => {
  return (
    <Box maxW={variant == "regular" ? '800px' : '400px'} w="100%" mt={8} mx="auto">
      {children}
    </Box>
  );
}