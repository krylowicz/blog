import { Box, Button } from '@chakra-ui/core';
import { Form, Formik } from 'formik';
import React, { useState } from 'react';
import { InputField } from '../components/InputField';
import { Wrapper } from '../components/Wrapper';
import { useForgotPasswordMutation } from '../generated/graphql';
import { withApollo } from '../utils/withApollo';

const ForgotPassword: React.FC<{}> = ({}) => {
  const [complete, setComplete] = useState(false);
  const [forgotPassword] = useForgotPasswordMutation();

  return (
    <Wrapper variant="small">
    <Formik 
      initialValues={{ email: "" }} 
      onSubmit={async (values) => {
        let { email } = values;          

        await forgotPassword({ variables: { email }});
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

export default withApollo({ ssr: false })(ForgotPassword);

