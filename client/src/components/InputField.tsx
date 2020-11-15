import { FormControl, FormErrorMessage, FormLabel, Input, Textarea } from '@chakra-ui/core';
import { useField } from 'formik';
import React, { InputHTMLAttributes } from 'react';

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & { 
  label: string;
  name: string;
  isTextArea?: boolean;
};

export const InputField: React.FC<InputFieldProps> = ({ label, isTextArea, size: _, ...props }) => {
  const [field, { error }] = useField(props);
  // let Component: ComponentWithAs<'input', InputProps> | ComponentWithAs<'textarea', TextareaProps> = Input;
  let Component: any = Input;

  if (isTextArea) {
    Component = Textarea;
  }  
  
  return (
    <FormControl isInvalid={!!error}> {/* !! casts string to boolean ('' = false 'error' = true) */}
      <FormLabel html={field.name}>{label}</FormLabel>
      <Component {...field} {...props} id={field.name} placeholder={props.placeholder} />
      {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
    </FormControl>
  );
}