import { Post } from '../entities/Post';
import { Query, Resolver, Arg, Mutation, Field, InputType, Ctx, UseMiddleware } from 'type-graphql';
import { MyContext } from 'src/types';
import { isAuth } from '../middlewre/isAuth';

@InputType()
class PostInput {
  @Field()
  title: string
  @Field()
  text: string
}

@Resolver()
export class PostResolver {
  @Query(() => [Post]) //type-graphql requires capital letter
  getAllposts(): Promise<Post[]> {
    return Post.find();
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
    @Ctx() { req }: MyContext
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