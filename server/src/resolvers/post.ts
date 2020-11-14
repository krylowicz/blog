import { Post } from '../entities/Post';
import { Query, Resolver, Arg, Mutation } from 'type-graphql';

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
  async createPost(
    @Arg('title') title: string,
  ): Promise<Post> {
    return Post.create({ title }).save();
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