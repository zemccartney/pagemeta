import { isPageRoute, resolvePagemeta } from "@grepco/astro-pagemeta/runtime";
import { defineMiddleware } from "astro/middleware";
import { rehype } from "rehype";
import rehypeMeta from "rehype-meta";

export const onRequest = defineMiddleware(async (context, next) => {
    const response = await next();

    // Skip non-page routes (server islands, API routes, etc.)
    if (!isPageRoute(context.url.pathname)) {
        return response;
    }

    const metadata = resolvePagemeta(context);

    if (!metadata) {
        return response;
    }

    const html = await response.text();
    const processed = await rehype().use(rehypeMeta, metadata).process(html);

    return new Response(String(processed), {
        headers: response.headers,
        status: response.status
    });
});
