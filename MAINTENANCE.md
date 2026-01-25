# Test Maintenance Guide

## Principles (TLDR)

- one fixture per dev / build combination, to avoid file system collision across different rendering modes
- one server per file i.e. only one integration instance per file i.e. only one configuration case
- for all configuration cases tested, verify behavior across ssr and static rendering

## Test File Organization

Tests are organized by **feature category**, then split by **output mode** (static/SSR), with separate fixtures per output mode:

```
tests/
├── basic/
│   ├── static/
│   │   ├── fixture/
│   │   │   └── src/pages/...
│   │   ├── build.test.ts
│   │   └── dev.test.ts
│   └── ssr/
│       ├── fixture/
│       │   ├── astro.config.ts  ← output: "server"
│       │   └── src/pages/...
│       ├── build.test.ts
│       └── dev.test.ts
└── integration-options/
    ├── static-defaults/
    │   ├── static/
    │   │   ├── fixture/...
    │   │   ├── build.test.ts
    │   │   └── dev.test.ts
    │   └── ssr/
    │       ├── fixture/...
    │       ├── build.test.ts
    │       └── dev.test.ts
    └── function-defaults/
        ├── static/...
        └── ssr/...
```

## Why Separate Fixtures Per Output Mode?

### Guaranteed Isolation

Each output mode (static vs SSR) gets its own fixture directory. This ensures:

- No shared `dist/` folder between test modes
- No possibility of build artifacts from one mode affecting another
- No need to understand Astro internals about output directory handling

### What Goes Where

**In the fixture's `astro.config.ts`:**

- `output: "server"` for SSR fixtures (intrinsic to the output mode)
- Static fixtures typically have no config file (uses defaults)

**In the test file's `loadFixture()` call:**

- `adapter: testAdapter()` for SSR tests (test infrastructure, not fixture config)
- `root: "./fixture"` pointing to the local fixture

**In the test file's inline config (passed to `build()`/`startDevServer()`):**

- `integrations: [pagemeta(...)]` - always passed here, never in fixture config
- `site` and other per-test configuration

## Why Integration Config Lives in Test Files

### The Problem: Module Double-Registration

`@inox-tools/aik-mod` maintains a **global module registry**. When a module ID is registered twice, it throws "Module already defined".

This happens when:

1. A fixture's `astro.config.ts` includes the pagemeta integration
2. The test file then calls `build()` or `startDevServer()` with the same integration
3. Both calls trigger `astro:config:setup`, registering the module twice

### The Solution

**Fixture configs must NOT include the pagemeta integration.** The integration is passed only via the inline config:

```typescript
// Fixture astro.config.ts - output mode only, NO integrations
import { defineConfig } from "astro/config";
export default defineConfig({
    output: "server" // For SSR fixtures
});

// Test file
const fixture = await loadFixture({
    adapter: testAdapter(),
    root: "./fixture"
});

const config = {
    integrations: [pagemeta()], // Integration ONLY here
    site: "https://example.com"
} satisfies AstroInlineConfig;

await fixture.build(config);
```

## SSR vs Static Fixture Differences

### SSR Fixtures

- Have `astro.config.ts` with `output: "server"`
- Dynamic routes (`[slug].astro`) do NOT need `getStaticPaths`
- Tests use `testAdapter()` and render via `app.render(new Request(...))`

### Static Fixtures

- Typically have no `astro.config.ts` (default static output)
- Dynamic routes MUST have `getStaticPaths` to generate pages
- Build tests read files via `fixture.readFile("/path/index.html")`

## Test Case Alignment

For consistency, related test suites should cover the same scenarios. For example, both `static-defaults` and `function-defaults` test:

1. Defaults applied to page without `setPagemeta()`
2. Page-level metadata overrides defaults
3. `metadata: false` skips all defaults

This makes it easy to verify both features work the same way.

## Running Tests

```bash
# Run all tests
pnpm test

# Run sequentially (more reliable for dev server tests)
pnpm test -- --no-file-parallelism

# Run specific test file
pnpm test tests/basic/static/dev.test.ts
```

## Known Quirks

### Trailing Slashes in Static Builds

Static builds with `build.format: "directory"` normalize URLs with trailing slashes. If your function defaults use `ctx.url.pathname`:

- Dev server: `/test-page`
- Static build: `/test-page/`

The `function-defaults` static build test uses explicit `build.format: "directory"` to make this behavior predictable.

### Dev Server Race Conditions

Running many dev server tests in parallel can cause socket errors (`ECONNREFUSED`, `other side closed`). Use `--no-file-parallelism` if you see flaky failures.
