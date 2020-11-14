import { cacheExchange } from '@urql/exchange-graphcache';
import { dedupExchange, Exchange, fetchExchange } from 'urql';
import { pipe, tap } from 'wonka';
import { GetCurrentUserDocument, GetCurrentUserQuery, LoginMutation, LogoutMutation, RegisterMutation } from '../generated/graphql';
import { betterUpdateQuery } from './betterUpdateQuery';
import Router from 'next/router';

export const errorExchange: Exchange = ({ forward }) => ops$ => {
  return pipe (
    forward(ops$),
    tap(({ error }) => {
      if (error?.message.includes('not authenticated')) {
        Router.replace('/login');
      }
    })
  );
}


export const createUrqlClient = (ssrExchange: any) => ({
  url: 'http://localhost:4000/graphql',
  fetchOptions: {
    credentials: 'include' as const,
  },
  exchanges: [
    dedupExchange,
    cacheExchange({
      updates: {
        Mutation: {
          login: (_result, args, cache, info) => {
            betterUpdateQuery<LoginMutation, GetCurrentUserQuery>(
              cache,
              { query: GetCurrentUserDocument },
              _result,
              (result, query) => {
                if (result.login.errors) {
                  return query;
                } else {
                  return {
                    getCurrentUser: result.login.user,
                  }
                }
              }
            )
          },
          logout: (_result, args, cache, info) => {
            betterUpdateQuery<LogoutMutation, GetCurrentUserQuery>(
              cache,
              { query: GetCurrentUserDocument },
              _result,
              () => ({ getCurrentUser: null }) 
            )
          },
          register: (_result, args, cache, info) => {
            betterUpdateQuery<RegisterMutation, GetCurrentUserQuery>(
              cache,
              { query: GetCurrentUserDocument },
              _result,
              (result, query) => {
                if (result.register.errors) {
                  return query;
                } else {
                  return {
                    getCurrentUser: result.register.user,
                  }
                }
              }
            )
          }
        }
      }
    }),
    errorExchange,
    ssrExchange,
    fetchExchange,
  ],
});