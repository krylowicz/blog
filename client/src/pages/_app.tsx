import { ThemeProvider, CSSReset } from '@chakra-ui/core'
import { cacheExchange, Cache, QueryInput } from '@urql/exchange-graphcache';
import { Provider, createClient, fetchExchange, dedupExchange } from 'urql';
import { GetCurrentUserDocument, GetCurrentUserQuery, LoginMutation, LogoutMutation, RegisterMutation } from '../generated/graphql';
import theme from '../theme';

function betterUpdateQuery<Result, Query>(
  cache: Cache,
  qi: QueryInput,
  result: any,
  fn: (r: Result, q: Query) => Query
) {
  return cache.updateQuery(qi, data => fn(result, data as any) as any);
}

const client = createClient({ 
  url: 'http://localhost:4000/graphql',
  fetchOptions: {
    credentials: 'include',
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
    fetchExchange,
  ],
});

function MyApp({ Component, pageProps }: any) {
  return (
    <Provider value={client}>
      <ThemeProvider theme={theme}>
        <CSSReset />
        <Component {...pageProps} />
      </ThemeProvider>
    </Provider>
  )
}

export default MyApp
