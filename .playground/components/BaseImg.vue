<script>
import { h } from 'vue';
import NuxtPictureExt from '../../components/NuxtPictureExt.vue';

export default defineComponent({
	name: 'BaseImg',

	components: {
		NuxtPictureExt,
	},

	props: {
		alt: {
			type: String,
			default: '',
		},

		loadColor: {
			type: String,
			default: '#fff',
		},

		quality: {
			type: [Number, String],
			default: 90,
		},
	},

	render() {
		const {
			class: dynamicClass = null,
			style: dynamicStyle = null,
		} = this.$attrs;

		const { fit, width, loadColor } = { ...this.$props, ...this.$attrs };
		let placeholderStyles = null;
		if (loadColor) {
			let { height, ratio } = { ...this.$props, ...this.$attrs };
			if (ratio) {
				height = Math.round(width / ratio);
			} else {
				ratio = `${width} / ${height}`;
			}

			const placeholderSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="${loadColor}" /></svg>`;
			const backgroundImage = `url("data:image/svg+xml,${encodeURIComponent(
				placeholderSvg
			)}")`;

			placeholderStyles =
				fit === 'contain'
					? {
						'--background-image': backgroundImage,
						'--background-size': fit,
						'--background-position': '50% 50%',
					  }
					: {
						'--background-color': loadColor,
						'--background-size': '100% 100%',
					  };
		}

		const bindings = {
			...this.$attrs,
			class: ['c-base-img', dynamicClass].filter(Boolean),
			style: [placeholderStyles, dynamicStyle].filter(
				Boolean
			),
			alt: this.$props.alt || '',
			quality: this.$props.quality || 100,
		};

		return h(NuxtPictureExt, bindings);
	},
});
</script>

<style>
.c-base-img {
	position: relative;
  isolation: isolate;
}
.c-base-img img,
.c-base-img:before {
	transition: opacity 0.3s;
}

.c-base-img:before {
	content: '';
	position: absolute;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	pointer-events: none;
	opacity: 0;

	/* placeholder */
	background-color: var(--background-color);
	background-image: var(--background-image);
	background-size: var(--background-size);
	background-position: var(--background-position);
	background-repeat: no-repeat;
}

.c-base-img.c-nuxt-picture-ext--is-loading img {
	opacity: 0;
}
.c-base-img.c-nuxt-picture-ext--is-loading:before {
	opacity: 1;
}
</style>
