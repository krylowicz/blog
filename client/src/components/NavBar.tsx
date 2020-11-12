import React from 'react'
import { Box, Flex, Link } from '@chakra-ui/core';
import NextLink from 'next/link';
import { useGetCurrentUserQuery } from '../generated/graphql';

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  const [{ data, fetching }] = useGetCurrentUserQuery();
  let body = null;

  if (fetching) { // loading 
    body = null;
  } else if (!data?.getCurrentUser) { // user not logged in
    body = (
      <>
        <NextLink href="/login">
          <Link color="white" mr={2}>login</Link>
        </NextLink>
        <NextLink href="/register">
          <Link color="white">register</Link>
        </NextLink>
      </>
    )
  } else { // user logged in
    body = (
      <Box>
        {data.getCurrentUser.username}
      </Box>
    )
  }

  return (
    <Flex bg="tomato" p={4}>
      <Box ml='auto'>
        {body}
      </Box>
    </Flex>
  );
}