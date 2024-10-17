import { AutoRouter, IRequest, cors } from "itty-router";

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
	.get("/news", news.get)
	.get("/schedule", schedule.get);

export default router;
