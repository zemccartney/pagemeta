import { defineConfig } from "astro/config";

import pagemeta from "../../../src/index.ts";

export default defineConfig({
    integrations: [pagemeta()]
});
