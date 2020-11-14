import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { useGetAllPostsQuery } from '../generated/graphql';
import React from 'react';
import Layout from '../components/Layout';
import NextLink from 'next/link';
import { Box, Button, Flex, Heading, Stack, Text } from '@chakra-ui/core';
import { useState } from 'react';

const Index = () => {
  const [variables, setVariables] = useState({ limit: 15, cursor: null as null | string });
  const [{ data, fetching, stale } ] = useGetAllPostsQuery({ variables });
  const { limit } = variables;

  if (!fetching && !data) {
    return (
      <Flex>
        <Box m="auto" my={8}>fetching failed</Box>
      </Flex>
    )
  }

  return (
    <Layout>
      <Flex alignItems="center">
        <Heading>TS Blog</Heading>
        <NextLink href="/create-post">
          <Button ml="auto">create post</Button>
        </NextLink>
      </Flex>
      <br />
      {!data && fetching ? (
        <div>loading..</div>
      ) : (
        <Stack spacing={8}>
          { data!.getAllposts.posts.map(post => (
            <Box key={post.id} p={5} shadow="md" borderWidth="1px">
              <Heading fontSize="xl">{post.title}</Heading>
              <Text mt={4}>{post.textSnippet}</Text>
            </Box>
          ))}
        </Stack>
      )}
      { data && data.getAllposts.hasMore ? (
      <Flex>
        <Button onClick={() => setVariables({ limit, cursor: data.getAllposts.posts[data.getAllposts.posts.length - 1].createdAt })} isLoading={stale} m="auto" my={8}>load more</Button>
      </Flex>
      ) : (
        <Box my={8} />
      )}
    </Layout>
  )  
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);