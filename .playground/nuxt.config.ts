import breakpoints from './app/assets/js/breakpoints';

const screens: Record<string, number> = {};
for (const [key, value] of Object.entries(breakpoints)) {
	screens[`>=${key}`] = value.px;
}

export default defineNuxtConfig({
	extends: '..',

	image: {
		screens,
	},

	compatibilityDate: '2024-12-10',
});
