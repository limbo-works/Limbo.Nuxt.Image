# Limbo.Nuxt.Image

Adds the `@nuxt/image` module but configured to utilize the image processor used by our Umbraco backend ([ImageSharp](https://docs.sixlabors.com/api/ImageSharp/SixLabors.ImageSharp.html)). Also adds extended components expanding the ones provided by `@nuxt/image`:

* `NuxtPictureExt`
* (`NuxtImgExt` could/should be added as well down the line, but doesn't currently exist)

These components should for the most part work as their counter-components with a few added nicities to match our setup.
So the [`@nuxt/image` documentation](https://image.nuxt.com/components/nuxt-picture) should be highly usable.

## `NuxtPictureExt`

Supports the base functionality of `NuxtPicture` so generally follow its [documentation](https://image.nuxt.com/components/nuxt-picture). It also adds classes to the component following our base naming styles (`c-nuxt-picture-ext`, `c-nuxt-picture-ext--is-loading`, `c-nuxt-picture-ext--is-loaded` and `c-nuxt-picture-ext__img`) which can be used for styling purposes. Further, and through these classes and inline styles, some basis styles are added including:

* Aspect ratio when it is needed
* Automatically setting the right `object-fit` on the image
* `object-position` on the image when a `rxy` value is set in the src url params
* `sizes`-property conversion transforming strings like `100vw >=1080:800px` to something `@nuxt/image` can use as well as spreading out the `vw`-rules to all larger screen sizes defined in `nuxt.config.ts`.

## Setup & Configuration

### Breakpoint Alignment (The 1-Pixel Overlap Bug)

When configuring the `image.screens` property in your `nuxt.config.ts`, you must account for how `@nuxt/image` generates media queries compared to CSS utility frameworks like UnoCSS.

* **UnoCSS** treats `<1280` as an exclusive boundary, compiling to `@media (max-width: 1279.9px)`.
* **@nuxt/image** parses breakpoints as inclusive boundaries. A sizes prop like `sizes="1px >=1280:1000px"` is translated to `(max-width: 1280px) 1px`.

If breakpoints are mapped exactly 1:1, a collision occurs at precisely the breakpoint pixel (e.g., 1280px—a highly common viewport width for users on 1920px monitors with 150% OS-level display scaling). At exactly 1280px, UnoCSS removes the `hidden` class making the container visible, but `@nuxt/image` instructs the browser to download the 1px bandwidth-saving placeholder. This results in a single 1x1 pixel being stretched across the entire container, appearing as a solid colored box.

To prevent this, subtract `0.1` from your breakpoint values when mapping them to the Nuxt Image configuration. This perfectly aligns Nuxt Image's inclusive breakpoints with UnoCSS's exclusive boundaries, ensuring the smaller image rule falls off right before the CSS visibility breakpoint triggers.

**Example `nuxt.config.ts` setup:**

```javascript
import breakpoints from './assets/js/breakpoints';

const mappedBreakpoints = {};
for (const [key, value] of Object.entries(breakpoints)) {
    // Subtract 0.1 to perfectly align with UnoCSS exclusive boundaries
    mappedBreakpoints[`>=${key}`] = value.px - 0.1;
}

export default defineNuxtConfig({
    // ...
    image: {
        screens: {
            ...mappedBreakpoints,
        },
    },
});

```
