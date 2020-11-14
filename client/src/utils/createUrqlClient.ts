import { cacheExchange, Resolver } from '@urql/exchange-graphcache';
import { dedupExchange, Exchange, fetchExchange, stringifyVariables } from 'urql';
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

export const cursorPagination = (): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;
    
    const allFields = cache.inspectFields(entityKey); //get all the queries that are in cache
    const fieldInfos = allFields.filter(info => info.fieldName === fieldName);
    const size = fieldInfos.length;

    if (size === 0) {
      return undefined;
    }

    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
    const isInCache = cache.resolve(cache.resolveFieldByKey(entityKey, fieldKey) as string, 'posts');
    info.partial = !isInCache;

    let hasMore = true;
    const result: string[] = [];
    fieldInfos.forEach(fieldInfo => {
      const key = cache.resolveFieldByKey(entityKey, fieldInfo.fieldKey) as string;
      const data = cache.resolve(key, 'posts') as string[];
      const _hasMore = cache.resolve(key, 'hasMore');
      if (!_hasMore) {
        hasMore = _hasMore as boolean;
      }
      result.push(...data);
    })

    return {
      __typename: "PaginatedPosts",
      hasMore,
      posts: result,
    };
  };
};

export const createUrqlClient = (ssrExchange: any) => ({
  url: 'http://localhost:4000/graphql',
  fetchOptions: {
    credentials: 'include' as const,
  },
  exchanges: [
    dedupExchange,
    cacheExchange({
      keys: {
        PaginatedPosts: () => null,
      },
      resolvers: {
        Query: {
          getAllposts: cursorPagination(),
        }
      },
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