import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { useGetAllPostsQuery } from '../generated/graphql';
import React from 'react';
import Layout from '../components/Layout';
import NextLink from 'next/link';
import { Link } from '@chakra-ui/core';

const Index = () => {
  const [{ data }] = useGetAllPostsQuery({ variables: { limit: 10 } });

  return (
    <Layout>
      <NextLink href="/create-post">
        <Link>create post</Link>
      </NextLink>
      <br />
      {!data ? (
        <div>loading..</div>
      ) : (
        data.getAllposts.map(post => (
          <div key={post.id}>{post.title}</div>
        ))
      )}
    </Layout>
  )  
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);