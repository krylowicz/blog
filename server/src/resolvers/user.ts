import { User } from '../entities/User';
import { Ctx, Resolver, Arg, Mutation, Field, Query, ObjectType } from 'type-graphql';
import { MyContext } from '../types';
import argon2 from 'argon2';
import { COOKIE_NAME, FORGOT_PASSWORD_PREFIX } from '../constants';
import { UserInput } from './UserInput';
import { validateRegister } from '../utils/validateRegister';
import { sendEmail } from '../utils/sendEmail';
import { v4 } from 'uuid';
import { getConnection } from 'typeorm';

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

// @InputType()
// class ChangePasswordInput {
//   @Field()
//   token: string;
//   @Field()
//   newPassword: string;
// }

@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse) //type-graphql requires capital letter
  async register(
    @Arg('options') options: UserInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister(options)
    if (errors) return { errors };

    const { email, username, password } = options;

    const hashedPassword = await argon2.hash(password);
    let user;
    try {
      // User.create({}).save()
      const result = await getConnection().createQueryBuilder().insert().into(User).values({
        email,
        username,
        password: hashedPassword,
      }).returning('*').execute();
      user = result.raw[0];
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
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const { email, username, password } = options;
    let user;

    if (email) {
      user = await User.findOne({ where: { email } });
    } else if (username) {
      user = await User.findOne({ where: { username } });
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
  ): Promise<Boolean> {
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

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg('email') email: string,
    @Ctx() { redis }: MyContext,
  ): Promise<Boolean> {
    const user = await User.findOne({ where: { email } }); // where is neccesary bc email is no a primary key
    if (!user) return true;

    const token = v4();
    const text = `<a href="http://localhost:3000/change-password/${token}">reset password</a>`

    await redis.set(FORGOT_PASSWORD_PREFIX + token, user.id, 'ex', 1000 * 60 * 60 * 3); // 3 hours
    await sendEmail(email, text);

    return true;
  }

  @Mutation(() => UserResponse)
  async changePassword(
    // @Arg('options') options: ChangePasswordInput,
    @Arg('token') token: string,
    @Arg('newPassword') newPassword: string,
    @Ctx() { redis, req }: MyContext,
  ): Promise<UserResponse> {
    // const { token, newPassword } = options;

    if (newPassword.length <= 6) {
      return {
        errors: [
          {
            field: "newPassword",
            message: "password length must be greater than 6",
          }
        ]
      }
    };

    const key = FORGOT_PASSWORD_PREFIX + token;
    const userId = await redis.get(key);
    if (!userId) {
      return {
        errors: [
          {
            field: "token",
            message: "token expired",
          }
        ]
      }
    }
    const parsedUserId = parseInt(userId);
    const user = await User.findOne(parsedUserId);

    if (!user) {
      return {
        errors: [
          {
            field: "token",
            message: "user no longer exist",
          }
        ]
      }
    }

    await User.update({ id: parsedUserId }, { password: await argon2.hash(newPassword) })
    await redis.del(key);

    req.session!.userId = user.id; // login in user after password update
    return { user };
  }

  @Query(() => User, { nullable: true })
  async getCurrentUser(
    @Ctx() { req }: MyContext
  ): Promise<User | undefined> {
    if (!req.session!.userId) {
      return undefined;
    }
    return await User.findOne(req.session!.userId);
  }

  @Query(() => [User])
  async getAllUsers(): Promise<User[]> {
    return await User.find();
  }

  @Query(() => User)
  async getUserById(
    @Arg('id') id: number,
  ): Promise<User | undefined> {
    const user = await User.findOne(id);
    if (user) return user;
    return undefined;
  }
}