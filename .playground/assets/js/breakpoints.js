const rootFontSize = 16;

/*
	Note that we purposefully exclude teh 1440
	breakpoint per default. A lot of screens are
	this exact size, and having a lit of things
	change exactly on that breakpoint can make
	for some confusion. If you do need it for
	something, you are of course free to un-
	comment it.
*/
module.exports = [568, 605, 760, 990, 1080].reduce(
  (acc, value) => ({
    ...acc,

    [`${value}`]: {
      px: value,
      em: value / rootFontSize,
    },
  }),
  {}
);
