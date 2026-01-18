import type { TestApp } from "@inox-tools/astro-tests/astroFixture";

import { loadFixture } from "@inox-tools/astro-tests/astroFixture";
import testAdapter from "@inox-tools/astro-tests/testAdapter";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

import { extractMeta } from "./utils/extract-meta.ts";

describe("static", async () => {
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

        test("injects complex metadata with OG and Twitter tags", async () => {
            const response = await fixture.fetch("/complex");
            const html = await response.text();
            const headMeta = extractMeta(html);

            expect(headMeta).toEqual([
                { properties: { charSet: "utf-8" }, tag: "meta" },
                {
                    properties: {
                        text: "Understanding Astro Integrations - Astro Blog"
                    },
                    tag: "title"
                },
                {
                    properties: {
                        content:
                            "A deep dive into how Astro integrations work and how to build your own.",
                        name: "description"
                    },
                    tag: "meta"
                },
                {
                    properties: { content: "Jane Developer", name: "author" },
                    tag: "meta"
                },
                {
                    properties: { content: "article", property: "og:type" },
                    tag: "meta"
                },
                {
                    properties: {
                        content: "Astro Blog",
                        property: "og:site_name"
                    },
                    tag: "meta"
                },
                {
                    properties: {
                        content: "Understanding Astro Integrations",
                        property: "og:title"
                    },
                    tag: "meta"
                },
                {
                    properties: {
                        content:
                            "A deep dive into how Astro integrations work and how to build your own.",
                        property: "og:description"
                    },
                    tag: "meta"
                },
                {
                    properties: {
                        content: "@astrodotbuild",
                        name: "twitter:site"
                    },
                    tag: "meta"
                },
                {
                    properties: {
                        content: "@janedev",
                        name: "twitter:creator"
                    },
                    tag: "meta"
                }
            ]);
        });

        test("multiple setPagemeta calls merge metadata", async () => {
            const response = await fixture.fetch("/override");
            const html = await response.text();
            const headMeta = extractMeta(html);

            expect(headMeta).toEqual([
                { properties: { charSet: "utf-8" }, tag: "meta" },
                {
                    properties: { text: "Overridden Title - Site Name" },
                    tag: "title"
                },
                {
                    properties: {
                        content: "Overridden description",
                        name: "description"
                    },
                    tag: "meta"
                },
                {
                    properties: { content: "Initial Author", name: "author" },
                    tag: "meta"
                }
            ]);
        });
    });

    describe("build", () => {
        beforeAll(async () => {
            await fixture.build({});
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

        test("injects complex metadata with OG and Twitter tags", async () => {
            const html = await fixture.readFile("/complex/index.html");
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- no need to handle null html, test will fail
            const headMeta = extractMeta(html!);

            expect(headMeta).toEqual([
                { properties: { charSet: "utf-8" }, tag: "meta" },
                {
                    properties: {
                        text: "Understanding Astro Integrations - Astro Blog"
                    },
                    tag: "title"
                },
                {
                    properties: {
                        content:
                            "A deep dive into how Astro integrations work and how to build your own.",
                        name: "description"
                    },
                    tag: "meta"
                },
                {
                    properties: { content: "Jane Developer", name: "author" },
                    tag: "meta"
                },
                {
                    properties: { content: "article", property: "og:type" },
                    tag: "meta"
                },
                {
                    properties: {
                        content: "Astro Blog",
                        property: "og:site_name"
                    },
                    tag: "meta"
                },
                {
                    properties: {
                        content: "Understanding Astro Integrations",
                        property: "og:title"
                    },
                    tag: "meta"
                },
                {
                    properties: {
                        content:
                            "A deep dive into how Astro integrations work and how to build your own.",
                        property: "og:description"
                    },
                    tag: "meta"
                },
                {
                    properties: {
                        content: "@astrodotbuild",
                        name: "twitter:site"
                    },
                    tag: "meta"
                },
                {
                    properties: {
                        content: "@janedev",
                        name: "twitter:creator"
                    },
                    tag: "meta"
                }
            ]);
        });

        test("multiple setPagemeta calls merge metadata", async () => {
            const html = await fixture.readFile("/override/index.html");
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- no need to handle null html, test will fail
            const headMeta = extractMeta(html!);

            expect(headMeta).toEqual([
                { properties: { charSet: "utf-8" }, tag: "meta" },
                {
                    properties: { text: "Overridden Title - Site Name" },
                    tag: "title"
                },
                {
                    properties: {
                        content: "Overridden description",
                        name: "description"
                    },
                    tag: "meta"
                },
                {
                    properties: { content: "Initial Author", name: "author" },
                    tag: "meta"
                }
            ]);
        });
    });
});

