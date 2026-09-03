import { describe, expect, it } from 'vitest';
import { getImage } from '../providers/umbraco-image-processor';

/*
  Characterisation tests: these record what the provider does today, so the
  TypeScript conversion can be shown to change nothing. Cases under "known
  quirks" pin behaviour that is arguably wrong — they are here to catch an
  accidental change, not to endorse the result.
*/

describe('url construction', () => {
	it('returns a path with a query for a relative src', () => {
		expect(getImage('/img.jpg', {}).url).toBe(
			'/img.jpg?rmode=max&autoorient=true'
		);
	});

	it('returns an absolute url for an absolute src', () => {
		expect(getImage('https://cdn.test/img.jpg', {}).url).toBe(
			'https://cdn.test/img.jpg?rmode=max&autoorient=true'
		);
	});

	it('preserves unrelated params already on the src', () => {
		expect(
			getImage('https://cdn.test/i.jpg?width=500&v=2', {
				modifiers: { width: 250 },
			}).url
		).toBe('https://cdn.test/i.jpg?width=250&v=2&rmode=max&autoorient=true');
	});

	it('preserves nested paths', () => {
		expect(
			getImage('/media/a/b/i.jpg', { modifiers: { width: 100 } }).url
		).toBe('/media/a/b/i.jpg?width=100&rmode=max&autoorient=true');
	});

	it('always sets autoorient', () => {
		expect(getImage('/i.jpg', {}).url).toContain('autoorient=true');
	});

	it('copes with no options at all', () => {
		expect(getImage('/i.jpg').url).toBe('/i.jpg?rmode=max&autoorient=true');
	});
});

describe('fit maps to an ImageSharp resize mode', () => {
	it.each([
		['cover', 'crop'],
		['none', 'crop'],
		['contain', 'max'],
		[undefined, 'max'],
	])('fit %s produces rmode=%s', (fit, rmode) => {
		expect(getImage('/i.jpg', { modifiers: { width: 400, fit } }).url).toBe(
			`/i.jpg?width=400&rmode=${rmode}&autoorient=true`
		);
	});

	it('leaves an rmode already present on the src alone', () => {
		expect(
			getImage('/i.jpg?rmode=pad', { modifiers: { width: 400 } }).url
		).toBe('/i.jpg?rmode=pad&width=400&autoorient=true');
	});
});

describe('ratio', () => {
	it.each([
		['16/9', 225],
		['16:9', 225],
		[1.7777777, 225],
		['1.5', 267],
	])('drives height from width when cropping (%s)', (ratio, height) => {
		expect(
			getImage('/i.jpg', {
				modifiers: { width: 400, fit: 'cover', ratio },
			}).url
		).toBe(`/i.jpg?width=400&height=${height}&rmode=crop&autoorient=true`);
	});

	it('drives width from height when only height is known', () => {
		expect(
			getImage('/i.jpg', {
				modifiers: { height: 300, fit: 'cover', ratio: '16/9' },
			}).url
		).toBe('/i.jpg?width=534&height=300&rmode=crop&autoorient=true');
	});

	it('overrules a supplied height', () => {
		expect(
			getImage('/i.jpg', {
				modifiers: { width: 400, height: 999, fit: 'cover', ratio: '16/9' },
			}).url
		).toBe('/i.jpg?width=400&height=225&rmode=crop&autoorient=true');
	});

	it('is ignored when not cropping, since rmode=max keeps the source ratio', () => {
		expect(
			getImage('/i.jpg', { modifiers: { width: 400, ratio: '16/9' } }).url
		).toBe('/i.jpg?width=400&rmode=max&autoorient=true');
	});

	it.each(['abc', '0', '0/5'])('ignores the unusable ratio %s', (ratio) => {
		expect(
			getImage('/i.jpg', {
				modifiers: { width: 400, fit: 'cover', ratio },
			}).url
		).toBe('/i.jpg?width=400&rmode=crop&autoorient=true');
	});
});

