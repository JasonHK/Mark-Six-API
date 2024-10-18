import { AutoRouter, IRequest } from "itty-router";

import * as news from "./news";
import * as schedule from "./schedule";

type RouterArgs = [Env, ExecutionContext];

export const router = AutoRouter<IRequest, RouterArgs>({ base: "/v1" });

router
	.get("/news", news.get)
	.get("/schedule", schedule.get);
