# Limbo.Nuxt.Image

Adds the `@nuxt/image-edge` module but configured to utilize the image processor used by our Umbraco backend ([ImageSharp](https://docs.sixlabors.com/api/ImageSharp/SixLabors.ImageSharp.html)). Also adds extended components expanding the ones provided by `@nuxt/image-edge`:

* `NuxtPictureExt`
* (`NuxtImgExt` could be added as well down the line)

These components should for the most part work as their counter-components with a few added nicities to match our setup.
So the [`@nuxt/image-edge` documentation](https://image.nuxtjs.org/components/nuxt-picture) should be highly usable.

## `NuxtPictureExt`

Supports the base functionality of `NuxtPicture` so generally follow its [documentation](https://image.nuxtjs.org/components/nuxt-picture). It also adds classes to the component following our base naming styles (`c-nuxt-picture-ext`, `c-nuxt-picture-ext--is-loading`, `c-nuxt-picture-ext--is-loaded` and `c-nuxt-picture-ext__img`) which can be used for styling purposes. Further, and through these classes and inline styles, some basis styles are added including:

* Aspect ratio when it is needed
* Automatically setting the right `object-fit` on the image
* `object-position` on the image when a `rxy` value is set in the src url params

