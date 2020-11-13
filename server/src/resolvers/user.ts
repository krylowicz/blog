import { User } from '../entities/User';
import { Ctx, Resolver, Arg, Mutation, Field, Query, ObjectType } from 'type-graphql';
import { MyContext } from '../types';
import argon2 from 'argon2';
import { EntityManager } from '@mikro-orm/postgresql';
import { COOKIE_NAME } from '../constants';
import { UserInput } from './UserInput';
import { validateRegister } from '../utils/validateRegister';

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
    @Arg('options') options: UserInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister(options)
    if (errors) return { errors };

    const { email, username, password } = options;

    const hashedPassword = await argon2.hash(password);
    let user;
    try {
      const result = await (em as EntityManager).createQueryBuilder(User).getKnexQuery().insert({
        email,
        username,
        password: hashedPassword,
        created_at: new Date(),
        updated_at: new Date(),
      }).returning('*');
      user = result[0];
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

    req.session!.userId = user.id;
    return { user };
  }

  @Mutation(() => UserResponse) //type-graphql requires capital letter
  async login(
    @Arg('options') options: UserInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const { email, username, password } = options;
    let user;

    if (email) {
      user = await em.findOne(User, { email });
    } else if (username) {
      user = await em.findOne(User, { username });
    }
  
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

  @Mutation(() => Boolean)
  logout(
    @Ctx() { req, res }: MyContext
  ) {
    return new Promise(resolve => req.session?.destroy(err => {
      res.clearCookie(COOKIE_NAME);
      if (err) {
        console.log(err);
        resolve(false);
        return;
      }
      
      resolve(true);
    }));
  } 

  // @Mutation(() => Boolean)
  // async forgotPassword(
  //   @Arg('email') email: string,
  //   @Ctx() { req, em }: MyContext,
  // ) {
  //   // const user = await em.findOne(User, { email });
  //   return true;
  // }

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