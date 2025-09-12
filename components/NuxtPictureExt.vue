<template>
	<NuxtPicture
		v-if="src"
		ref="nuxtPicture"
		class="c-nuxt-picture-ext"
		:class="`c-nuxt-picture-ext--${isLoaded ? 'is-loaded' : 'is-loading'}`"
		:style="computedStyle"
		:fit="fit"
		:src="src"
		:alt="alt"
		:sizes="sizes ? useImageSizes(sizes) : null"
		:densities="densities"
		:width="width"
		:height="height"
		:modifiers="{
			ratio: ratio,
			sourceWidth: width,
			sourceHeight: height,
			...modifiers,
		}"
		:img-attrs="computedImgAttrs"
		:quality="quality"
		:loading="loading"
		:decoding="decoding"
		@load="onLoad"
	/>
</template>

<script setup>
// https://image.nuxtjs.org/components/nuxt-picture and https://image.nuxtjs.org/components/nuxt-img

const emit = defineEmits(['load']);
const props = defineProps({
	alt: {
		type: String,
		default: '',
	},
	src: {
		type: String,
	},
	sizes: {
		type: String,
		default: null,
	},
	densities: {
		type: String,
		default: null,
	},
	width: { type: [Number, String], default: undefined },
	height: { type: [Number, String], default: undefined },
	ratio: { type: [Number, String], default: undefined },
	fit: { type: String, default: '' },
	loading: {
		type: String,
		default: 'lazy',
		validator: (value) => ['lazy', 'eager', 'auto'].includes(value),
	},
	decoding: {
		type: String,
		default: 'sync',
		validator: (value) => ['async', 'sync', 'auto'].includes(value),
	},

	imgAttrs: { type: Object, default: () => ({}) },
	quality: { type: [Number, String], default: 100 },
	modifiers: { type: Object, default: () => ({}) },
});

const nuxtPicture = ref(null);
const isLoaded = ref(false);

const urlParams = computed(() => {
	const obj = {};

	if (props.src) {
		const url = new URL(props.src, 'https://example.com');
		const params = new URLSearchParams(url.search);
		params.forEach((value, key) => {
			obj[key] = value;
		});
	}

	return obj;
});

const computedStyle = computed(() => {
	let style = null;

	// Aspect ratio
	if (props.ratio) {
		style = { aspectRatio: props.ratio };
	} else if (props.width && props.height) {
		style = { aspectRatio: `${props.width} / ${props.height}` };
	} else if (urlParams.value.width && urlParams.value.height) {
		style = {
			aspectRatio: `${urlParams.value.width} / ${urlParams.value.height}`,
		};
	}

	// Focus point
	if (
		props.fit &&
		['cover', 'none'].includes(props.fit) &&
		urlParams.value.rxy?.split?.(',').length === 2
	) {
		const [x, y] = urlParams.value.rxy.split(',');
		style = {
			...style,
			'--object-position': `${Math.round(x * 10000) / 100}% ${Math.round(y * 10000) / 100}%`,
		};
	}

	return style;
});

const computedImgAttrs = computed(() => {
	const className = ['c-nuxt-picture-ext__img', props.imgAttrs.class];
	const style = [props.imgAttrs.style];

	if (props.fit && props.fit !== 'crop') {
		style.unshift({ objectFit: props.fit });
	}

	return {
		...JSON.parse(JSON.stringify(props.imgAttrs)),
		class: className.filter(Boolean),
		style: style.filter(Boolean),
	};
});

onMounted(() => {
	const image = nuxtPicture?.value?.$el?.querySelector?.('img');
	image?.complete && onLoad();
});

defineExpose({
	nuxtPicture,
	isLoaded,
});

/* Methods */
function onLoad(e) {
	e = e || new Event('load');
	if (!isLoaded.value) {
		emit('load', e);
		isLoaded.value = true;
	}
}
</script>

<style>
:where(.c-nuxt-picture-ext) {
	display: inline-block;
	width: auto;
	height: auto;
}
:where(.c-nuxt-picture-ext__img) {
	display: block;
	min-width: 100%;
	min-height: 100%;
	max-width: 100%;
	max-height: 100%;
	object-position: var(--object-position);
}
</style>
