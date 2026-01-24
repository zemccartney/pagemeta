import type { APIContext } from "astro";
import type { Options } from "rehype-meta";

import aikMod from "@inox-tools/aik-mod";
import {
    createResolver,
    defineIntegration,
    withPlugins
} from "astro-integration-kit";
import { z } from "astro/zod";

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

        return withPlugins({
            hooks: {
                "astro:config:setup": ({ addMiddleware, defineModule }) => {
                    defineModule(`${name}/runtime`, {
                        constExports: {
                            resolveMeta: (ctx: APIContext) => {
                                // @ts-expect-error -- index type error, not worrying about it given we're coordinating with our own symbol
                                const pageMeta = ctx.locals[LOCALS_KEY] as
                                    | false // hard opt-out i.e. skip any defaults, don't set any meta tags
                                    | Options
                                    | undefined;

                                const _defaults = options.defaults;

                                if (pageMeta === false) {
                                    return;
                                }

                                const computedDefaults =
                                    typeof _defaults === "function" ?
                                        _defaults(ctx)
                                    :   (_defaults ?? {});

                                if (
                                    !pageMeta &&
                                    Object.keys(computedDefaults).length === 0
                                ) {
                                    return;
                                }

                                return { ...computedDefaults, ...pageMeta };
                            },
                            setPagemeta: ({
                                ctx,
                                metadata
                            }: {
                                ctx: APIContext;
                                metadata: false | Options;
                            }) => {
                                if (metadata === false) {
                                    // @ts-expect-error -- index type error, not worrying about it given we're coordinating with our own symbol
                                    ctx.locals[LOCALS_KEY] = false;
                                    return;
                                }

                                // @ts-expect-error -- index type error, not worrying about it given we're coordinating with our own symbol
                                const pageMeta = ctx.locals[LOCALS_KEY] as
                                    | false // hard opt-out i.e. skip any defaults, don't set any meta tags
                                    | Options
                                    | undefined;

                                // @ts-expect-error -- index type error, not worrying about it given we're coordinating with our own symbol
                                ctx.locals[LOCALS_KEY] = {
                                    ...pageMeta,
                                    ...metadata
                                };
                            }
                        }
                    });

                    addMiddleware({
                        entrypoint: resolve("./middleware.ts"),
                        order: "post"
                    });
                }
            },
            name,
            plugins: [aikMod]
        });
    }
});
