import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, BaseEntity, ManyToOne, OneToMany } from 'typeorm';
import { Field, Int, ObjectType } from 'type-graphql';
import { User } from './User';
import { Upvote } from './Upvote';

@ObjectType()
@Entity() //database table
export class Post extends BaseEntity {
  @Field(() => Int) // exposing to a graphql schema
  @PrimaryGeneratedColumn() // regular columns
  id!: number;

  @Field()
  @Column() 
  title!: string;

  @Field()
  @Column()
  text!: string;

  @Field()
  @Column({ type: 'int', default: 0 })
  points!: number;

  @Field(() => Int, { nullable: true })
  voteStatus: number | null;

  @Field()
  @Column()
  authorId: number;

  @Field()
  @ManyToOne(() => User, user => user.posts)
  author: User;

  @OneToMany(() => Upvote, upvote => upvote.post)
  upvotes: Upvote[];

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}