import { loadFixture } from "@inox-tools/astro-tests/astroFixture";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

import { extractMeta } from "./utils/extract-meta.ts";

const fixture = await loadFixture({
    root: "./fixtures/basic"
});

describe("dev server", () => {
    let devServer: Awaited<ReturnType<typeof fixture.startDevServer>>;

    beforeAll(async () => {
        devServer = await fixture.startDevServer({});
    });

    afterAll(async () => {
        await devServer.stop();
        await fixture.clean();
    });

    test("injects title and description meta tags", async () => {
        const response = await fixture.fetch("/");
        const html = await response.text();
        const headMeta = extractMeta(html);

        expect(headMeta).toEqual([
            { properties: { charSet: "utf-8" }, tag: "meta" },
            { properties: { text: "Test Page Title" }, tag: "title" },
            {
                properties: {
                    content: "Test page description",
                    name: "description"
                },
                tag: "meta"
            }
        ]);
    });

    test("page without setPagemeta() passes through unmodified", async () => {
        const response = await fixture.fetch("/no-meta");
        const html = await response.text();
        const headMeta = extractMeta(html);

        expect(headMeta).toEqual([
            { properties: { charSet: "utf-8" }, tag: "meta" }
        ]);
    });
});

describe("static build", () => {
    beforeAll(async () => {
        await fixture.build({});
    });

    afterAll(async () => {
        await fixture.clean();
    });

    test("injects title and description meta tags", async () => {
        const html = await fixture.readFile("/index.html");
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- no need to handle null html, test will fail
        const headMeta = extractMeta(html!);

        expect(headMeta).toEqual([
            { properties: { charSet: "utf-8" }, tag: "meta" },
            { properties: { text: "Test Page Title" }, tag: "title" },
            {
                properties: {
                    content: "Test page description",
                    name: "description"
                },
                tag: "meta"
            }
        ]);
    });

    test("page without setPagemeta() passes through unmodified", async () => {
        const html = await fixture.readFile("/no-meta/index.html");
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- no need to handle null html, test will fail
        const headMeta = extractMeta(html!);

        expect(headMeta).toEqual([
            { properties: { charSet: "utf-8" }, tag: "meta" }
        ]);
    });
});
