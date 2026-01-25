import type { AstroInlineConfig } from "astro";

import { loadFixture } from "@inox-tools/astro-tests/astroFixture";
import { beforeAll, describe, expect, test } from "vitest";

import pagemeta from "../../../../src/index.ts";
import { extractMeta } from "../../../utils/extract-meta.ts";

const fixture = await loadFixture({
    root: "./fixture"
});

const config = {
    build: { format: "directory" },
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

describe("function-defaults / static / build", () => {
    beforeAll(async () => {
        await fixture.build(config);
    });

    test("applies defaults to page without setPagemeta()", async () => {
        const html = await fixture.readFile("/index.html");
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- test will fail if null
        expect(extractMeta(html!)).toEqual([
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
        const html = await fixture.readFile("/override/index.html");
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- test will fail if null
        expect(extractMeta(html!)).toEqual([
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
        const html = await fixture.readFile("/opt-out/index.html");
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- test will fail if null
        expect(extractMeta(html!)).toEqual([
            { properties: { charSet: "utf-8" }, tag: "meta" }
        ]);
    });

    test("function can access routePattern for dynamic routes", async () => {
        const html = await fixture.readFile("/test-page/index.html");
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- test will fail if null
        expect(extractMeta(html!)).toEqual([
            { properties: { charSet: "utf-8" }, tag: "meta" },
            { properties: { text: "/[slug] - example.com" }, tag: "title" },
            {
                properties: {
                    content: "Page at /test-page/",
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
