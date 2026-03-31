// https://nuxt.com/docs/api/nuxt-config
import { createResolver } from "@nuxt/kit";

const { resolve } = createResolver(import.meta.url);

export default defineNuxtConfig({
  modules: ["@nuxt/image"],
  vite: {
    optimizeDeps: {
      include: ["@nuxt/image"],
    },
  },
  image: {
    screens: {
      // Remove the defaults
    },
    provider: "umbracoImageProcessor",
    providers: {
      umbracoImageProcessor: {
        provider: resolve("./providers/umbraco-image-processor"),
      },
    },
  },
});
