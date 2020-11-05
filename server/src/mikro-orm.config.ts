import { MODE } from "./contants";
import { Post } from "./entities/Post";
import { MikroORM } from '@mikro-orm/core';
import path from 'path';

export default {
	migrations: {
    path: path.join(__dirname, './migrations'),
    pattern: /^[\w-]+\d+\.[tj]s$/,
	},
	entities: [Post],
	dbName: 'blog',
	user: 'postgres',
	password: 'postgres',
	type: 'postgresql',
	debug: !MODE,
} as Parameters<typeof MikroORM.init>[0];

// this config was created for using this info from the CLI