import { defineProvider } from '@nuxt/image/runtime';
import type { ImageModifiers, ResolvedImage } from '@nuxt/image';

const DEFAULT_BASE_URL = 'https://example.com';

export interface UmbracoImageModifiers {
	ratio?: number | string;
	sourceWidth?: number | string;
	sourceHeight?: number | string;
	upscale?: boolean;
}

type Modifiers = Partial<ImageModifiers> & UmbracoImageModifiers;

export default defineProvider<{ modifiers: UmbracoImageModifiers }>({
	getImage,
});

export function getImage(
	src: string,
	options: { modifiers?: Modifiers } = {}
): ResolvedImage {
	const modifiers = options.modifiers || {};
	const isAbsoluteUrl = src?.startsWith?.('http');
	const url = isAbsoluteUrl ? new URL(src) : new URL(src, DEFAULT_BASE_URL);

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
	const crop = fit === 'cover' || fit === 'none';
	const ratio = crop ? parseRatio(ratioInput) : null;

	let rawWidth = modifiers.width;
	let rawHeight = modifiers.height;
	let rawSourceWidth = modifiers.sourceWidth;
	let rawSourceHeight = modifiers.sourceHeight;

	const urlWidth = url.searchParams.get('width');
	const urlHeight = url.searchParams.get('height');

	if (!rawSourceWidth && !rawSourceHeight) {
		rawSourceWidth = urlWidth ? +urlWidth : rawWidth;
		rawSourceHeight = urlHeight ? +urlHeight : rawHeight;
	}
	if (!rawWidth && !rawHeight) {
		rawWidth = urlWidth ? +urlWidth : rawSourceWidth;
		rawHeight = urlHeight ? +urlHeight : rawSourceHeight;
	}

	// Normalise to numbers so the maths below never has to coerce strings
	let width = toPositiveNumber(rawWidth);
	let height = toPositiveNumber(rawHeight);
	const sourceWidth = toPositiveNumber(rawSourceWidth);
	const sourceHeight = toPositiveNumber(rawSourceHeight);

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
		if (sourceWidth && width && width > sourceWidth) {
			const scale = sourceWidth / width;
			width = sourceWidth;
			if (height) {
				height *= scale;
			}
		}
		if (sourceHeight && height && height > sourceHeight) {
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

	if (width) {
		url.searchParams.set('width', String(width));
	}
	if (height) {
		url.searchParams.set('height', String(height));
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
		url.searchParams.set('quality', String(quality));
	}

	return {
		url: isAbsoluteUrl
			? url.toString()
			: `${url.pathname}?${url.searchParams.toString()}`,
	};
}

function parseRatio(ratioInput?: number | string): number | null {
	if (!ratioInput) return null;
	if (typeof ratioInput === 'number') return toPositiveNumber(ratioInput);
	if (ratioInput.includes('/')) {
		const [a, b] = ratioInput.split('/');
		return toPositiveNumber(Number(a) / Number(b));
	}
	if (ratioInput.includes(':')) {
		const [a, b] = ratioInput.split(':');
		return toPositiveNumber(Number(a) / Number(b));
	}
	return toPositiveNumber(ratioInput);
}

// Only positive, finite ratios and sizes make sense to pass on
function toPositiveNumber(
	value: number | string | null | undefined
): number | null {
	const number = parseFloat(String(value));
	return Number.isFinite(number) && number > 0 ? number : null;
}
