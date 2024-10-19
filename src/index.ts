import { AutoRouter, Router, IRequest, cors } from "itty-router";
import { fromIttyRouter } from "chanfana";

import { name, description, homepage } from "../package.json";
import { openApi as v1 } from "./v1";

type RouterArgs = [Env, ExecutionContext];

const { preflight, corsify } = cors();

const router = AutoRouter<IRequest, RouterArgs>(
    {
        before: [preflight],
        finally: [corsify],
    });

const openApi = fromIttyRouter(router,
    {
        schema: {
            info: {
                title: "A",
                version: "1.0",
            },
        },
    });

router.get("/", async (_, env) => ({ name, description, homepage, version: env.COMMIT_HASH, build: env.BUILD_TIME }));
openApi.all("/v1/*", v1);

export default openApi;
