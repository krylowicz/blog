import { Box, Flex, Heading, IconButton } from '@chakra-ui/core';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import Layout from '../../components/Layout';
import { useDeletePostMutation, useGetCurrentUserQuery, useGetPostByIdQuery } from '../../generated/graphql';
import { withApollo } from '../../utils/withApollo';

const Post = () => {
  const router = useRouter();
  const id = typeof router.query.id === 'string' ? parseInt(router.query.id) : -1;
  const { data, error, loading } = useGetPostByIdQuery({
    skip: id == -1,
    variables: { 
      id 
    } 
  });
  const [deletePost] = useDeletePostMutation();
  const { data: userData } = useGetCurrentUserQuery();

  const post = data?.getPostById;

  if (error) {
    return (
      <Layout>
        <Box>{error.message}</Box>
      </Layout>
    )
  }

  if (loading) {
    return (
      <Layout>
        <Box>loading...</Box>
      </Layout>
    )
  }

  if (!data?.getPostById) {
    return (
      <Layout>
        <Box>post not found</Box>
      </Layout>
    )
  }

  return (
    <Layout>
      <Heading>{post?.title}</Heading>
      {post?.text}
      { post?.author.id === userData?.getCurrentUser?.id ? (
        <Flex >
          <IconButton aria-label="delete post" icon={ <DeleteIcon /> } onClick={() => {
            deletePost({variables: { id: post?.id as any }, update: (cache) => {
              cache.evict({ id: 'Post:' + id });
              router.back();
            }});
          }} />
          <NextLink href="/post/edit/[id]" as={`/post/edit/${post?.id}`}>
            <IconButton aria-label="edit post" icon={ <EditIcon /> } ml={4} />
          </NextLink>
        </Flex>
      ) : null }
    </Layout>
  )
}

export default withApollo({ ssr: true })(Post);