import 'reflect-metadata';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql'
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';
import Redis from 'ioredis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import { COOKIE_NAME, __prod__ } from './constants';
import { MyContext } from './types';
import cors from 'cors';
import { createConnection } from 'typeorm';
import { Post } from './entities/Post';
import { User } from './entities/User';
import path from 'path';
import { Upvote } from './entities/Upvote';

const main = async () => {
	const connection = await createConnection({
		type: 'postgres',
		database: 'tsblog',
		username: 'postgres',
		password: 'postgres',
		logging: true,
		synchronize: true,
		migrations: [path.join(__dirname, "./migrations/*")],
		entities: [Post, User, Upvote]
	});
	await connection.runMigrations();

	const app = express();

	const RedisStore = connectRedis(session);
	const redis = new Redis();	

	app.use(
    cors({
      origin: 'http://localhost:3000',
      credentials: true,
    })
  );
	app.use(
		session({
			name: COOKIE_NAME,
			store: new RedisStore({ 
				host: 'localhost',
				port: 6379,
				client: redis,
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
		context: ({ req, res }): MyContext => ({ req, res, redis }),
	});

	apolloServer.applyMiddleware({ app, cors: false });

	app.listen(4000, () => {
		console.log('server started on localhost:4000')
	});
}

main().catch(err => console.log(err));