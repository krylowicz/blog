import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { useGetAllPostsQuery } from '../generated/graphql';
import React from 'react';
import Layout from '../components/Layout';
import NextLink from 'next/link';
import { Box, Button, Flex, Heading, Link, Stack, Text } from '@chakra-ui/core';
import { useState } from 'react';
import { Vote } from '../components/Vote';

const Index = () => {
  const [variables, setVariables] = useState({ limit: 15, cursor: null as null | string });
  const [{ data, fetching, stale }] = useGetAllPostsQuery({ variables });
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
          { data!.getAllPosts.posts.map(post => !post ? null : (
            <Box key={post.id} p={5} shadow="md" borderWidth="1px">
              <Flex alignItems="center">
                <Vote post={post} />
                <Box width="100%">
                  <Flex alignItems="center" justifyContent="space-between">
                    <NextLink href="/post/[id]" as={`/post/${post.id}`}>
                      <Link>
                        <Heading fontSize="xl" >{post.title}</Heading>
                      </Link>
                    </NextLink>
                    <Text fontSize="s" color="grey">posted by { post.author.username }</Text>
                  </Flex>
                  <Text mt={4}>{post.textSnippet}</Text>
                </Box>
              </Flex>
            </Box>
          )) }
        </Stack>
      )}
      { data && data.getAllPosts.hasMore ? (
      <Flex>
        <Button onClick={() => setVariables({ limit, cursor: data.getAllPosts.posts[data.getAllPosts.posts.length - 1].createdAt })} isLoading={stale} m="auto" my={8}>load more</Button>
      </Flex>
      ) : (
        <Box my={8} />
      )}
    </Layout>
  )  
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);