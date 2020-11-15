import { Entity, Column, BaseEntity, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from './User';
import { Post } from './Post';

@Entity()
export class Upvote extends BaseEntity {
  @Column({ type: 'int' })
  value: number; // either 1 or -1
  
  @PrimaryColumn()
  userId: number;

  @ManyToOne(() => User, user => user.upvotes)
  user: User;

  @PrimaryColumn()
  postId: number;

  @ManyToOne(() => Post, post => post.upvotes, { onDelete: "CASCADE" })
  post: Post;
}