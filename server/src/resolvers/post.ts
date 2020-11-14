import { Post } from '../entities/Post';
import { Query, Resolver, Arg, Mutation, Field, InputType, Ctx, UseMiddleware, Int, FieldResolver, Root, ObjectType } from 'type-graphql';
import { MyContext } from 'src/types';
import { isAuth } from '../middlewre/isAuth';
import { getConnection } from 'typeorm';

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
    
    const queryBuilder = getConnection()
    .getRepository(Post)
    .createQueryBuilder("p")
    .orderBy('"createdAt"', "DESC")
    .take(realLimitPlusOne)

    if (cursor) {
      queryBuilder.where('"createdAt" < :cursor', { cursor: new Date(parseInt(cursor)) })
    }

    const posts = await queryBuilder.getMany()
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
}