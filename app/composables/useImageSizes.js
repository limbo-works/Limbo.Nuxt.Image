/**
 * Helper to smartly fill in responsive sizes for images.
 * @param {string} sizes The sizes to fill in between.
 */
export function useImageSizes(sizes) {
		// Helper to get screen key from value
		function getScreenKey(size) {
			return Object.keys(screens).find((key) => screens[key] === size);
		}

		let response = sizes;
		const screens = { ...useImage().options.screens };
		// Get unique, sorted breakpoints
		let breakpointList = [...new Set(Object.values(screens))]
			.map((value) => +value)
			.filter((value) => !isNaN(value))
			.sort((a, b) => a - b);

		if (!sizes) return response;

		// Split and clean sizes
		const splitSizes = sizes.split(' ').map((val) => String(val).trim());

		// Sort from smallest to largest breakpoint
		splitSizes.sort((a, b) => {
			const getVal = (v) => {
				if (!v) return 0;
				if (v.includes(':')) return parseInt(v.split(':')[0].replace(/\D/g, ''), 10);
				return 0;
			};
			return getVal(a) - getVal(b);
		});

		// If sizes include vw, fill in missing breakpoints
		if (sizes.includes('vw') && breakpointList.length) {
			const output = {};
			const outputArray = [];

			splitSizes.forEach((item) => {
				const [size, raw] = item.split(':').reverse();
				const breakpoint = raw ? +screens[raw] : Math.min(0, ...breakpointList);
				const isValue = size.includes('px') || size.includes('vw');
				const isBreakpoint = breakpointList.includes(breakpoint);

				if (isValue) {
					// Add to the current breakpoint
					if (isBreakpoint) {
						output[raw] = size;
					} else {
						outputArray.push(size);
					}

					// Spread vw-based sizes to larger breakpoints
					breakpointList.filter((val) => val > breakpoint).forEach((val) => {
						const breakRaw = getScreenKey(val);
						if (val?.includes?.('px')) {
							delete output[breakRaw];
						} else {
							output[breakRaw] = size;
						}
					});
				}
			});

			Object.keys(output).forEach((key) => {
				outputArray.push(`${key}:${output[key]}`);
			});

			response = outputArray.join(' ');
		} else {
			response = splitSizes.join(' ');
		}

		return response;
	}
