import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import { useDeletePostMutation, useGetCurrentUserQuery, useGetPostByIdQuery } from '../../generated/graphql';
import { createUrqlClient } from '../../utils/createUrqlClient';
import Layout from '../../components/Layout';
import React from 'react';
import { Box, Heading, IconButton } from '@chakra-ui/core';
import { DeleteIcon } from '@chakra-ui/icons';

const Post = () => {
  const router = useRouter();
  const id = typeof router.query.id === 'string' ? parseInt(router.query.id) : -1;
  const [{ data, error, fetching }] = useGetPostByIdQuery({
    pause: id == -1,
    variables: { 
      id 
    } 
  });
  const [, deletePost] = useDeletePostMutation();
  const [{ data: userData }] = useGetCurrentUserQuery();

  if (error) {
    return (
      <Layout>
        <Box>{error.message}</Box>
      </Layout>
    )
  }

  if (fetching) {
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
      <Heading>{data.getPostById?.title}</Heading>
      {data.getPostById?.text}
      { data?.getPostById.author.id === userData?.getCurrentUser?.id ? (
        <IconButton aria-label="delete post" icon={ <DeleteIcon /> } onClick={() => {
          deletePost({ id: data.getPostById?.id as any })
        }} />
      ) : null }
    </Layout>
  )
}

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);