import { defineProvider } from '@nuxt/image/runtime';

const DEFAULT_BASE_URL = 'https://example.com';

export default defineProvider({
	getImage,
});

export function getImage(
	src,
	{ densities, modifiers, sizes } = {},
	{ options, $img, baseUrl = DEFAULT_BASE_URL } = {}
) {
	modifiers = modifiers || {};
	const url = src?.startsWith?.('http')
		? new URL(src)
		: new URL(src, baseUrl);
	const {
		format,
		fit,
		ratio: ratioInput,
		quality = url.searchParams.get('quality'),
		background,
		upscale = url.searchParams.get('upscale') ?? false,
	} = modifiers;
	/*
	  Calculate ratio. It may only drive the width and height when we actually
	  crop, since `rmode=max` hands back the source ratio no matter what we ask
	  for. Anywhere else the aspect-ratio css handles it instead.
	*/
	const crop = ['cover', 'none'].includes(fit);
	const ratio = crop ? parseRatio(ratioInput) : null;

	// Set proper width and height
  /*
    We start of with make sure the base values are there if possible.
    - sourceWidth and sourceHeight are the original image dimensions, if they are not provided we try to get them from the url search params.
    - width and height are the requested dimensions, if they are not provided we try to get them from the url search params.
  */
	let { sourceWidth, sourceHeight, width, height } = modifiers;

  const urlWidth = url.searchParams.get('width');
  const urlHeight = url.searchParams.get('height');

	if (!sourceWidth && !sourceHeight) {
		sourceWidth = urlWidth ? +urlWidth : width;
		sourceHeight = urlHeight ? +urlHeight : height;
	}
  if (!width && !height) {
    width = urlWidth ? +urlWidth : sourceWidth;
    height = urlHeight ? +urlHeight : sourceHeight;
  }

	// Normalise to numbers so the maths below never has to coerce strings
	width = toPositiveNumber(width);
	height = toPositiveNumber(height);
	sourceWidth = toPositiveNumber(sourceWidth);
	sourceHeight = toPositiveNumber(sourceHeight);

	/*
	  A requested ratio overrules the incoming height, also when the source
	  dimensions are known. Nuxt Image derives the height of every srcset entry
	  from the source dimensions, so both are practically always set by the time
	  we get here, and the odd one out has to be recalculated for the ratio to
	  take effect at all.
	*/
	if (ratio) {
		if (width) {
			height = width / ratio;
		} else if (height) {
			width = height * ratio;
		}
	}

	/*
	  We clamp the requested dimensions to the source size if upscaling is not
	  allowed, scaling the other side along so the ratio survives the clamp.
	  The clamped side is assigned outright rather than scaled, so it cannot
	  pick up a floating point remainder that the later Math.ceil would round
	  up into an upscale after all.
	*/
	if (!upscale) {
		if (sourceWidth && width > sourceWidth) {
			const scale = sourceWidth / width;
			width = sourceWidth;
			if (height) {
				height *= scale;
			}
		}
		if (sourceHeight && height > sourceHeight) {
			const scale = sourceHeight / height;
			height = sourceHeight;
			if (width) {
				width *= scale;
			}
		}
	}

	// Avoid decimal values, keeping the requested ratio intact
	const outputRatio = ratio || (width && height ? width / height : null);
	if (width) {
		width = Math.ceil(width);
		if (outputRatio) {
			height = width / outputRatio;
		}
	}
	if (height) {
		height = Math.max(1, Math.round(height));
	}

	// Process modifiers
	if (width) {
		url.searchParams.set('width', width);
	}
	if (height) {
		url.searchParams.set('height', height);
	}

	// Guidance: https://docs.sixlabors.com/api/ImageSharp/SixLabors.ImageSharp.Processing.ResizeMode.html
	if (crop) {
		url.searchParams.set('rmode', 'crop');
	} else if (!url.searchParams.get('rmode')) {
		url.searchParams.set('rmode', 'max');
	}

	// https://docs.sixlabors.com/api/ImageSharp/SixLabors.ImageSharp.Processing.AutoOrientExtensions.html
	url.searchParams.set('autoorient', 'true');

	if (background) {
		url.searchParams.set('bgcolor', background);
	}

	if (format) {
		url.searchParams.set('format', format);
	}

	if (quality) {
		url.searchParams.set('quality', quality);
	}

	return {
		url: src?.startsWith?.('http')
			? url.toString()
			: `${url.pathname}?${url.searchParams.toString()}`,
	};
}

function parseRatio(ratioInput) {
	if (!ratioInput) return null;
	if (typeof ratioInput === 'number') return toPositiveNumber(ratioInput);
	if (ratioInput.includes('/')) {
		const [a, b] = ratioInput.split('/');
		return toPositiveNumber(a / b);
	}
	if (ratioInput.includes(':')) {
		const [a, b] = ratioInput.split(':');
		return toPositiveNumber(a / b);
	}
	return toPositiveNumber(ratioInput);
}

// Only positive, finite ratios and sizes make sense to pass on
function toPositiveNumber(value) {
	const number = parseFloat(value);
	return Number.isFinite(number) && number > 0 ? number : null;
}
