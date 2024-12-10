import NuxtPictureExt from '../components/NuxtPictureExt.vue';
<template>
  <div>
    <BaseImg
      fit="cover"
      width="400"
      height="200"
      sizes="100vw >=1080:50vw >=1440:800px"
      densities="1x"
      quality="67"
      ratio="6/1"
      src="https://dev-10175ni-fe.testserver.nu/media/kxpbosp5/2024-08-21_nielsbrock_marenerhardt_442.jpg?rxy=0.666805986038818,0.2902935083344112&width=2500&height=1667&v=1db4a13edbd45c0"
      format="png"
      :modifiers="{
        upscale: true,
      }"
      @click="console.log('click')"
      @click.native="console.log('click.native')"
    />

    <NuxtPictureExt
      fit="cover"
      width="400"
      height="200"
      densities="1 2"
      quality="66"
      src="/photo-1507615000156-f066acbb8edc.avif"
    />

    <NuxtPictureExt
      fit="cover"
      width="400"
      height="200"
      densities="1 2"
      quality="66"
      src="/photo-1480714378408-67cf0d13bc1b.avif"
    />

    <NuxtPicture
      fit="cover"
      width="400"
      height="200"
      densities="1 2"
      quality="66"
      src="/photo-1480714378408-67cf0d13bc1b.avif"
      loading="eager"
      preload
      decoding="auto"
    />
  </div>
</template>
