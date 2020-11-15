import React from 'react'
import { Formik, Form } from 'formik'; 
import { Wrapper } from '../components/Wrapper';
import { InputField } from '../components/InputField';
import { Box, Button, Flex, Link } from '@chakra-ui/core';
import { useLoginMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { useRouter } from 'next/router';
import { createUrqlClient } from '../utils/createUrqlClient';
import { withUrqlClient } from 'next-urql';
import NextLink from 'next/link';

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
            if (typeof router.query.next == 'string') {
              router.push(router.query.next);
            } else {
              router.push('/');
            }
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField name="usernameOrEmail" placeholder="Username or e-mail" label="Username or e-mail" />
            <Box mt={4}>
              <InputField name="password" placeholder="Password" label="Password" type="password" />
            </Box>
            <Flex alignItems="baseline">
              <Button colorScheme="teal" mt={4} isLoading={isSubmitting} type="submit">Login</Button>
              <NextLink href="/forgot-password">
                <Link ml="auto">forgot password?</Link>
              </NextLink>
            </Flex>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
}

export default withUrqlClient(createUrqlClient)(Login);