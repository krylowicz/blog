import { Entity, PrimaryKey, Property } from '@mikro-orm/core'

@Entity() //database table
export class Post {

  @PrimaryKey() // regular columns
  id!: number;

  @Property({ type: 'date' })
  createdAt = new Date();

  @Property({ type: 'date', onUpdate: () => new Date() })
  updatedAt = new Date();

  @Property({ type: 'text' }) 
  title!: string;
}