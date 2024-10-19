import { AutoRouter, IRequest, IttyRouter, Router } from "itty-router";
import { fromIttyRouter } from "chanfana";

// import * as news from "./news";
import { GetSchedule } from "./schedule";

type RouterArgs = [Env, ExecutionContext];

export const router = Router({ base: "/v1" });
export const openApi = fromIttyRouter(router, { base: "/v1" });

openApi
	// .get("/news", news.get)
	.get("/schedule", GetSchedule);
