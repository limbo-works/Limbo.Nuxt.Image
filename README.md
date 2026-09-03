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

### Modifiers

Beyond the modifiers `@nuxt/image` defines, the Umbraco provider understands:

| Modifier | Type | Effect |
| --- | --- | --- |
| `ratio` | `number \| string` | Target aspect ratio as `16/9`, `16:9` or `1.778`. Only applied when cropping (`fit` of `cover` or `none`), since `rmode=max` returns the source ratio regardless. |
| `sourceWidth` | `number \| string` | The original image width, used to avoid upscaling. Falls back to a `width` in the src query. |
| `sourceHeight` | `number \| string` | The original image height, used to avoid upscaling. Falls back to a `height` in the src query. |
| `upscale` | `boolean` | Allow the requested size to exceed the source size. Defaults to off. |

These are typed, so a TypeScript project gets completion and checking on
`NuxtPicture`'s and `NuxtPictureExt`'s `modifiers` prop.

## TypeScript

The layer ships TypeScript source and is not built before publishing, which is
how it has always worked — Vite and Nitro compile it as part of the consuming
app. **No change is needed in a solution that uses it**, including the
JavaScript ones.

Two things follow for projects that do run `nuxi typecheck`: the custom
modifiers above are checked at the call site, and this layer's source is type
checked along with your own, since `@nuxt/image` generates a type template that
imports the provider.
