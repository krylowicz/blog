import { Box, Button, Flex, Heading, Link, Stack, Text } from '@chakra-ui/core';
import NextLink from 'next/link';
import React from 'react';
import Layout from '../components/Layout';
import { Vote } from '../components/Vote';
import { useGetAllPostsQuery } from '../generated/graphql';
import { withApollo } from '../utils/withApollo';

const Index = () => {
  const { data, error, loading, fetchMore, variables } = useGetAllPostsQuery({ 
    variables: {
    limit: 15,
    cursor: null,
    },
    notifyOnNetworkStatusChange: true,
  });

  if (!loading && !data) {
    return (
      <Flex>
        <Box m="auto" my={8}>{error?.message}</Box>
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
      {!data && loading ? (
        <div>loading...</div>
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
        <Button 
          onClick={() => {
            const _variables = { 
              limit: variables?.limit,
              cursor: data.getAllPosts.posts[data.getAllPosts.posts.length - 1].createdAt,
             }

            fetchMore({
              variables: _variables,
              // THIS WAY IS UNSUPORRTED
              
              // updateQuery: (previousValue, { fetchMoreResult }): GetAllPostsQuery => {
              //   if (!fetchMoreResult) {
              //     return previousValue as GetAllPostsQuery;
              //   }
              //   return {
              //     __typename: "Query",
              //     getAllPosts: {
              //       __typename: 'PaginatedPosts',
              //       hasMore: (fetchMoreResult as GetAllPostsQuery).getAllPosts.hasMore,
              //       posts: [
              //         ...(previousValue as GetAllPostsQuery).getAllPosts.posts,
              //         ...(fetchMoreResult as GetAllPostsQuery).getAllPosts.posts,
              //       ],
              //     }
              //   }
              // }
            });
          }}
          isLoading={loading} 
          m="auto" 
          my={8}
        >
          load more
        </Button>
      </Flex>
      ) : (
        <Box my={8} />
      )}
    </Layout>
  )  
};

export default withApollo({ ssr: true })(Index);