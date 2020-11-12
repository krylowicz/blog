import React from 'react'
import { Formik, Form } from 'formik'; 
import { Wrapper } from '../components/Wrapper';
import { InputField } from '../components/InputField';
import { Box, Button } from '@chakra-ui/core';
import { useRegisterMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { useRouter } from 'next/router';

interface registerProps {}

const Register: React.FC<registerProps> = ({}) => {
  const router = useRouter();
  const [, register] = useRegisterMutation();

  return (
    <Wrapper variant="small">
      <Formik 
        initialValues={{ username: "", password: "" }} 
        onSubmit={async (values, { setErrors }) => {
          const response = await register(values);
          console.log(response);
          if (response.data?.register.errors) {
            setErrors(toErrorMap(response.data.register.errors)); // ? isn't requires bc ts will infere that this is defined bc of if statement
          } else if (response.data?.register.user) {
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
            <Button mt={4} variantColor="teal" isLoading={isSubmitting} type="submit">Register</Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
}

export default Register;