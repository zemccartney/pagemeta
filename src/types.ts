import type { APIContext } from "astro";
import type { Options } from "rehype-meta";

export type ResolveMeta = (ctx: Readonly<APIContext>) => Options | undefined;

export type SetPagemeta = (config: SetPagemetaConfig) => void;

export type SetPagemetaConfig = Readonly<{
    ctx: Readonly<APIContext>;
    metadata: false | Readonly<Options>;
}>;
