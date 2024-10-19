import { z } from "zod";

export type Language = z.infer<typeof Language>;
export const Language = z.enum(["zh-HK", "en-US"]);
