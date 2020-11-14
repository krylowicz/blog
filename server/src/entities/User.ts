import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, BaseEntity, OneToMany } from 'typeorm';
import { Field, Int, ObjectType } from 'type-graphql';
import { Post } from './Post';

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({ unique: true }) 
  email: string;

  @Field()
  @Column({ unique: true }) 
  username: string;

  // without @Field() you can't access password trough grapql query (only a database column)
  @Column() 
  password!: string;

  @OneToMany(() => Post, post => post.author)
  posts: Post[];

  @Field(() => String)
  @CreateDateColumn()
  created_at: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updated_at: Date;
}