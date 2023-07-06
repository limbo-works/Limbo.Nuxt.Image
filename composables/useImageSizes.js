/**
 * Helper to smartly fill in responsive sizes for images.
 * @param {string} sizes The sizes to fill in between.
 */
export function useImageSizes(sizes) {
  const screens = { ...useImage().options.screens };
  let breakpointList = [...new Set(Object.values(screens))]
    .map((value) => +value)
    .filter((value) => !isNaN(value));
  breakpointList.sort((a, b) => a - b);

  let _return = sizes;
  if (sizes) {
    const splitSizes = sizes
      .split(" ")
      .map((val) => {
        if (!String(val).includes(":")) {
          return `${getScreenKey(Math.max(...breakpointList))}:${val.trim()}`;
        }
        return String(val).trim();
      })
      .filter((val) => {
        return Boolean(val) && val.split(":").filter(Boolean).length === 2;
      });
    splitSizes.sort((a, b) => {
      a = parseInt(a.split(":")[0].replace(/\D/g, ""), 10);
      b = parseInt(b.split(":")[0].replace(/\D/g, ""), 10);

      return a - b;
    });

    if (sizes.includes("vw") && breakpointList.length) {
      const output = [];

      for (let i = 0; i < splitSizes.length; i++) {
        const size = splitSizes[i].split(":")[1];
        const breakpoint = parseInt(
          splitSizes[i].split(":")[0].replace(/\D/g, ""),
          10
        );

        if (splitSizes[i].includes("vw")) {
          const midList = breakpointList
            .filter((val) => val < breakpoint)
            .map((val) => {
              return `${getScreenKey(val)}:${size}`;
            });
          midList.length && output.push(...midList);
        }

        breakpointList = breakpointList.filter((val) => val > breakpoint);
        output.push(splitSizes[i]);
      }
      _return = output.join(" ");
    } else {
      _return = splitSizes.join(" ");
    }
  }
  return _return;

  function getScreenKey(size) {
    return Object.keys(screens).find((key) => screens[key] === size);
  }
}
