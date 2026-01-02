import { resolveMeta } from "@grepco/pagemeta/runtime";
import { defineMiddleware } from "astro/middleware";
import { rehype } from "rehype";
import rehypeMeta from "rehype-meta";

const isHtmlResponse = (response: Response): boolean => {
    const contentType = response.headers.get("content-type");
    return contentType?.includes("text/html") ?? false;
};

export const onRequest = defineMiddleware(async (context, next) => {
    const response = await next();

    if (!isHtmlResponse(response)) {
        return response;
    }

    const metadata = resolveMeta(context);

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
