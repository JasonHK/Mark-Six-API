import { AutoRouter, IRequest, cors } from "itty-router";

import { name, description, homepage } from "../package.json";
import { router as v1 } from "./v1";

type RouterArgs = [Env, ExecutionContext];

const { preflight, corsify } = cors();

const router = AutoRouter<IRequest, RouterArgs>(
	{
		before: [preflight],
		finally: [corsify],
	});

router
	.get("/", (_, env) => ({ name, description, homepage, version: env.COMMIT_HASH, build: env.BUILD_TIME }))
	.get("/v1/*", v1.fetch);

export default router;
