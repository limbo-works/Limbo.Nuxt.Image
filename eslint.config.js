import tseslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';

export default tseslint.config(
	{
		ignores: ['**/node_modules/**', '**/.nuxt/**', '**/.output/**', '**/dist/**'],
	},

	{
		files: ['**/*.ts'],
		extends: [tseslint.configs.recommended],
	},

	{
		files: ['**/*.vue'],
		extends: [pluginVue.configs['flat/recommended'], tseslint.configs.recommended],
		/*
		  Both extends set a parser and the later one wins, so vue-eslint-parser
		  has to be reinstated here or the TS parser reads the whole SFC as TS.
		*/
		languageOptions: {
			parser: vueParser,
			parserOptions: {
				parser: tseslint.parser,
			},
		},
		rules: {
			'vue/html-indent': ['warn', 'tab'],
			'vue/multi-word-component-names': 'off',
			'vue/require-default-prop': 'off',
		},
	}
);
