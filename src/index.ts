import { AutoRouter, IRequest, cors } from "itty-router";

import { name, description, version, homepage } from "../package.json";

import * as news from "./news";
import * as schedule from "./schedule";

type RouterArgs = [Env, ExecutionContext];

const { preflight, corsify } = cors();

const router = AutoRouter<IRequest, RouterArgs>(
	{
		before: [preflight],
		finally: [corsify],
	});

router
	.get("/", (_, env) => ({ name, description, version: env.COMMIT_HASH, build: env.BUILD_TIME, homepage }))
	.get("/news", news.get)
	.get("/schedule", schedule.get);

export default router;
