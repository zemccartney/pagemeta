/**
 * Error Handling Tests: Defaults Function Edge Cases
 *
 * Tests runtime validation that defaults function returns an object.
 * We only validate the type is object, not the contents - rehype-meta
 * ignores unknown keys and coerces values as needed.
 *
 * BEHAVIOR SUMMARY:
 *
 * | Input                           | Behavior       | Why                              |
 * |---------------------------------|----------------|----------------------------------|
 * | null                            | 500 error      | Not an object                    |
 * | undefined                       | 500 error      | Not an object                    |
 * | string                          | 500 error      | Not an object                    |
 * | number                          | 500 error      | Not an object                    |
 * | false                           | 500 error      | Not an object                    |
 * | empty object {}                 | Passes         | Valid object                     |
 * | { title: 123 }                  | Passes         | Valid object, rehype coerces     |
 * | { unknownProp: 'x' }            | Passes         | Valid object, rehype ignores     |
 * | throws Error                    | 500 error      | Exception propagates             |
 */

import type { AstroInlineConfig } from "astro";

import { loadFixture } from "@inox-tools/astro-tests/astroFixture";
import { describe, expect, test } from "vitest";

import pagemeta from "../../src/index.ts";
import { extractMeta } from "../utils/extract-meta.ts";

const fixture = await loadFixture({
    root: "./fixture"
});

describe("defaults function edge cases", () => {
    describe("non-object returns → 500 error", () => {
        test("returning null", async () => {
            const config = {
                integrations: [
                    pagemeta({
                        // @ts-expect-error -- testing invalid return type
                        // eslint-disable-next-line unicorn/no-null -- simulating random user input
                        defaults: () => null
                    })
                ]
            } satisfies AstroInlineConfig;

            const devServer = await fixture.startDevServer(config);
            try {
                const response = await fixture.fetch("/");
                expect(response.status).toBe(500);
            } finally {
                await devServer.stop();
            }
        });

        test("returning undefined", async () => {
            const config = {
                integrations: [
                    pagemeta({
                        // @ts-expect-error -- testing invalid return type
                        // eslint-disable-next-line @typescript-eslint/no-empty-function -- simulating random user input
                        defaults: () => {}
                    })
                ]
            } satisfies AstroInlineConfig;

            const devServer = await fixture.startDevServer(config);
            try {
                const response = await fixture.fetch("/");
                expect(response.status).toBe(500);
            } finally {
                await devServer.stop();
            }
        });

        test("returning a string", async () => {
            const config = {
                integrations: [
                    pagemeta({
                        // @ts-expect-error -- testing invalid return type
                        defaults: () => "invalid string"
                    })
                ]
            } satisfies AstroInlineConfig;

            const devServer = await fixture.startDevServer(config);
            try {
                const response = await fixture.fetch("/");
                expect(response.status).toBe(500);
            } finally {
                await devServer.stop();
            }
        });

        test("returning a number", async () => {
            const config = {
                integrations: [
                    pagemeta({
                        // @ts-expect-error -- testing invalid return type
                        defaults: () => 42
                    })
                ]
            } satisfies AstroInlineConfig;

            const devServer = await fixture.startDevServer(config);
            try {
                const response = await fixture.fetch("/");
                expect(response.status).toBe(500);
            } finally {
                await devServer.stop();
            }
        });

        test("returning false", async () => {
            const config = {
                integrations: [
                    pagemeta({
                        // @ts-expect-error -- testing invalid return type
                        defaults: () => false
                    })
                ]
            } satisfies AstroInlineConfig;

            const devServer = await fixture.startDevServer(config);
            try {
                const response = await fixture.fetch("/");
                expect(response.status).toBe(500);
            } finally {
                await devServer.stop();
            }
        });

        test("function throws", async () => {
            const config = {
                integrations: [
                    pagemeta({
                        defaults: () => {
                            throw new Error("Intentional error in defaults");
                        }
                    })
                ]
            } satisfies AstroInlineConfig;

            const devServer = await fixture.startDevServer(config);
            try {
                const response = await fixture.fetch("/");
                expect(response.status).toBe(500);
            } finally {
                await devServer.stop();
            }
        });
    });

    describe("valid objects → pass through", () => {
        test("empty object", async () => {
            const config = {
                integrations: [
                    pagemeta({
                        defaults: () => ({})
                    })
                ]
            } satisfies AstroInlineConfig;

            const devServer = await fixture.startDevServer(config);
            try {
                const response = await fixture.fetch("/");
                expect(response.status).toBe(200);
                const html = await response.text();
                const meta = extractMeta(html);
                expect(meta).toEqual([
                    { properties: { charSet: "utf-8" }, tag: "meta" }
                ]);
            } finally {
                await devServer.stop();
            }
        });

        // rehype-meta coerces number to string
        test("title as number → coerced to string", async () => {
            const config = {
                integrations: [
                    pagemeta({
                        // @ts-expect-error -- simulating random user input
                        defaults: () => ({
                            title: 123
                        })
                    })
                ]
            } satisfies AstroInlineConfig;

            const devServer = await fixture.startDevServer(config);
            try {
                const response = await fixture.fetch("/");
                expect(response.status).toBe(200);
                const html = await response.text();
                const meta = extractMeta(html);
                expect(meta).toEqual([
                    { properties: { charSet: "utf-8" }, tag: "meta" },
                    { properties: { text: "123" }, tag: "title" }
                ]);
            } finally {
                await devServer.stop();
            }
        });

        // rehype-meta ignores unknown properties
        test("unknown properties → ignored by rehype-meta", async () => {
            const config = {
                integrations: [
                    pagemeta({
                        defaults: () => ({
                            title: "Valid Title",
                            unknownMeta: "value"
                        })
                    })
                ]
            } satisfies AstroInlineConfig;

            const devServer = await fixture.startDevServer(config);
            try {
                const response = await fixture.fetch("/");
                expect(response.status).toBe(200);
                const html = await response.text();
                const meta = extractMeta(html);
                // Unknown props ignored, title works
                expect(meta).toEqual([
                    { properties: { charSet: "utf-8" }, tag: "meta" },
                    { properties: { text: "Valid Title" }, tag: "title" }
                ]);
            } finally {
                await devServer.stop();
            }
        });
    });
});
