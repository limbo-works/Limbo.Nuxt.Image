<template>
	<NuxtPicture
		v-if="src"
    ref="NuxtPicture"
		class="c-nuxt-picture-ext"
		:class="`c-nuxt-picture-ext--${isLoaded ? 'is-loaded' : 'is-loading'}`"
		:style="computedStyle"
		:fit="fit"
		:src="src"
		:alt="alt"
		:sizes="sizes"
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
		@load="onLoad"
	/>
</template>

<script>
// https://image.nuxtjs.org/components/nuxt-picture and https://image.nuxtjs.org/components/nuxt-img

export default defineComponent({
	name: 'NuxtPictureExt',

	props: {
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
		width: { type: [Number, String], required: false },
		height: { type: [Number, String], required: false },
		ratio: { type: [Number, String], required: false },
		fit: { type: String, default: '' },
		loading: {
			type: String,
			default: 'lazy',
			validator: (value) => ['lazy', 'eager', 'auto'].includes(value),
		},

		imgAttrs: { type: Object, default: () => ({}) },
		quality: { type: [Number, String], default: 100 },
		modifiers: { type: Object, default: () => ({}) },
	},

	data() {
		return {
			isLoaded: false,
		};
	},

	computed: {
    urlParams() {
      const obj = {};

      if (this.src) {
        const url = new URL(this.src, 'https://example.com');
        const params = new URLSearchParams(url.search);
        params.forEach((value, key) => {
          obj[key] = value;
        });
      }

      return obj;
    },

		computedStyle() {
			let style = null;

      // Aspect ratio
      if (this.ratio) {
        style = { aspectRatio: this.ratio };
      } else if (this.width && this.height) {
        style = { aspectRatio: `${this.width} / ${this.height}` };
      } else if (this.urlParams.width && this.urlParams.height) {
        style = { aspectRatio: `${this.urlParams.width} / ${this.urlParams.height}` };
      }

      // Focus point
      if (this.fit && ['cover', 'none'].includes(this.fit) && this.urlParams.rxy?.split?.(',').length === 2) {
        const [x, y] = this.urlParams.rxy.split(',');
        style = {
          ...style,
          '--object-position': `${Math.round(x * 10000) / 100}% ${Math.round(y * 10000) / 100}%`,
        };
      }

			return style;
		},

		computedImgAttrs() {
			const className = ['c-nuxt-picture-ext__img', this.imgAttrs.class];
			const style = [this.imgAttrs.style];

			if (this.fit && this.fit !== 'crop') {
				style.unshift({ objectFit: this.fit });
			}

			return {
				...this.imgAttrs,
				class: className.filter(Boolean),
				style: style.filter(Boolean),
			};
		},
	},

  mounted() {
    const image = this.$el?.querySelector?.('img');
    if (image) {
      this.isLoaded = image.complete && image.naturalHeight !== 0;
    }
  },

	methods: {
		onLoad(e) {
			this.$emit('load', e);
			this.isLoaded = true;
		},
	},
});
</script>

<style>
:where(.c-nuxt-picture-ext) {
  display: inline-block;
  width: auto;
  height: auto;
}
:where(.c-nuxt-picture-ext__img) {
	width: 100%;
	height: 100%;
  object-position: var(--object-position);
}
</style>
