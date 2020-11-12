import React from 'react'
import { Box, Button, Flex, Link } from '@chakra-ui/core';
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
          <Link mr={2}>login</Link>
        </NextLink>
        <NextLink href="/register">
          <Link>register</Link>
        </NextLink>
      </>
    )
  } else { // user logged in
    body = (
      <Flex>        
        <Box mr={2}>{data.getCurrentUser.username}</Box>
        <Button variant="link">logout</Button>
      </Flex>
    )
  }

  return (
    <Flex bg="tan" p={4}>
      <Box ml='auto'>
        {body}
      </Box>
    </Flex>
  );
}