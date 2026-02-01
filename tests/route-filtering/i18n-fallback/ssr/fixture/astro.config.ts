import { defineConfig } from "astro/config";

export default defineConfig({
    i18n: {
        defaultLocale: "en",
        fallback: { fr: "en" },
        locales: ["en", "fr"],
        routing: {
            fallbackType: "rewrite",
            prefixDefaultLocale: false
        }
    },
    output: "server"
});
