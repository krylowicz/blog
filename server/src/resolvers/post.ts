import { Post } from '../entities/Post';
import { Query, Resolver, Arg, Mutation, Field, InputType, Ctx, UseMiddleware, Int, FieldResolver, Root, ObjectType } from 'type-graphql';
import { MyContext } from 'src/types';
import { isAuth } from '../middlewre/isAuth';
import { getConnection } from 'typeorm';
import { Upvote } from '../entities/Upvote';
import { User } from '../entities/User';

@InputType()
class PostInput {
  @Field()
  title: string
  @Field()
  text: string
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[]
  @Field()
  hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => String)
  textSnippet(@Root() root: Post) {
    return root.text.slice(0, 50);
  }

  @FieldResolver(() => User)
  author(
    @Root() post: Post,
    @Ctx() { userLoader }: MyContext
  ) {
    return userLoader.load(post.authorId);
  }

  @FieldResolver(() => Int, { nullable: true })
  async getVoteStatus (
    @Root() post: Post,
    @Ctx() { req, upvoteLoader }: MyContext
  ) {
    const { userId } = req.session!

    if (!userId) {
      return null;
    }

    const upvote = await upvoteLoader.load({ postId: post.id, userId });

    return upvote ? upvote.value : null;
  }

  @Query(() => PaginatedPosts) //type-graphql requires capital letter
  async getAllPosts(
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null, // when setting nullable to true setting explicit type in neccesary
  ): Promise<PaginatedPosts> {
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = Math.min(50, limit) + 1;
    
    const replacements: any[] = [realLimitPlusOne];

    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
    }

    const posts = await getConnection().query(`
      select p.*
      from post p 
      ${cursor ? `where p."createdAt" < $2` : ''}
      order by p."createdAt" DESC
      limit $1
    `, replacements)

    return { posts: posts.slice(0, realLimit), hasMore: posts.length === realLimitPlusOne }; 
  }

  @Query(() => Post, {nullable: true}) //graphql types
  getPostById(
    @Arg('id', () => Int) id: number, // number is a typescript type
  ): Promise<Post | undefined> {
    return Post.findOne(id);
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg('input') input: PostInput,
    @Ctx() { req }: MyContext,
  ): Promise<Post> {
    return Post.create({ ...input, authorId: req.session!.userId }).save();
  }

  @Mutation(() => Post, { nullable: true })
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg('id', () => Int) id: number,
    @Arg('title') title: string,
    @Arg('text') text: string,
    @Ctx() { req }: MyContext,
  ): Promise<Post | null> { 
    const { userId } = req.session!;

    const result = await getConnection()
    .createQueryBuilder()
    .update(Post)
    .set({ title, text })
    .where('id = :id and "authorId" = :authorId', { id, authorId: userId })
    .returning('*')
    .execute();

    return result.raw[0];
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deletePost(
    @Arg('id', () => Int) id: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    const { userId } = req.session!;
  
    await Post.delete({ id, authorId: userId });
    return true;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg('postId', () => Int) postId: number,
    @Arg('value', () => Int) value: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    const { userId } = req.session!;
    const isUpvote = value !== -1;
    const signedValue = isUpvote ? 1 : -1;

    const upvote = await Upvote.findOne({ where: { postId, userId } });

     if (upvote && upvote.value !== signedValue) { //user has voted on the post before and they are changing thier vote
       await getConnection().transaction(async tm => {
        await tm.query(`
          update upvote
          set value = $1
          where "postId" = $2 and "userId" = $3
        `, [signedValue, postId, userId]);

        await tm.query(`
          update post
          set points = points + $1
          where id = $2
        `, [2 * signedValue, postId]);
       })
     } else if (!upvote) { // has never voted before
      await getConnection().transaction(async tm => {
        await tm.query(`
          insert into upvote ("userId", "postId", value)
          values($1, $2, $3);
        `, [userId, postId, signedValue]);

        await tm.query(`
          update post
          set points = points + $1
          where id = $2
        `, [signedValue, postId]);
      });
     }

    return true;
  }
}