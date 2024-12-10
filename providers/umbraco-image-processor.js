export function getImage(
  src,
  { densities, modifiers, sizes } = {},
  { options, $img } = {},
) {
  const url = src?.startsWith?.('http') ? new URL(src) : new URL(src, "https://example.com");
  const { format, fit, ratio: ratioInput, quality = url.searchParams.get('quality'), background, upscale = url.searchParams.get('upscale') ?? false } = modifiers;

  // Calculate ratio
  const ratio = (() => {
    if (ratioInput) {
      if (typeof ratioInput === "number") {
        return ratioInput;
      }
      if (ratioInput.includes('/')) {
        const [a, b] = ratioInput.split('/');
        return a / b;
      }
      if (ratioInput.includes(':')) {
        const [a, b] = ratioInput.split(':');
        return a / b;
      }
    }
    return null;
  })();

  // Set proper width and height
  let { sourceWidth, sourceHeight, width, height } = modifiers;
  if (!sourceWidth && !sourceHeight) {
    sourceWidth = url.searchParams.get("width");
    sourceHeight = url.searchParams.get("height");
  }

  // Clamp at source size
  if (!upscale) {
    if (sourceWidth && sourceHeight) {
      if (width && +width > +sourceWidth) {
        width = Math.min(+width, +sourceWidth);

        if (ratio && !height) {
          height = Math.max(width / parseFloat(ratio), +sourceHeight);
        }
      }
      if (height && +height > +sourceHeight) {
        height = Math.min(+height, +sourceHeight);

        if (ratio && !width) {
          width = Math.max(height * parseFloat(ratio), +sourceWidth);
        }
      }
    } else if (sourceWidth) {
      if (width && +width > +sourceWidth) {
        const oldWidth = +width;
        width = Math.min(+width, +sourceWidth);

        if (ratio && !height) {
          height = width / parseFloat(ratio);
        } else if (height) {
          height = (+height / oldWidth) * width;
        }
      }
    } else if (sourceHeight) {
      if (height && +height > +sourceHeight) {
        const oldHeight = +height;
        height = Math.min(+height, +sourceHeight);

        if (ratio && !width) {
          width = height * parseFloat(ratio);
        } else if (width) {
          width = (+width / oldHeight) * height;
        }
      }
    }
  }

  if (width) {
    width = Math.round(+width);
  }
  if (height) {
    height = Math.round(+height);
  }

  // process modifiers
  if (width) {
    url.searchParams.set("width", width);
  }
  if (height) {
    url.searchParams.set("height", height);
  }
  if (ratio) {
    if (width && !height) {
      url.searchParams.set("height", Math.max(1, Math.round(width / parseFloat(ratio))));
    } else if (height && !width) {
      url.searchParams.set("width", Math.max(1, Math.round(height * parseFloat(ratio))));
    } else if (width && height) {
      if (width < height * parseFloat(ratio)) {
        url.searchParams.set("height", Math.max(1, Math.round(width / parseFloat(ratio))));
      } else {
        url.searchParams.set("width", Math.max(1, Math.round(height * parseFloat(ratio))));
      }
    }
  }

  // Guidance: https://docs.sixlabors.com/api/ImageSharp/SixLabors.ImageSharp.Processing.ResizeMode.html
  if (["cover", "none"].includes(fit)) {
    url.searchParams.set("rmode", "crop");
  } else if (!url.searchParams.get("rmode")) {
    url.searchParams.set("rmode", "max");
  }

  // https://docs.sixlabors.com/api/ImageSharp/SixLabors.ImageSharp.Processing.AutoOrientExtensions.html
  url.searchParams.set("autoorient", "true");

  if (background) {
    url.searchParams.set("bgcolor", background);
  }

  if (format) {
    url.searchParams.set("format", format);
  }

  if (quality) {
    url.searchParams.set("quality", quality);
  }

  return {
    url: src?.startsWith?.('http') ? url.toString() : `${url.pathname}?${url.searchParams.toString()}`,
  };
}
