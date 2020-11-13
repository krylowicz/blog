import { UserInput } from 'src/resolvers/UserInput';

export const validateRegister = (options: UserInput) => {
  const { email, username, password } = options;

  if (!email.includes('@')) {
    return [
      {
        field: "email",
        message: "invalid e-mail",
      }
    ];
  }

  if (username.length <= 2) {
    return [
      {
        field: "username",
        message: "username length must be greater than 2",
      }
    ];
  };

  if (username.includes('@')) {
    return [
      {
        field: "username",
        message: "username cannot include an @ sign",
      }
    ];
  };

  if (password.length <= 6) {
    return [
      {
        field: "password",
        message: "password length must be greater than 6",
      }
    ];
  };

  return null;
}