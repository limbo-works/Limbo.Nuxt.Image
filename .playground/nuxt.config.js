import breakpoints from "./assets/js/breakpoints";

const mappedBreakpoints = {};
for (const [key, value] of Object.entries(breakpoints)) {
  mappedBreakpoints[`<${key}`] = value.px - 1;
}

export default defineNuxtConfig({
  extends: "..",

  image: {
    screens: {
      ...mappedBreakpoints,
    },
  },
});
