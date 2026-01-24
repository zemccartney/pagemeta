import type { AstroInlineConfig } from "astro";

import { loadFixture } from "@inox-tools/astro-tests/astroFixture";
import testAdapter from "@inox-tools/astro-tests/testAdapter";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

import pagemeta from "../../src/index.ts";
import { extractMeta } from "../utils/extract-meta.ts";

const fixture = await loadFixture({
    adapter: testAdapter(),
    output: "server",
    root: "./fixtures/function-defaults"
});

const config = {
    integrations: [
        pagemeta({
            defaults: (ctx) => ({
                author: "Function Author",
                description: `Page at ${ctx.url.pathname}`,
                title: `${ctx.routePattern || ctx.url.pathname} - Example Site`
            })
        })
    ]
} satisfies AstroInlineConfig;

describe("function-defaults / SSR / dev server", () => {
    let devServer: Awaited<ReturnType<typeof fixture.startDevServer>>;

    beforeAll(async () => {
        devServer = await fixture.startDevServer(config);
    });

    afterAll(async () => {
        await devServer.stop();
    });

    test("function receives context and generates defaults", async () => {
        const response = await fixture.fetch("/");
        const html = await response.text();
        const headMeta = extractMeta(html);

        expect(headMeta).toEqual([
            { properties: { charSet: "utf-8" }, tag: "meta" },
            {
                properties: { text: "/ - Example Site" },
                tag: "title"
            },
            {
                properties: {
                    content: "Page at /",
                    name: "description"
                },
                tag: "meta"
            },
            {
                properties: {
                    content: "Function Author",
                    name: "author"
                },
                tag: "meta"
            }
        ]);
    });

    test("function can access routePattern for dynamic routes", async () => {
        const response = await fixture.fetch("/test-page");
        const html = await response.text();
        const headMeta = extractMeta(html);

        expect(headMeta).toEqual([
            { properties: { charSet: "utf-8" }, tag: "meta" },
            {
                properties: { text: "/[slug] - Example Site" },
                tag: "title"
            },
            {
                properties: {
                    // Note absence of a trailing slash, differs from static test assertion.
                    // build.format doesn't apply, as no HTML files generated within setting used there (build.format: 'directory')
                    content: "Page at /test-page",
                    name: "description"
                },
                tag: "meta"
            },
            {
                properties: {
                    content: "Function Author",
                    name: "author"
                },
                tag: "meta"
            }
        ]);
    });
});
