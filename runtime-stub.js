/*
    Stub file to allow using @grepco/astro-pagemeta/runtime as the public module specifier,
    despite that module being a virtual module.

    package.json#exports, required for exposing our integration, breaks this approach
    as it needs to refer to a physical file and is NOT overridden by vite's virtual
    module resolution

    So, when the user's astro code tries to import @grepco/astro-pagemeta/runtime

    1. this file is resolved per package.json#exports
    2. we dynamically import the virtual module, available only in a astro-built environment (vite-backed)

    If you import @grepco/astro-pagemeta/runtime outside of astro, we crash with a hopefully informative error message
*/
let mod;
try {
    mod = await import("virtual:@grepco/astro-pagemeta/runtime");
} catch (error) {
    if (error.code === "ERR_UNSUPPORTED_ESM_URL_SCHEME") {
        throw new Error(
            "The @grepco/astro-pagemeta/runtime module cannot be used outside an Astro environment"
        );
    } else {
        throw error;
    }
}

export const resolveMeta = mod.resolveMeta;
export const setPagemeta = mod.setPagemeta;
