<template>
	<span
		ref="$el"
		class="c-base-image"
		:class="[
			attrs.class,
		]"
		:style="styles"
	>
		<NuxtPictureExt ref="imageComponent" v-bind="imageBindings" />

		<span v-if="$slots.default" class="c-base-image__slot-content">
			<slot></slot>
		</span>

		<div
			v-if="showBackground"
			class="c-base-image__background"
			:style="backgroundStyles"
		></div>
	</span>
</template>

<script setup>
defineOptions({
	inheritAttrs: false,
});

const props = defineProps({
	alt: {
		type: String,
		default: '',
	},

	// The color can also be a CSS variable, remember to add '--' before the variable name
	// If you need a fallback, also wrap it in a var()
	loadColor: {
		type: String,
		default: 'rgb(var(--theme-colors-background-surface) / 0.5)',
	},

	quality: {
		type: [Number, String],
		default: 80,
	},
	showBackground: {
		type: Boolean,
		default: false,
	},
});
const attrs = useAttrs();

const $el = ref(null);

const fit = computed(() => attrs.fit);
const width = computed(() => attrs.width);

const placeholderStyles = computed(() => {
	if (props.loadColor) {
		let { height, ratio } = attrs;
		if (ratio && fit.value !== 'contain') {
			height = Math.round(width.value / ratio);
		}

		const placeholderSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width.value}" height="${height}" viewBox="0 0 ${width.value} ${height}"><rect width="100%" height="100%" fill="${props.loadColor}" /></svg>`;
		const backgroundImage = `url("data:image/svg+xml,${encodeURIComponent(
			placeholderSvg
		)}")`;

		return fit.value === 'contain'
			? {
				'--base-image-picture-background-image': backgroundImage,
				'--base-image-picture-background-size': fit.value,
				'--base-image-picture-background-position': '50% 50%',
			}
			: {
				'--base-image-picture-background-color': props.loadColor,
				'--base-image-picture-background-size': '100% 100%',
			};
	}
	return null;
});

const imageBindings = computed(() => {
const classes = ['c-base-image__picture'];
const computedAttrs = computed(() => {
  const myAttrs = { ...attrs };
  delete myAttrs.class;
  delete myAttrs.style;
  return myAttrs
});

	if (computedAttrs.value['img-attrs']?.fetchpriority === 'high') {
		classes.push('c-base-image__picture--high-priority');
	}
	const imageBindings = {
		...computedAttrs.value,
		class: classes.filter(Boolean),
		style: placeholderStyles.value,
		alt: props.alt || '',
		quality: props.quality || 80,
		'img-attrs': {
			...(computedAttrs.value['img-attrs'] || {}),
		},
	};

	return imageBindings;
});

const styles = computed(() => {
	const baseStyles = {
		'--base-image-width': '100%',
		'--base-image-background-repeat': 'no-repeat',
		'--base-image-background-position': 'center',
		'--base-image-background-size': 'cover',
	};

	if (width.value) {
		const { height, ratio } = attrs;
		baseStyles['--base-image-width'] = `min(${width.value}px, 100%)`;

		if (ratio) {
			baseStyles['--base-image-aspect-ratio'] = ratio;
		} else if (height) {
			baseStyles['--base-image-aspect-ratio'] =
				`${width.value} / ${height}`;
		}
	}

	return {
		...baseStyles,
		...(attrs?.style || {}),
	};
});

const backgroundStyles = computed(() => {
	if (props.showBackground) {
		const img = useImage();
		const bgImgUrl = img(attrs.src, {
			width: 500,
			height: 281,
			quality: 45,
		});

		return {
			'--base-image-picture-background-image': `url(${bgImgUrl})`,
		};
	}
	return {};
});
</script>

<style lang="postcss">
:where(.c-base-image) {
	position: relative;
	display: block;
	isolation: isolate;

	/* Styles from computed CSS variables */
	width: var(--base-image-width, 100%);
	background-repeat: var(--base-image-background-repeat, no-repeat);
	background-position: var(--base-image-background-position, center);
	background-size: var(--base-image-background-size, cover);
	aspect-ratio: var(--base-image-aspect-ratio, auto);
}

.c-base-image__picture {
	overflow: hidden;
	width: 100%;
	height: 100%;
}
.c-base-image img,
.c-base-image__picture:before {
	transition: opacity 0.3s;
}
.c-base-image__picture--high-priority:before,
.c-base-image .c-base-image__picture--high-priority img {
	transition: opacity 0s;
}
.c-base-image__picture:before {
	content: '';
	position: absolute;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	pointer-events: none;
	opacity: 0;

	/* placeholder */
	background-color: var(--base-image-picture-background-color);
	background-image: var(--base-image-picture-background-image);
	background-size: var(--base-image-picture-background-size);
	background-position: var(--base-image-picture-background-position);
	background-repeat: no-repeat;
}

.c-base-image__slot-content {
	display: block;
	position: absolute;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	pointer-events: none;
}
:where(.c-base-image__slot-content > *) {
	pointer-events: auto;
}

.c-base-image__picture.c-nuxt-picture-ext--is-loading img {
	opacity: 0;
}
.c-base-image__picture.c-nuxt-picture-ext--is-loading:before {
	opacity: 1;
}

.c-base-image__background {
	@apply absolute inset-0 isolate;
	width: 110%;
	height: 110%;
	transform: translate(-4%, -4%);
	filter: blur(4px);
	z-index: -1;
	background-color: var(
		--base-image-picture-background-color,
		var(--bgCurrent)
	);

	&:after {
		@apply absolute inset-0 w-full h-full bg-cover bg-no-repeat bg-center opacity-20;
		content: '';
		background-size: cover;
		background-image: var(--base-image-picture-background-image);
	}
}
</style>
