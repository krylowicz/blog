import React from 'react'
import { Box, Button, Flex, Link } from '@chakra-ui/core';
import NextLink from 'next/link';
import { useGetCurrentUserQuery, useLogoutMutation } from '../generated/graphql';

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
  const [{ data, fetching: registerFetching }] = useGetCurrentUserQuery();
  let body = null;

  if (registerFetching) { // loading 
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
        <Button variant="link" onClick={() => logout()} isLoading={logoutFetching}>logout</Button>
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