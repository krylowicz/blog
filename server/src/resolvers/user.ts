import { User } from '../entities/User';
import { Ctx, Resolver, Arg, Mutation, InputType, Field, Query, ObjectType } from 'type-graphql';
import { MyContext } from '../types';
import argon2 from 'argon2';

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;
  @Field()
  password: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse) //type-graphql requires capital letter
  async register(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { em }: MyContext
  ): Promise<UserResponse> {
    if (options.username.length <= 2) {
      return {
        errors: [{
          field: "username",
          message: "username length must be greater than 2",
        }]
      };
    };

    if (options.password.length <= 6) {
      return {
        errors: [{
          field: "password",
          message: "password length must be greater than 6",
        }]
      };
    };

    const password = await argon2.hash(options.password);
    const user = em.create(User, { username: options.username, password });

    try {
      await em.persistAndFlush(user);
    } catch(err) {
        return {
          errors: [{
            field: "username",
            message: "username is already taken",
          }],
        };
    };

    return { user };
  }

  @Mutation(() => UserResponse) //type-graphql requires capital letter
  async login(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { em }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, { username: options.username })
    if (!user) {
      return {
        errors: [{
          field: "username",
          message: "username doesn't exist",
        }]
      };
    }
    
    const valid = await argon2.verify(user.password, options.password);
    if (!valid) {
      return {
        errors: [{
          field: "password",
          message: "incorrect password",
        }]
      };
    }

    return { user };
  }

  @Query(() => [User])
  async getAllUsers(@Ctx() { em }: MyContext): Promise<User[]> {
    return await em.find(User, {});
  }

  @Query(() => User)
  async getUserById(
    @Arg('id') id: number,
    @Ctx() { em }: MyContext
  ): Promise<User | null> {
    const user = await em.findOne(User, { id });
    if (user) return user;
    return null;
  }
}