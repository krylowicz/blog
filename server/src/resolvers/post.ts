import { Post } from '../entities/Post';
import { Query, Resolver, Arg, Mutation, Field, InputType, Ctx, UseMiddleware, Int, FieldResolver, Root, ObjectType } from 'type-graphql';
import { MyContext } from 'src/types';
import { isAuth } from '../middlewre/isAuth';
import { getConnection } from 'typeorm';
import { Upvote } from '../entities/Upvote';

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

  @Query(() => PaginatedPosts) //type-graphql requires capital letter
  async getAllposts(
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null // when setting nullable to true setting explicit type in neccesary
  ): Promise<PaginatedPosts> {
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = Math.min(50, limit) + 1;
    
    const replacements: any[] = [realLimitPlusOne];

    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
    }

    const posts = await getConnection().query(`
      select p.*,
      json_build_object(
        'id', u.id,
        'username', u.username,
        'email', u.email
      ) author
      from post p 
      inner join public.user u on u.id = p."authorId"
      ${cursor ? `where p."createdAt" < $2` : ''}
      order by p."createdAt" DESC
      limit $1
    `, replacements)

    return { posts: posts.slice(0, realLimit), hasMore: posts.length === realLimitPlusOne }; 
  }

  @Query(() => Post, {nullable: true}) //graphql types
  getPostById(
    @Arg('id') id: number, // number is a typescript type
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
  async updatePost(
    @Arg('id') id: number,
    @Arg('title') title: string,
  ): Promise<Post | null> {
    const post =  await Post.findOne(id);
    
    if (!post) {
      return null;
    }
    if (title != undefined) { 
      post.title = title;
      Post.update({ id }, { title })
    }

    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(@Arg('id') id: number): Promise<boolean> {
    try {
      await Post.delete(id);
    } catch {
      return false;
    }

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

    await getConnection().query(`
      START TRANSACTION;
      insert into upvote ("userId", "postId", value)
      values(${userId}, ${postId}, ${signedValue});
      update post
      set points = points + ${signedValue}
      where id = ${postId};
      COMMIT;
    `);

    return true;
  }
}