# Project Context for AI Agents

## What This Is

An Astro integration (`@grepco/pagemeta`) that simplifies setting page metadata (title, description, OG tags). Users call `setPagemeta()` in page frontmatter, and the integration automatically injects the corresponding meta tags into the rendered HTML.

## Architecture

Three main pieces:

1. **Integration** (`src/index.ts`): Creates a virtual module and registers middleware
2. **Virtual Module** (`@grepco/pagemeta/runtime`): Exports `setPagemeta()` and `resolveMeta()`
3. **Middleware** (`src/middleware.ts`): Intercepts HTML responses, extracts metadata via `resolveMeta()`, uses `rehype-meta` to inject tags

### Data Flow

```
Page frontmatter calls setPagemeta({ ctx: Astro, metadata: {...} })
    ↓
setPagemeta() stashes metadata in Astro.locals using a Symbol key
    ↓
Middleware intercepts response, calls resolveMeta(context)
    ↓
resolveMeta() retrieves metadata from locals using the same Symbol
    ↓
rehype-meta processes HTML and injects meta tags
```

The Symbol is defined inside the virtual module and never exported - both `setPagemeta` and `resolveMeta` use it internally, keeping it hidden from consumers.

## Testing

Uses `@inox-tools/astro-tests` which wraps Astro's actual CLI APIs (`astro dev`, `astro build`).

### Fixture Structure

Test fixtures are real Astro projects in `tests/fixtures/`:

```
tests/fixtures/basic/
├── src/pages/index.astro    # Test page that uses setPagemeta()
└── (no package.json needed - optional)
```

The fixture imports the integration via relative path in astro.config (created dynamically or inline).

### Test Pattern

```typescript
import { loadFixture } from "@inox-tools/astro-tests/astroFixture";

const fixture = await loadFixture({ root: "./fixtures/basic" });
let devServer = await fixture.startDevServer({});

// Test
const response = await fixture.fetch("/");
const html = await response.text();

// Cleanup
await devServer.stop();
```

### Test Utility

`tests/utils/extract-meta.ts` - Parses HTML with rehype-parse and extracts meta elements from `<head>` in order. Returns `{ tag, properties }[]` for structured assertions.

Note: rehype-parse uses camelCase for properties (e.g., `charSet` not `charset`).

## Key Files

- `src/index.ts` - Integration entry point, defines virtual module content
- `src/middleware.ts` - Post-render middleware using `defineMiddleware` from `astro/middleware`
- `src/virtual.d.ts` - Type declarations for the virtual module
- `plan/DESIGN.md` - Design document with requirements and test cases
- `plan/TEST_CASES.md` - Checklist of test cases to implement

## Commands

- `pnpm test` - Run vitest (configured to only run `tests/**/*.test.ts`, excludes `plan/`)
- `pnpm lint` - ESLint
- `pnpm fmt` - Prettier

## Important Patterns

1. **Virtual module imports**: Use `@grepco/pagemeta/runtime` (the `id` in `addVirtualImports`)
2. **Middleware typing**: Use `defineMiddleware` from `astro/middleware` (not `astro:middleware` - that's for user-land)
3. **Symbol for locals key**: Keeps implementation detail hidden, shared between setPagemeta and resolveMeta

## Known Issues / TODOs

- **Server islands**: Current `isHtmlResponse` check is insufficient - middleware would incorrectly process HTML fragments. Need to check for `<!doctype` to identify full documents.
- **Integration options**: Not yet implemented (static defaults, function defaults, opt-out)

## Dependencies

- `rehype` + `rehype-meta` - HTML processing and meta tag injection (runtime deps)
- `astro-integration-kit` - Helpers for building Astro integrations
- `@inox-tools/astro-tests` - Test fixture utilities (dev dep)
