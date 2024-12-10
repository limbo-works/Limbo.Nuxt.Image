/**
 * Helper to smartly fill in responsive sizes for images.
 * @param {string} sizes The sizes to fill in between.
 */
export function useImageSizes(sizes) {
	let response = sizes;
	const screens = { ...useImage().options.screens };
	let breakpointList = [...new Set(Object.values(screens))]
		.map((value) => +value)
		.filter((value) => !isNaN(value))
		.sort((a, b) => a - b);

	if (sizes) {
		const splitSizes = sizes.split(' ').map((val) => String(val).trim());

		// Sort from smallest to largest
		splitSizes.sort((a, b) => {
			a = a
				? parseInt(a.split(':')[0].replace(/\D/g, ''), 10)
				: a?.includes?.(':')
					? null
					: 0;
			b = b
				? parseInt(b.split(':')[0].replace(/\D/g, ''), 10)
				: b?.includes?.(':')
					? null
					: 0;
			return a - b;
		});

		// If the sizes include vw, we need to insert the missing breakpoints
		if (sizes.includes('vw') && breakpointList.length) {
			const output = {};
			const outputArray = [];

			for (let i = 0; i < splitSizes.length; i++) {
				const [size, raw] = splitSizes[i].split(':').reverse();
				const breakpoint = raw
					? +screens[raw]
					: Math.min(0, ...breakpointList);

				const isValue = size.includes('px') || size.includes('vw');
				const isBreakpoint = breakpointList.includes(breakpoint);

				if (isValue) {
					// Add to the current breakpoint
					if (isBreakpoint) {
						output[raw] = size;
					} else {
						outputArray.push(size);
					}

					// Also add to following breakpoints if it's vw based, else remove as the size stays the same
					breakpointList
						.filter((val) => val > breakpoint)
						.forEach((val) => {
							const breakRaw = getScreenKey(val);
							if (val?.includes?.('px')) {
								delete output[breakRaw];
							} else {
								output[breakRaw] = size;
							}
						});
				}
			}

			Object.keys(output).forEach((key) => {
				outputArray.push(`${key}:${output[key]}`);
			});

			response = outputArray.join(' ');
		} else {
			response = splitSizes.join(' ');
		}
	}

	return response;

	function getScreenKey(size) {
		return Object.keys(screens).find((key) => screens[key] === size);
	}
}
