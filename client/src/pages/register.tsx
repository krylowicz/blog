import { Box, Button } from '@chakra-ui/core';
import { Form, Formik } from 'formik';
import { useRouter } from 'next/router';
import React from 'react';
import { InputField } from '../components/InputField';
import { Wrapper } from '../components/Wrapper';
import { GetCurrentUserDocument, GetCurrentUserQuery, useRegisterMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { withApollo } from '../utils/withApollo';

interface registerProps {}

const Register: React.FC<registerProps> = ({}) => {
  const router = useRouter();
  const [register] = useRegisterMutation();

  return (
    <Wrapper variant="small">
      <Formik 
        initialValues={{ username: "", password: "", email: "" }} 
        onSubmit={async (values, { setErrors }) => {
          const response = await register({ 
            variables: { options: values },
            update: (cache, { data }) => {
              cache.writeQuery<GetCurrentUserQuery>({
                query: GetCurrentUserDocument,
                data: {
                  __typename: 'Query',
                  getCurrentUser: data?.register.user,
                }
              });
            },
          });

          if (response.data?.register.errors) {
            setErrors(toErrorMap(response.data.register.errors)); // ? isn't requires bc ts will infere that this is defined bc of if statement
          } else if (response.data?.register.user) {
            router.push('/');
          }
        }}
      >      
        {({ isSubmitting }) => (
          <Form>
            <InputField name="email" placeholder="E-mail" label="E-mail" type="email" />
            <Box mt={4}>
              <InputField name="username" placeholder="Username" label="Username" />
            </Box>
            <Box mt={4}>
              <InputField name="password" placeholder="Password" label="Password" type="password" />
            </Box>
            <Button colorScheme="teal" mt={4} isLoading={isSubmitting} type="submit">Register</Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
}

export default withApollo({ ssr: false })(Register);