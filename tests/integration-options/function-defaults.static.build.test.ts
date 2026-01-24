import type { AstroInlineConfig } from "astro";

import { loadFixture } from "@inox-tools/astro-tests/astroFixture";
import { beforeAll, describe, expect, test } from "vitest";

import pagemeta from "../../src/index.ts";
import { extractMeta } from "../utils/extract-meta.ts";

const fixture = await loadFixture({
    root: "./fixtures/function-defaults"
});

const config = {
    // Default, but setting here to make explicit why our tests check
    // for pathnames with a trailing slash
    build: { format: "directory" },
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

describe("function-defaults / static / build", () => {
    beforeAll(async () => {
        await fixture.build(config);
    });

    test("function receives context and generates defaults", async () => {
        const html = await fixture.readFile("/index.html");
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- test will fail if null
        const headMeta = extractMeta(html!);

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
        const html = await fixture.readFile("/test-page/index.html");
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- test will fail if null
        const headMeta = extractMeta(html!);

        expect(headMeta).toEqual([
            { properties: { charSet: "utf-8" }, tag: "meta" },
            {
                properties: { text: "/[slug] - Example Site" },
                tag: "title"
            },
            {
                properties: {
                    // Note trailing slash, see comment above on config, build.format
                    content: "Page at /test-page/",
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
