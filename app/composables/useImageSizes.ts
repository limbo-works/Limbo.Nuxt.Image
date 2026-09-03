/**
 * Helper to smartly fill in responsive sizes for images.
 * @param sizes The sizes to fill in between, e.g. `100vw >=1080:800px`.
 */
export function useImageSizes(sizes?: string): string | undefined {
	const screens: Record<string, number> = { ...useImage().options.screens };
	const breakpointList = [...new Set(Object.values(screens))]
		.map((value) => {
			return +value;
		})
		.filter((value) => {
			return !isNaN(value);
		})
		.sort((a, b) => {
			return a - b;
		});

	if (!sizes) return sizes;

	const splitSizes = sizes
		.split(' ')
		.map((value) => {
			return value.trim();
		})
		.sort((a, b) => {
			return breakpointOf(a) - breakpointOf(b);
		});

	if (!sizes.includes('vw') || !breakpointList.length) {
		return splitSizes.join(' ');
	}

	const output: Record<string, string> = {};
	const outputArray: string[] = [];

	for (const item of splitSizes) {
		const [rawSize, rawBreakpoint] = item.split(':').reverse();
		const size = rawSize ?? '';
		if (!size.includes('px') && !size.includes('vw')) {
			continue;
		}

		const breakpoint = rawBreakpoint
			? Number(screens[rawBreakpoint])
			: Math.min(0, ...breakpointList);

		if (breakpointList.includes(breakpoint)) {
			output[String(rawBreakpoint)] = size;
		} else {
			outputArray.push(size);
		}

		/*
		  px sizes carry upward alongside vw ones. Clearing them at the larger
		  breakpoints was attempted here but tested a number for `includes`,
		  so it never ran and the spread has always applied to both.
		*/
		const larger = breakpointList.filter((value) => {
			return value > breakpoint;
		});
		for (const value of larger) {
			const key = Object.keys(screens).find((screen) => {
				return screens[screen] === value;
			});
			output[String(key)] = size;
		}
	}

	for (const [key, value] of Object.entries(output)) {
		outputArray.push(`${key}:${value}`);
	}

	return outputArray.join(' ');
}

// The numeric part of a `>=1080:` prefix, or 0 when an entry carries none
function breakpointOf(size: string): number {
	if (!size) return 0;
	if (!size.includes(':')) return 0;
	const [prefix = ''] = size.split(':');
	return parseInt(prefix.replace(/\D/g, ''), 10);
}
