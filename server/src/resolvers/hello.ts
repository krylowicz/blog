import { Query, Resolver } from "type-graphql";

@Resolver()
export class HelloResolver {
  @Query(() => String) //type-graphql requires capital letter
  hello() {
    return 'hello world';
  }
}