import React from 'react'
import { Box, Button, Flex, Heading, Link } from '@chakra-ui/core';
import NextLink from 'next/link';
import { useGetCurrentUserQuery, useLogoutMutation } from '../generated/graphql';
import { useRouter } from 'next/router';
import { isServer } from '../utils/isServer';
import { useApolloClient } from '@apollo/client';

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  const router = useRouter();
  const [logout, { loading: logoutFetching }] = useLogoutMutation();
  const apollo = useApolloClient();
  const { data, loading: registerFetching } = useGetCurrentUserQuery({
    skip: isServer(),
  });
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
      <Flex position="sticky" top={0} zIndex={2}>        
        <Box mr={2}>{data.getCurrentUser.username}</Box>
        <Button 
          variant="link" 
          onClick={async () => {
            await logout();
            await apollo.resetStore();
            router.reload();
          }} 
          isLoading={logoutFetching}
        >
          logout
        </Button>
      </Flex>
    )
  }

  return (
    <Flex bg="tan" p={4} alignItems="center">
      <Box>
        <NextLink href="/">
          <Link>
            <Heading>TS Blog</Heading>
          </Link>
        </NextLink>
      </Box>
      <Box ml='auto'>
        {body}
      </Box>
    </Flex>
  );
}