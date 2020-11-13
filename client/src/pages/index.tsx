import { withUrqlClient } from 'next-urql';
import { NavBar } from '../components/NavBar';
import { createUrqlClient } from '../utils/createUrqlClient';
import { useGetAllPostsQuery } from '../generated/graphql';

const Index = () => {
  const [{ data }] = useGetAllPostsQuery();

  return (
    <>
      <NavBar />
      <div>hello world</div>
      <br />
      {!data ? (
        <div>loading..</div>
      ) : (
        data.getAllposts.map(post => (
          <div key={post.id}>{post.title}</div>
        ))
      )}
    </>
  )  
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);