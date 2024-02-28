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
    const splitSizes = sizes.split(" ").map((val) => String(val).trim());

    splitSizes.sort((a, b) => {
      a = parseInt(a.split(":")[0].replace(/\D/g, ""), 10);
      b = parseInt(b.split(":")[0].replace(/\D/g, ""), 10);
      return b - a;
    });

    if (sizes.includes("vw") && breakpointList.length) {
      const output = [];

      for (let i = 0; i < splitSizes.length; i++) {
        const [size, raw] = splitSizes[i].split(":").reverse();
        const breakpoint = raw && parseInt(raw.replace(/\D/g, ""), 10);
        const isValue = size.includes("px") || size.includes("vw");

        if (isValue && breakpoint) {
          const midList = breakpointList
            .filter((v) => v >= breakpoint)
            .map((v) => `${getScreenKey(v)}:${size}`);

          midList.length && output.push(...midList);
        }

        if (isValue && !breakpoint) {
          output.push(
            ...breakpointList.map((v) => `${getScreenKey(v)}:${size}`)
          );
        }

        breakpointList = breakpointList.filter((val) => val < breakpoint);
      }

      response = output.join(" ");
    } else {
      response = splitSizes.join(" ");
    }
  }

  return response;

  function getScreenKey(size) {
    return Object.keys(screens).find((key) => screens[key] === size);
  }
}
