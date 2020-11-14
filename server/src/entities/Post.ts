import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, BaseEntity, ManyToOne } from 'typeorm';
import { Field, Int, ObjectType } from 'type-graphql';
import { User } from './User';

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

  @Field()
  @Column()
  authorId: number;

  @ManyToOne(() => User, user => user.posts)
  author: User;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}