import type { APIContext } from "astro";
import type { Options } from "rehype-meta";

export type ResolvePagemeta = (
    ctx: Readonly<APIContext>
) => Options | undefined;

export type SetPagemeta = (
    ctx: Readonly<APIContext>,
    data: false | Readonly<Options>
) => void;
