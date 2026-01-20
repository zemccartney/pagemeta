import type { AstroInlineConfig } from "astro";

import { loadFixture } from "@inox-tools/astro-tests/astroFixture";
import { beforeAll, describe, expect, test } from "vitest";

import pagemeta from "../../src/index.ts";
import { extractMeta } from "../utils/extract-meta.ts";

const fixture = await loadFixture({
    root: "./fixtures/static-defaults"
});

const config = {
    integrations: [
        pagemeta({
            defaults: {
                author: "Default Author",
                description: "Default site description",
                title: "Default Title"
            }
        })
    ]
} satisfies AstroInlineConfig;

describe("static-defaults / static / build", () => {
    beforeAll(async () => {
        await fixture.build(config);
    });

    test("applies defaults to page without setPagemeta()", async () => {
        const html = await fixture.readFile("/index.html");
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- test will fail if null
        const headMeta = extractMeta(html!);

        expect(headMeta).toEqual([
            { properties: { charSet: "utf-8" }, tag: "meta" },
            { properties: { text: "Default Title" }, tag: "title" },
            {
                properties: {
                    content: "Default site description",
                    name: "description"
                },
                tag: "meta"
            },
            {
                properties: {
                    content: "Default Author",
                    name: "author"
                },
                tag: "meta"
            }
        ]);
    });

    test("page-level metadata overrides defaults", async () => {
        const html = await fixture.readFile("/override/index.html");
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- test will fail if null
        const headMeta = extractMeta(html!);

        expect(headMeta).toEqual([
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
                properties: {
                    content: "Default Author",
                    name: "author"
                },
                tag: "meta"
            }
        ]);
    });

    test("metadata: false skips all defaults", async () => {
        const html = await fixture.readFile("/opt-out/index.html");
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- test will fail if null
        const headMeta = extractMeta(html!);

        expect(headMeta).toEqual([
            { properties: { charSet: "utf-8" }, tag: "meta" }
        ]);
    });
});