describe('upscale clamping', () => {
	it('clamps width to the source width', () => {
		expect(
			getImage('/i.jpg', {
				modifiers: { width: 800, sourceWidth: 400, sourceHeight: 300 },
			}).url
		).toBe('/i.jpg?width=400&rmode=max&autoorient=true');
	});

	it('clamps height to the source height', () => {
		expect(
			getImage('/i.jpg', {
				modifiers: { height: 600, sourceWidth: 400, sourceHeight: 300 },
			}).url
		).toBe('/i.jpg?height=300&rmode=max&autoorient=true');
	});

	it('scales the other side so the ratio survives the clamp', () => {
		expect(
			getImage('/i.jpg', {
				modifiers: {
					width: 800,
					height: 800,
					sourceWidth: 400,
					sourceHeight: 4000,
				},
			}).url
		).toBe('/i.jpg?width=400&height=400&rmode=max&autoorient=true');
	});

	it('does not clamp when upscaling is allowed', () => {
		expect(
			getImage('/i.jpg', {
				modifiers: { width: 800, sourceWidth: 400, upscale: true },
			}).url
		).toBe('/i.jpg?width=800&rmode=max&autoorient=true');
	});

	it('clamps before applying the ratio', () => {
		expect(
			getImage('/i.jpg', {
				modifiers: {
					width: 800,
					fit: 'cover',
					ratio: '16/9',
					sourceWidth: 400,
					sourceHeight: 400,
				},
			}).url
		).toBe('/i.jpg?width=400&height=225&rmode=crop&autoorient=true');
	});
});

describe('dimensions fall back to the src query', () => {
	it('reads width and height off the src', () => {
		expect(getImage('/i.jpg?width=400&height=300', {}).url).toBe(
			'/i.jpg?width=400&height=300&rmode=max&autoorient=true'
		);
	});

	it('treats explicit source dimensions as the requested size', () => {
		expect(
			getImage('/i.jpg', {
				modifiers: { sourceWidth: 400, sourceHeight: 300 },
			}).url
		).toBe('/i.jpg?width=400&height=300&rmode=max&autoorient=true');
	});

	it('accepts numeric strings', () => {
		expect(
			getImage('/i.jpg', { modifiers: { width: '400', height: '300' } }).url
		).toBe('/i.jpg?width=400&height=300&rmode=max&autoorient=true');
	});
});

describe('rounding', () => {
	it('ceils width and derives height from the resulting ratio', () => {
		expect(
			getImage('/i.jpg', { modifiers: { width: 400.4, height: 300.6 } }).url
		).toBe('/i.jpg?width=401&height=301&rmode=max&autoorient=true');
	});

	it.each([0, -5])('drops a width of %s', (width) => {
		expect(getImage('/i.jpg', { modifiers: { width, height: 300 } }).url).toBe(
			'/i.jpg?height=300&rmode=max&autoorient=true'
		);
	});
});

describe('passthrough modifiers', () => {
	it('maps format, background and quality onto the query', () => {
		expect(
			getImage('/i.jpg', {
				modifiers: {
					width: 400,
					format: 'webp',
					background: 'fff',
					quality: 70,
				},
			}).url
		).toBe(
			'/i.jpg?width=400&rmode=max&autoorient=true&bgcolor=fff&format=webp&quality=70'
		);
	});

	it('falls back to a quality already on the src', () => {
		expect(getImage('/i.jpg?quality=55', {}).url).toBe(
			'/i.jpg?quality=55&rmode=max&autoorient=true'
		);
	});
});

describe('known quirks', () => {
	/*
	  `upscale` defaults to the raw src param, so the string 'false' is truthy
	  and ?upscale=false turns upscaling on rather than off.
	*/
	it('lets ?upscale=false enable upscaling', () => {
		expect(
			getImage('/i.jpg?upscale=false', {
				modifiers: { width: 800, sourceWidth: 400 },
			}).url
		).toBe('/i.jpg?upscale=false&width=800&rmode=max&autoorient=true');
	});

	/*
	  A height on the src is left in place when only a width is requested, so
	  cropping uses the source height as a requested height and the output
	  ratio is neither the source's nor the caller's.
	*/
	it('crops to the src height when only a width is requested', () => {
		expect(
			getImage('/i.jpg?width=400&height=300', {
				modifiers: { width: 200, fit: 'cover' },
			}).url
		).toBe('/i.jpg?width=200&height=300&rmode=crop&autoorient=true');
	});

	it('drops a quality of 0', () => {
		expect(
			getImage('/i.jpg', { modifiers: { width: 100, quality: 0 } }).url
		).toBe('/i.jpg?width=100&rmode=max&autoorient=true');
	});

	it('url-encodes the comma in an existing rxy param', () => {
		expect(
			getImage('/i.jpg?rxy=0.3,0.7', {
				modifiers: { width: 400, fit: 'cover' },
			}).url
		).toBe('/i.jpg?rxy=0.3%2C0.7&width=400&rmode=crop&autoorient=true');
	});
});
