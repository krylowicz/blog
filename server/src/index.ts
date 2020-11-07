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
require('dotenv').config();

const main = async () => {
	const orm = await MikroORM.init(mikroConfig);
	await orm.getMigrator().up();

	const app = express();

	const RedisStore = connectRedis(session);
	const redisClient = redis.createClient();	

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
			secret: process.env.SECRET!, // need non-null assertion operator
			resave: false,
		})
	);

	const apolloServer = new ApolloServer({
		schema: await buildSchema({
			resolvers: [PostResolver, UserResolver],
			validate: false,
		}),
		context: ({ req, res }): MyContext=> ({ em: orm.em, req, res }),
	});

	apolloServer.applyMiddleware({ app });

	app.listen(4000, () => {
		console.log('server started on localhost:4000')
	});
}

main().catch(err => console.log(err));