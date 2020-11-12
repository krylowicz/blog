import React from 'react'
import { Formik, Form } from 'formik'; 
import { Wrapper } from '../components/Wrapper';
import { InputField } from '../components/InputField';
import { Box, Button } from '@chakra-ui/core';
import { useLoginMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { useRouter } from 'next/router';

interface loginProps {}

const Login: React.FC<loginProps> = ({}) => {
  const router = useRouter();
  const [_, login] = useLoginMutation();

  return (
    <Wrapper variant="small">
      <Formik 
        initialValues={{ username: "", password: "" }} 
        onSubmit={async (values, { setErrors }) => {
          const response = await login({ options: values });
          if (response.data?.login.errors) {
            setErrors(toErrorMap(response.data.login.errors)); // ? isn't requires bc ts will infere that this is defined bc of if statement
          } else if (response.data?.login.user) {
            router.push('/');
          }
        }}
      >      
        {({ isSubmitting }) => (
          <Form>
            <InputField name="username" placeholder="Username" label="Username" />
            <Box mt={4}>
              <InputField name="password" placeholder="Password" label="Password" type="password" />
            </Box>
            <Button mt={4} variantColor="teal" isLoading={isSubmitting} type="submit">Login</Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
}

export default Login;