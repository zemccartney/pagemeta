import type { AstroInlineConfig } from "astro";

import { loadFixture } from "@inox-tools/astro-tests/astroFixture";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

import pagemeta from "../../../../src/index.ts";
import { extractMeta } from "../../../utils/extract-meta.ts";

const fixture = await loadFixture({
    root: "./fixture"
});

const config = {
    integrations: [
        pagemeta({
            defaults: (ctx) => ({
                author: "Function Author",
                description: `Page at ${ctx.url.pathname}`,
                title: `${ctx.routePattern} - ${ctx.site?.hostname ?? "Unknown"}`
            })
        })
    ],
    site: "https://example.com"
} satisfies AstroInlineConfig;

describe("function-defaults / static / dev server", () => {
    let devServer: Awaited<ReturnType<typeof fixture.startDevServer>>;

    beforeAll(async () => {
        devServer = await fixture.startDevServer(config);
    });

    afterAll(async () => {
        await devServer.stop();
    });

    test("applies defaults to page without setPagemeta()", async () => {
        const response = await fixture.fetch("/");
        expect(extractMeta(await response.text())).toEqual([
            { properties: { charSet: "utf-8" }, tag: "meta" },
            { properties: { text: "/ - example.com" }, tag: "title" },
            {
                properties: { content: "Page at /", name: "description" },
                tag: "meta"
            },
            {
                properties: { content: "Function Author", name: "author" },
                tag: "meta"
            }
        ]);
    });

    test("page-level metadata overrides defaults", async () => {
        const response = await fixture.fetch("/override");
        expect(extractMeta(await response.text())).toEqual([
            { properties: { charSet: "utf-8" }, tag: "meta" },
            { properties: { text: "Overridden Title" }, tag: "title" },
            {
                properties: {
                    content: "Overridden description",
                    name: "description"
                },
                tag: "meta"
            },
            {
                properties: { content: "Function Author", name: "author" },
                tag: "meta"
            }
        ]);
    });

    test("metadata: false skips all defaults", async () => {
        const response = await fixture.fetch("/opt-out");
        expect(extractMeta(await response.text())).toEqual([
            { properties: { charSet: "utf-8" }, tag: "meta" }
        ]);
    });

    test("function can access routePattern for dynamic routes", async () => {
        const response = await fixture.fetch("/test-page");
        expect(extractMeta(await response.text())).toEqual([
            { properties: { charSet: "utf-8" }, tag: "meta" },
            { properties: { text: "/[slug] - example.com" }, tag: "title" },
            {
                properties: {
                    content: "Page at /test-page",
                    name: "description"
                },
                tag: "meta"
            },
            {
                properties: { content: "Function Author", name: "author" },
                tag: "meta"
            }
        ]);
    });
});
