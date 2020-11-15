import { Box, Button, Flex, Link } from '@chakra-ui/core';
import { Form, Formik } from 'formik';
import { NextPage } from 'next';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { InputField } from '../../components/InputField';
import { Wrapper } from '../../components/Wrapper';
import { GetCurrentUserDocument, GetCurrentUserQuery, useChangePasswordMutation } from '../../generated/graphql';
import { toErrorMap } from '../../utils/toErrorMap';
import { withApollo } from '../../utils/withApollo';

const ChangePassword: NextPage = () => {
  const router = useRouter();
  const [changePassword] = useChangePasswordMutation();
  const [tokenError, setTokenError] = useState('');

  return (
    <Wrapper variant="small">
    <Formik 
      initialValues={{ newPassword: '' }} 
      onSubmit={async (values, { setErrors }) => {
        const { newPassword } = values;
        const response = await changePassword({ 
          variables: { 
            newPassword, 
            token: typeof router.query.token == 'string' ? router.query.token : "" 
          },
          update: (cache, { data }) => {
            cache.writeQuery<GetCurrentUserQuery>({
              query: GetCurrentUserDocument,
              data: {
                __typename: 'Query',
                getCurrentUser: data?.changePassword.user,
              }
            });
          },
        });

        if (response.data?.changePassword.errors) {
          const errorMap = toErrorMap(response.data.changePassword.errors);

          if ('token' in errorMap) {
            setTokenError(errorMap.token);
          }

          setErrors(errorMap);
        } else if (response.data?.changePassword.user) {
          router.push('/');
        }
      }}
    >
      {({ isSubmitting }) => (
        <Form>
          <InputField name="newPassword" placeholder="New password" label="New password" type="password" />
          { tokenError ? (
            <Flex>
              <Box mr={2} style={{ color: 'red' }}>{tokenError}</Box>
              <NextLink href='/forgot-password'>
                <Link>click here for a new one</Link>
              </NextLink>
            </Flex>
          ) : null }
          <Button mt={4} isLoading={isSubmitting} type="submit">change password</Button>
        </Form>
      )}
    </Formik>
  </Wrapper>
  )
}

export default withApollo({ ssr: true })(ChangePassword);