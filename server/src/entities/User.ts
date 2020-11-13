import { Entity, PrimaryKey, Property } from '@mikro-orm/core'
import { Field, Int, ObjectType } from 'type-graphql';

@ObjectType()
@Entity()
export class User {
  @Field(() => Int)
  @PrimaryKey()
  id!: number;

  @Field(() => String)
  @Property({ type: 'date'})
  created_at = new Date();

  @Field(() => String)
  @Property({ type: 'date', onUpdate: () => new Date()})
  updated_at = new Date();

  @Field()
  @Property({ type: 'text', unique: true }) 
  email: string;

  @Field()
  @Property({ type: 'text', unique: true }) 
  username: string;

  // without @Field() you can't access password trough grapql query (only a database column)
  @Property({ type: 'text' }) 
  password!: string;
}