import 'reflect-metadata';
import { MikroORM } from '@mikro-orm/core';
import mikroConfig from './mikro-orm.config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql'
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';
import redis from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import { __prod__ } from './contants';
import { MyContext } from './types';
import cors from 'cors';

const main = async () => {
	const orm = await MikroORM.init(mikroConfig);
	await orm.getMigrator().up();

	const app = express();

	const RedisStore = connectRedis(session);
	const redisClient = redis.createClient();	

	app.use(
    cors({
      origin: 'http://localhost:3000',
      credentials: true,
    })
  );
	app.use(
		session({
			name: 'qid',
			store: new RedisStore({ 
				host: 'localhost',
				port: 6379,
				client: redisClient,
				// TODO - change to true later
				disableTouch: true,
			}),
			cookie: {
				maxAge: 1000 * 60 * 60,
				httpOnly: true,
				secure: false,
				sameSite: 'lax', // csrf
			},
			saveUninitialized: false,
			secret: 'sadasdad', // ! => needs a non-null assertion operator
			resave: false,
		})
	);

	const apolloServer = new ApolloServer({
		schema: await buildSchema({
			resolvers: [PostResolver, UserResolver],
			validate: false,
		}),
		context: ({ req, res }): MyContext => ({ em: orm.em, req, res }),
	});

	apolloServer.applyMiddleware({ app, cors: false });

	app.listen(4000, () => {
		console.log('server started on localhost:4000')
	});
}

main().catch(err => console.log(err));