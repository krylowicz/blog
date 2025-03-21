import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";
import DataLoader from 'dataloader';
import { Request, Response } from 'express';
import { Redis } from 'ioredis';
import { createUpvoteLoader } from './utils/createUpvoteLoader';
import { createUserLoader } from './utils/createUserLoader';

export type MyContext = {
  req: Request;
  redis: Redis;
  res: Response;
  userLoader: ReturnType<typeof createUserLoader>;
  upvoteLoader: ReturnType<typeof createUpvoteLoader>
}