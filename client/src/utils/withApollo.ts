import { createWithApollo } from './createWithApollo';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { PaginatedPosts } from '../generated/graphql';
import { NextPageContext } from 'next';
import { isServer } from './isServer';

const createClient = (ctx: NextPageContext) => new ApolloClient({
  uri: 'http://localhost:4000/graphql',
  credentials: 'include',
  headers: {
    cookie: (isServer() ? ctx.req?.headers.cookie : undefined) || '',
  },
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          getAllPosts: {
            keyArgs: [],
            merge(existing: PaginatedPosts | undefined, incoming: PaginatedPosts): PaginatedPosts {
              return {
                ...incoming,
                posts: [...(existing?.posts || []), ...incoming.posts],
              };
            },
          },
        },
      },
    },
  }),
});

export const withApollo = createWithApollo(createClient);
