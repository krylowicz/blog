import { Box, Button } from '@chakra-ui/core';
import { Formik, Form } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react';
import { InputField } from '../../../components/InputField';
import Layout from '../../../components/Layout';
import { useGetPostByIdQuery, useUpdatePostMutation } from '../../../generated/graphql';
import { createUrqlClient } from '../../../utils/createUrqlClient';

const EditPost = ({}) => {
  const router = useRouter();
  const id = typeof router.query.id === 'string' ? parseInt(router.query.id) : -1;
  const [{ data, fetching }] = useGetPostByIdQuery({
    pause: id == -1,
    variables: { 
      id 
    } 
  });
  const [, updatePost] = useUpdatePostMutation()

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

  const { title, text } = data.getPostById;

  return (
    <Layout variant="small" >
    <Formik 
      initialValues={{ title, text }} 
      onSubmit={async (values) => {
        await updatePost({ id, ...values })
        router.back();
      }}
    >
      {({ isSubmitting }) => (
        <Form>
          <InputField name="title" placeholder="Title" label="Title" />
          <Box mt={4}>
            <InputField isTextArea name="text" placeholder="Text..." label="Text" />
          </Box>
          <Button mt={4} colorScheme="teal" isLoading={isSubmitting} type="submit">edit post</Button>
        </Form>
      )}
    </Formik>
  </Layout>
  )
}

export default withUrqlClient(createUrqlClient)(EditPost);