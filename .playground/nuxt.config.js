import breakpoints from "./assets/js/breakpoints";

const mappedBreakpoints = {};
for (const [key, value] of Object.entries(breakpoints)) {
  mappedBreakpoints[`>=${key}`] = value.px;
}

export default defineNuxtConfig({
  extends: "..",

  image: {
    screens: {
      ...mappedBreakpoints,
    },
  },

  compatibilityDate: "2024-12-10"
});
