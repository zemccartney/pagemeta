import type { AstroInlineConfig } from "astro";
import type { TestApp } from "@inox-tools/astro-tests/astroFixture";

import { loadFixture } from "@inox-tools/astro-tests/astroFixture";
import testAdapter from "@inox-tools/astro-tests/testAdapter";
import { beforeAll, describe, expect, test } from "vitest";

import pagemeta from "../../src/index.ts";
import { extractMeta } from "../utils/extract-meta.ts";

const fixture = await loadFixture({
    adapter: testAdapter(),
    output: "server",
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

describe("static-defaults / SSR / build", () => {
    let app: TestApp;

    beforeAll(async () => {
        await fixture.build(config);
        app = await fixture.loadTestAdapterApp();
    });

    test("applies defaults to page without setPagemeta()", async () => {
        const response = await app.render(
            new Request("https://example.com/")
        );
        const html = await response.text();
        const headMeta = extractMeta(html);

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
        const response = await app.render(
            new Request("https://example.com/override")
        );
        const html = await response.text();
        const headMeta = extractMeta(html);

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
        const response = await app.render(
            new Request("https://example.com/opt-out")
        );
        const html = await response.text();
        const headMeta = extractMeta(html);

        expect(headMeta).toEqual([
            { properties: { charSet: "utf-8" }, tag: "meta" }
        ]);
    });
});
