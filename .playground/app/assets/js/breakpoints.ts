const rootFontSize = 16;

/*
	The boilerplate default leaves 1440 out, since a lot of screens are
	exactly that wide and having things change on it causes confusion.
	This playground keeps it so the layer's breakpoint spreading has a
	large breakpoint to work against.
*/
export default [300, 568, 605, 760, 990, 1080, 1440].reduce<
	Record<string, { px: number; em: number }>
>((breakpoints, value) => {
	return {
		...breakpoints,

		[`${value}`]: {
			px: value,
			em: value / rootFontSize,
		},
	};
}, {});
