import { Box, Button } from '@chakra-ui/core';
import { Form, Formik } from 'formik';
import { withApollo } from 'next-apollo';
import { useRouter } from 'next/router';
import React from 'react';
import { InputField } from '../components/InputField';
import Layout from '../components/Layout';
import { useCreatePostMutation } from '../generated/graphql';
import { useIsAuth } from '../hooks/useIsAuth';

const CreatePost: React.FC<{}> = ({}) => {
  const router = useRouter();
  const [createPost] = useCreatePostMutation()
  useIsAuth();

  return (
    <Layout variant="small" >
      <Formik 
        initialValues={{ title: "", text: "" }} 
        onSubmit={async (values) => {
          const { errors } = await createPost({ 
            variables: { input: values }, 
            update: (cache) => {
              cache.evict({ fieldName: 'getAllPosts' });
            },
          });
          if (!errors) {
            router.push('/');
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField name="title" placeholder="Title" label="Title" />
            <Box mt={4}>
              <InputField isTextArea name="text" placeholder="Text..." label="Text" />
            </Box>
            <Button mt={4} isLoading={isSubmitting} type="submit">Create post</Button>
          </Form>
        )}
      </Formik>
    </Layout>
  );
}

export default withApollo({ ssr: false })(CreatePost);