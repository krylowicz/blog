import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useGetCurrentUserQuery } from '../generated/graphql';

export const useIsAuth = () => {
  const router = useRouter();
  const [{ data, fetching }] = useGetCurrentUserQuery();
  
  useEffect(() => {
    if (!fetching && !data?.getCurrentUser) {
      router.replace('/login?next=' + router.pathname);
    }
  }, [fetching, data, router]);
}