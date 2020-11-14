import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";
import { Request, Response } from 'express';
import { Redis } from 'ioredis';

export type MyContext = {
  req: Request;
  redis: Redis;
  res: Response;
}