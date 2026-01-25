declare module "@grepco/astro-pagemeta/runtime" {
    // https://stackoverflow.com/questions/39040108/import-class-in-definition-file-d-ts/66768386#66768386
    // https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-9.html#import-types
    export const setPagemeta: import("./types.ts").SetPagemeta;
    export const resolveMeta: import("./types.ts").ResolveMeta;
}
