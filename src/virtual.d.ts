declare module "@grepco/astro-pagemeta/runtime" {
    import type { APIContext } from "astro";
    import type { Options } from "rehype-meta";

    export const setPagemeta: (
        config: Readonly<{
            ctx: APIContext;
            metadata: false | Options;
        }>
    ) => void;

    export const resolveMeta: (
        ctx: Readonly<APIContext>
    ) => Options | undefined;
}
