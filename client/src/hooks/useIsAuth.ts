import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useGetCurrentUserQuery } from '../generated/graphql';

export const useIsAuth = () => {
  const router = useRouter();
  const { data, loading } = useGetCurrentUserQuery();
  
  useEffect(() => {
    if (!loading && !data?.getCurrentUser) {
      router.replace('/login?next=' + router.pathname);
    }
  }, [loading, data, router]);
}