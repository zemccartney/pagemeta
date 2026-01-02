import { loadFixture } from "@inox-tools/astro-tests/astroFixture";
import { afterAll, beforeAll, expect, test } from "vitest";

import { extractMeta } from "./utils/extract-meta.ts";

const fixture = await loadFixture({
    root: "./fixtures/basic"
});

let devServer: Awaited<ReturnType<typeof fixture.startDevServer>>;

beforeAll(async () => {
    devServer = await fixture.startDevServer({});
});

afterAll(async () => {
    await devServer.stop();
});

test("injects title and description meta tags", async () => {
    const response = await fixture.fetch("/");
    const html = await response.text();
    const headMeta = extractMeta(html);

    expect(headMeta).toEqual([
        // eslint-disable-next-line unicorn/text-encoding-identifier-case -- lint rule require - in HTML settings, forbids in non; not a problem worth dealing with
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
