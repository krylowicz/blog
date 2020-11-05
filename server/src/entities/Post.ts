import { Entity, PrimaryKey, Property } from '@mikro-orm/core'
import { Field, Int, ObjectType } from 'type-graphql';

@ObjectType()
@Entity() //database table
export class Post {

  @Field(() => Int) // exposing to a graphql schema
  @PrimaryKey() // regular columns
  id!: number;

  @Field(() => String)
  @Property({ type: 'date' })
  createdAt = new Date();

  @Field(() => String)
  @Property({ type: 'date', onUpdate: () => new Date() })
  updatedAt = new Date();

  @Field()
  @Property({ type: 'text' }) 
  title!: string;
}