import { User } from '../entities/User';
import { Ctx, Resolver, Arg, Mutation, InputType, Field, Query, ObjectType } from 'type-graphql';
import { MyContext } from '../types';
import argon2 from 'argon2';
import { EntityManager } from '@mikro-orm/postgresql';

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
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const { username, password } = options;

    if (options.username.length <= 2) {
      return {
        errors: [{
          field: "username",
          message: "username length must be greater than 2",
        }]
      };
    };

    if (password.length <= 6) {
      return {
        errors: [{
          field: "password",
          message: "password length must be greater than 6",
        }]
      };
    };

    const hashedPassword = await argon2.hash(password);
    // const user = em.create(User, { username, password: hashedPassword });
    let user;
    try {
      const result = await (em as EntityManager).createQueryBuilder(User).getKnexQuery().insert({
        username,
        password: hashedPassword,
        created_at: new Date(),
        updated_at: new Date(),
      }).returning('*');
      user = result[0];
      // await em.persistAndFlush(user);
    } catch(err) {
      if (err.detail.includes('already exist')) {
        return {
          errors: [{
            field: "username",
            message: "username is already taken",
          }],
        };
      }
    };
    console.log('i am here', user);
    req.session!.userId = user.id;
    return { user };
  }

  @Mutation(() => UserResponse) //type-graphql requires capital letter
  async login(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const { username, password } = options;
    const user = await em.findOne(User, { username })
    if (!user) {
      return {
        errors: [{
          field: "username",
          message: "username doesn't exist",
        }]
      };
    }
    
    const valid = await argon2.verify(user.password, password);
    if (!valid) {
      return {
        errors: [{
          field: "password",
          message: "incorrect password",
        }]
      };
    }

    req.session!.userId = user.id;
    return { user };
  }

  @Query(() => User, { nullable: true })
  async getCurrentUser(
    @Ctx() { em, req }: MyContext
  ): Promise<User | null> {
    if (!req.session!.userId) {
      return null;
    }
    return await em.findOne(User, { id: req.session!.userId });
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