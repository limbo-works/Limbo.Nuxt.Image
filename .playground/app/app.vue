<template>
  <div>
    <h2>Interactive Playground</h2>
    <div style="margin-bottom: 2rem;">
      <label>Width: <input type="range" min="100" max="800" v-model="imgWidth" /></label>
      <span>{{ imgWidth }}px</span>
      <label>Height: <input type="range" min="100" max="600" v-model="imgHeight" /></label>
      <span>{{ imgHeight }}px</span>
      <label>Fit:
        <select v-model="imgFit">
          <option value="cover">cover</option>
          <option value="contain">contain</option>
          <option value="fill">fill</option>
        </select>
      </label>
      <label>Quality: <input type="number" min="1" max="100" v-model="imgQuality" /></label>
      <label>Densities: <input type="text" v-model="imgDensities" placeholder="e.g. 1 2" /></label>
      <label>Ratio: <input type="text" v-model="imgRatio" placeholder="e.g. 16/9" /></label>
      <label>Src: <input type="text" v-model="imgSrc" style="width: 300px;" /></label>
    </div>

    <BaseImg
      :fit="imgFit"
      :width="imgWidth"
      :height="imgHeight"
      :quality="imgQuality"
      :densities="imgDensities"
      :ratio="imgRatio"
      :src="imgSrc"
      :modifiers="{ upscale: true }"
      @click="console.log('BaseImg clicked')"
    >
      <template #default>
        <span style="color: #fff; background: rgba(0,0,0,0.5); padding: 2px 8px;">Slot Content</span>
      </template>
    </BaseImg>

    <NuxtPictureExt
      :fit="imgFit"
      :width="imgWidth"
      :height="imgHeight"
      :quality="imgQuality"
      :densities="imgDensities"
      :ratio="imgRatio"
      :src="imgSrc"
      @load="onNuxtPictureExtLoad"
    />

    <div v-if="imgSrc === ''" style="color: red; margin-top: 1rem;">Error: No image source provided!</div>

    <NuxtPicture
      :fit="imgFit"
      :width="imgWidth"
      :height="imgHeight"
      :quality="imgQuality"
      :densities="imgDensities"
      :src="imgSrc"
      loading="eager"
      preload
      decoding="auto"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import BaseImg from './components/BaseImg.vue';

const imgWidth = ref(400);
const imgHeight = ref(200);
const imgFit = ref('cover');
const imgQuality = ref(66);
const imgDensities = ref('1 2');
const imgRatio = ref('');
const imgSrc = ref('/photo-1507615000156-f066acbb8edc.avif');

function onNuxtPictureExtLoad() {
  console.log('NuxtPictureExt loaded');
}
</script>
