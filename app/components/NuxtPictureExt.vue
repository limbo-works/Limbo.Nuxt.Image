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
		:sizes="sizes ? useImageSizes(sizes) : undefined"
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
		:preload="preload"
		:loading="loading"
		:decoding="decoding"
		@load="onLoad"
	/>
</template>

<script setup lang="ts">
// https://image.nuxtjs.org/components/nuxt-picture and https://image.nuxtjs.org/components/nuxt-img
import type { ImgHTMLAttributes, StyleValue } from 'vue';
import type { ImageModifiers } from '@nuxt/image';
import type { UmbracoImageModifiers } from '../../providers/umbraco-image-processor';

interface Props {
	alt?: string;
	src?: string;
	sizes?: string;
	densities?: string;
	width?: number | string;
	height?: number | string;
	ratio?: number | string;
	fit?: string;
	preload?: boolean | { fetchPriority: 'auto' | 'high' | 'low' };
	loading?: 'lazy' | 'eager' | 'auto';
	decoding?: 'async' | 'sync' | 'auto';
	imgAttrs?: ImgHTMLAttributes;
	quality?: number | string;
	modifiers?: Partial<
		Omit<ImageModifiers, 'format' | 'quality' | 'background' | 'fit'>
	> &
		UmbracoImageModifiers;
}

const props = withDefaults(defineProps<Props>(), {
	alt: '',
	src: undefined,
	sizes: undefined,
	densities: undefined,
	width: undefined,
	height: undefined,
	ratio: undefined,
	fit: '',
	preload: false,
	loading: 'lazy',
	decoding: 'sync',
	imgAttrs: () => ({}),
	quality: 100,
	modifiers: () => ({}),
});

const emit = defineEmits<{
	load: [event: Event];
}>();

const nuxtPicture = useTemplateRef<{ $el?: Element }>('nuxtPicture');

const isLoaded = ref(false);

const urlParams = computed(() => {
	const params: Record<string, string> = {};

	if (props.src) {
		const url = new URL(props.src, 'https://example.com');
		new URLSearchParams(url.search).forEach((value, key) => {
			params[key] = value;
		});
	}

	return params;
});

const computedStyle = computed(() => {
	let style: Record<string, string> | null = null;

	// Aspect ratio
	if (props.ratio) {
		style = { aspectRatio: String(props.ratio) };
	} else if (props.width && props.height) {
		style = { aspectRatio: `${props.width} / ${props.height}` };
	} else if (urlParams.value.width && urlParams.value.height) {
		style = {
			aspectRatio: `${urlParams.value.width} / ${urlParams.value.height}`,
		};
	}

	// Focus point
	const rxy = urlParams.value.rxy;
	if (
		props.fit &&
		['cover', 'none'].includes(props.fit) &&
		rxy?.split(',').length === 2
	) {
		const [x, y] = rxy.split(',');
		style = {
			...style,
			'--object-position': `${Math.round(Number(x) * 10000) / 100}% ${Math.round(Number(y) * 10000) / 100}%`,
		};
	}

	return style;
});

const computedImgAttrs = computed(() => {
	const className = ['c-nuxt-picture-ext__img', props.imgAttrs.class];
	const style: (StyleValue | Record<string, string> | undefined)[] = [
		props.imgAttrs.style,
	];

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
	const image = nuxtPicture.value?.$el?.querySelector<HTMLImageElement>('img');
	if (image?.complete) {
		onLoad();
	}
});

defineExpose({
	nuxtPicture,
	isLoaded,
});

/* Methods */
function onLoad(event: Event = new Event('load')) {
	if (!isLoaded.value) {
		emit('load', event);
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
