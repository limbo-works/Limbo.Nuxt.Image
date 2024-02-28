import NuxtPictureExt from '../components/NuxtPictureExt.vue';
<template>
  <div>
    <BaseImg
      fit="cover"
      width="400"
      height="200"
      sizes="100vw >=1080:50vw"
      ratio="3"
      src="photo-1480714378408-67cf0d13bc1b.avif"
      @click="console.log('click')"
      @click.native="console.log('click.native')"
    />

    <NuxtPictureExt
      fit="cover"
      width="400"
      height="200"
      src="photo-1507615000156-f066acbb8edc.avif"
    />

    <NuxtPictureExt
      fit="cover"
      width="400"
      height="200"
      src="photo-1480714378408-67cf0d13bc1b.avif"
    />

    <NuxtPicture
      fit="cover"
      width="400"
      height="200"
      src="photo-1480714378408-67cf0d13bc1b.avif"
      loading="eager"
      decoding="auto"
    />
  </div>
</template>
