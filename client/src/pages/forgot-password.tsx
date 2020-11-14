import { Box, Button } from '@chakra-ui/core';
import { Formik, Form } from 'formik';
import { withUrqlClient } from 'next-urql';
import React, { useState } from 'react'
import { InputField } from '../components/InputField';
import { Wrapper } from '../components/Wrapper';
import { useForgotPasswordMutation } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';

const ForgotPassword: React.FC<{}> = ({}) => {
  const [complete, setComplete] = useState(false);
  const [, forgotPassword] = useForgotPasswordMutation()

  return (
    <Wrapper variant="small">
    <Formik 
      initialValues={{ email: "" }} 
      onSubmit={async (values) => {
        let { email } = values;          

        await forgotPassword({ email });
        setComplete(true);
      }}
    >
      {({ isSubmitting }) => complete ? (
        <Box>If an account with that email exist, we send you an change password link</Box> 
      ) : (
        <Form>
          <InputField name="email" placeholder="E-mail" label="E-mail" type="email" />
          <Button mt={4} isLoading={isSubmitting} type="submit">Forgot password</Button>
        </Form>
      )}
    </Formik>
  </Wrapper>
  );
}

export default withUrqlClient(createUrqlClient)(ForgotPassword);

