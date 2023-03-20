// https://v3.nuxtjs.org/api/configuration/nuxt.config
import { createResolver } from "@nuxt/kit";

const { resolve } = createResolver(import.meta.url);

export default defineNuxtConfig({
  modules: ["@nuxt/image-edge"],

  image: {
    screens: {},
    provider: "umbracoImageProcessor",
    providers: {
      umbracoImageProcessor: {
        provider: resolve("./providers/umbraco-image-processor"),
      },
    },
  },
});
