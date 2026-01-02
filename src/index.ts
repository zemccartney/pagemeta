import {
    addVirtualImports,
    createResolver,
    defineIntegration
} from "astro-integration-kit";

export default defineIntegration({
    name: "@grepco/pagemeta",
    setup: ({ name }) => {
        const { resolve } = createResolver(import.meta.url);

        return {
            hooks: {
                "astro:config:setup": (params) => {
                    addVirtualImports(params, {
                        imports: [
                            {
                                content: `
                                    const LOCALS_KEY = Symbol("pagemeta");

                                    export const setPagemeta = ({ ctx, metadata }) => {
                                        ctx.locals[LOCALS_KEY] = metadata;
                                    };

                                    export const resolveMeta = (ctx) => {
                                        return ctx.locals[LOCALS_KEY];
                                    };
                                `,
                                context: "server",
                                id: `${name}/runtime`
                            }
                        ],
                        name
                    });

                    params.addMiddleware({
                        entrypoint: resolve("./middleware.ts"),
                        order: "post"
                    });
                }
            }
        };
    }
});