describe("SSR", async () => {
    const ssrFixture = await loadFixture({
        adapter: testAdapter(),
        output: "server",
        root: "./fixtures/basic"
    });

    describe("dev server", () => {
        let devServer: Awaited<ReturnType<typeof ssrFixture.startDevServer>>;

        beforeAll(async () => {
            devServer = await ssrFixture.startDevServer({});
        });

        afterAll(async () => {
            await devServer.stop();
        });

        test("injects title and description meta tags", async () => {
            const response = await ssrFixture.fetch("/");
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
            const response = await ssrFixture.fetch("/no-meta");
            const html = await response.text();
            const headMeta = extractMeta(html);

            expect(headMeta).toEqual([
                { properties: { charSet: "utf-8" }, tag: "meta" }
            ]);
        });

        test("injects complex metadata with OG and Twitter tags", async () => {
            const response = await ssrFixture.fetch("/complex");
            const html = await response.text();
            const headMeta = extractMeta(html);

            expect(headMeta).toEqual([
                { properties: { charSet: "utf-8" }, tag: "meta" },
                {
                    properties: {
                        text: "Understanding Astro Integrations - Astro Blog"
                    },
                    tag: "title"
                },
                {
                    properties: {
                        content:
                            "A deep dive into how Astro integrations work and how to build your own.",
                        name: "description"
                    },
                    tag: "meta"
                },
                {
                    properties: { content: "Jane Developer", name: "author" },
                    tag: "meta"
                },
                {
                    properties: { content: "article", property: "og:type" },
                    tag: "meta"
                },
                {
                    properties: {
                        content: "Astro Blog",
                        property: "og:site_name"
                    },
                    tag: "meta"
                },
                {
                    properties: {
                        content: "Understanding Astro Integrations",
                        property: "og:title"
                    },
                    tag: "meta"
                },
                {
                    properties: {
                        content:
                            "A deep dive into how Astro integrations work and how to build your own.",
                        property: "og:description"
                    },
                    tag: "meta"
                },
                {
                    properties: {
                        content: "@astrodotbuild",
                        name: "twitter:site"
                    },
                    tag: "meta"
                },
                {
                    properties: {
                        content: "@janedev",
                        name: "twitter:creator"
                    },
                    tag: "meta"
                }
            ]);
        });

        test("multiple setPagemeta calls merge metadata", async () => {
            const response = await ssrFixture.fetch("/override");
            const html = await response.text();
            const headMeta = extractMeta(html);

            expect(headMeta).toEqual([
                { properties: { charSet: "utf-8" }, tag: "meta" },
                {
                    properties: { text: "Overridden Title - Site Name" },
                    tag: "title"
                },
                {
                    properties: {
                        content: "Overridden description",
                        name: "description"
                    },
                    tag: "meta"
                },
                {
                    properties: { content: "Initial Author", name: "author" },
                    tag: "meta"
                }
            ]);
        });
    });

    describe("build", () => {
        let app: TestApp;

        beforeAll(async () => {
            await ssrFixture.build({});
            app = await ssrFixture.loadTestAdapterApp();
        });

        test("injects title and description meta tags", async () => {
            const response = await app.render(
                new Request("https://example.com/")
            );
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
            const response = await app.render(
                new Request("https://example.com/no-meta")
            );
            const html = await response.text();
            const headMeta = extractMeta(html);

            expect(headMeta).toEqual([
                { properties: { charSet: "utf-8" }, tag: "meta" }
            ]);
        });

        test("injects complex metadata with OG and Twitter tags", async () => {
            const response = await app.render(
                new Request("https://example.com/complex")
            );
            const html = await response.text();
            const headMeta = extractMeta(html);

            expect(headMeta).toEqual([
                { properties: { charSet: "utf-8" }, tag: "meta" },
                {
                    properties: {
                        text: "Understanding Astro Integrations - Astro Blog"
                    },
                    tag: "title"
                },
                {
                    properties: {
                        content:
                            "A deep dive into how Astro integrations work and how to build your own.",
                        name: "description"
                    },
                    tag: "meta"
                },
                {
                    properties: { content: "Jane Developer", name: "author" },
                    tag: "meta"
                },
                {
                    properties: { content: "article", property: "og:type" },
                    tag: "meta"
                },
                {
                    properties: {
                        content: "Astro Blog",
                        property: "og:site_name"
                    },
                    tag: "meta"
                },
                {
                    properties: {
                        content: "Understanding Astro Integrations",
                        property: "og:title"
                    },
                    tag: "meta"
                },
                {
                    properties: {
                        content:
                            "A deep dive into how Astro integrations work and how to build your own.",
                        property: "og:description"
                    },
                    tag: "meta"
                },
                {
                    properties: {
                        content: "@astrodotbuild",
                        name: "twitter:site"
                    },
                    tag: "meta"
                },
                {
                    properties: {
                        content: "@janedev",
                        name: "twitter:creator"
                    },
                    tag: "meta"
                }
            ]);
        });

        test("multiple setPagemeta calls merge metadata", async () => {
            const response = await app.render(
                new Request("https://example.com/override")
            );
            const html = await response.text();
            const headMeta = extractMeta(html);

            expect(headMeta).toEqual([
                { properties: { charSet: "utf-8" }, tag: "meta" },
                {
                    properties: { text: "Overridden Title - Site Name" },
                    tag: "title"
                },
                {
                    properties: {
                        content: "Overridden description",
                        name: "description"
                    },
                    tag: "meta"
                },
                {
                    properties: { content: "Initial Author", name: "author" },
                    tag: "meta"
                }
            ]);
        });
    });
});
