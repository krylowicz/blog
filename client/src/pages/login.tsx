import React from 'react'
import { Formik, Form } from 'formik'; 
import { Wrapper } from '../components/Wrapper';
import { InputField } from '../components/InputField';
import { Box, Button } from '@chakra-ui/core';
import { useLoginMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { useRouter } from 'next/router';
import { createUrqlClient } from '../utils/createUrqlClient';
import { withUrqlClient } from 'next-urql';

interface loginProps {}

const Login: React.FC<loginProps> = ({}) => {
  const router = useRouter();
  const [, login] = useLoginMutation();

  return (
    <Wrapper variant="small">
      <Formik 
        initialValues={{ email: "", username: "", password: "", usernameOrEmail: "" }} 
        onSubmit={async (values, { setErrors }) => {
          let { email, username, password, usernameOrEmail } = values;          

          if (usernameOrEmail.includes('@')) {
            email = usernameOrEmail;
            username = "";
          } else {
            username = usernameOrEmail;
            email = "";
          }

          const response = await login({ options: { email, username, password } });

          if (response.data?.login.errors) {
            setErrors(toErrorMap(response.data.login.errors)); // ? isn't requires bc ts will infere that this is defined bc of if statement
          } else if (response.data?.login.user) {
            router.push('/');
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField name="usernameOrEmail" placeholder="Username or e-mail" label="Username or e-mail" />
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

export default withUrqlClient(createUrqlClient)(Login);