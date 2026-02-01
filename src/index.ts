import type { APIContext } from "astro";
import type { Options } from "rehype-meta";

import aikMod from "@inox-tools/aik-mod";
import { lazyValue } from "@inox-tools/inline-mod";
import {
    createResolver,
    defineIntegration,
    withPlugins
} from "astro-integration-kit";
import { z } from "astro/zod";

import type { IsPageRoute, ResolvePagemeta, SetPagemeta } from "./types.ts";

const optionsSchema = z
    .object({
        defaults: z
            .union([
                z.custom<Options>(
                    (val) =>
                        typeof val === "object" &&
                        val !== null &&
                        typeof val !== "function"
                ),
                z.custom<(ctx: APIContext) => Options>(
                    (val) => typeof val === "function"
                )
            ])
            .optional()
    })
    .optional()
    .default({});

export default defineIntegration({
    name: "@grepco/astro-pagemeta",
    optionsSchema,
    setup: ({ name, options }) => {
        const { resolve } = createResolver(import.meta.url);
        const LOCALS_KEY = Symbol("pagemeta");
        const pageRoutes = lazyValue<RegExp[]>();

        console.log("INTEGRATION!!!");

        return withPlugins({
            hooks: {
                "astro:config:setup": ({ addMiddleware, defineModule }) => {
                    // Exports here must be kept in sync with runtime-stub.js,
                    // which re-exports each by name from the virtual module.
                    defineModule(`virtual:${name}/runtime`, {
                        constExports: {
                            isPageRoute: ((pathname: string) => {
                                return (pageRoutes as unknown as RegExp[]).some(
                                    (r) => r.test(pathname)
                                );
                            }) satisfies IsPageRoute,
                            resolvePagemeta: ((ctx) => {
                                // @ts-expect-error -- index type error, not worrying about it given we're coordinating with our own symbol
                                const pageMeta = ctx.locals[LOCALS_KEY] as
                                    | false // hard opt-out i.e. skip any defaults, don't set any meta tags
                                    | Options
                                    | undefined;

                                const _defaults = options.defaults;

                                if (pageMeta === false) {
                                    return;
                                }

                                let computedDefaults: Options;
                                if (typeof _defaults === "function") {
                                    const result = _defaults(ctx);
                                    if (
                                        typeof result !== "object" ||
                                        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- handling type-indifferent runtime possibility
                                        result === null
                                    ) {
                                        throw new Error(
                                            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- handling type-indifferent runtime possibility
                                            `[pagemeta] defaults function must return an object, got ${result === null ? "null" : typeof result}`
                                        );
                                    }
                                    computedDefaults = result;
                                } else {
                                    computedDefaults = _defaults ?? {};
                                }

                                if (
                                    !pageMeta &&
                                    Object.keys(computedDefaults).length === 0
                                ) {
                                    return;
                                }

                                return { ...computedDefaults, ...pageMeta };
                            }) satisfies ResolvePagemeta,
                            setPagemeta: ((ctx, data) => {
                                if (data === false) {
                                    // @ts-expect-error -- index type error, not worrying about it given we're coordinating with our own symbol
                                    ctx.locals[LOCALS_KEY] = false; // hard opt-out i.e. skip any defaults, don't set any meta tags
                                    return;
                                }

                                if (
                                    typeof data !== "object" ||
                                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- handling type-indifferent runtime possibility
                                    data === null
                                ) {
                                    throw new Error(
                                        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- handling type-indifferent runtime possibility
                                        `[pagemeta] setPagemeta data must be an object or false, got ${data === null ? "null" : typeof data}`
                                    );
                                }

                                // @ts-expect-error -- index type error, not worrying about it given we're coordinating with our own symbol
                                const pageMeta = ctx.locals[LOCALS_KEY] as
                                    | Options
                                    | undefined;

                                // @ts-expect-error -- index type error, not worrying about it given we're coordinating with our own symbol
                                ctx.locals[LOCALS_KEY] = {
                                    ...pageMeta,
                                    ...data
                                };
                            }) satisfies SetPagemeta
                        }
                    });

                    addMiddleware({
                        entrypoint: resolve("./middleware.ts"),
                        order: "post"
                    });
                },
                "astro:routes:resolved": ({ routes }) => {
                    // @ts-expect-error -- difficulty of telling ts that pageRoutes will resolve to the input value. Unclear why this error occurs, but not worth digging into
                    pageRoutes.resolve(
                        routes
                            .filter(
                                (r) =>
                                    r.type === "page" || r.type === "fallback"
                            )
                            .map((r) => r.patternRegex)
                    );
                }
            },
            name,
            plugins: [aikMod]
        });
    }
});
