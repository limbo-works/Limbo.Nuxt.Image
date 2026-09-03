<template>
	<div>
		<h2>Interactive Playground</h2>
		<div style="margin-bottom: 2rem">
			<label>
				Width:
				<input
					v-model="imgWidth"
					type="range"
					min="100"
					max="800"
				>
			</label>
			<span>{{ imgWidth }}px</span>
			<label>
				Height:
				<input
					v-model="imgHeight"
					type="range"
					min="100"
					max="600"
				>
			</label>
			<span>{{ imgHeight }}px</span>
			<label>
				Fit:
				<select v-model="imgFit">
					<option value="cover">cover</option>
					<option value="contain">contain</option>
					<option value="fill">fill</option>
				</select>
			</label>
			<label>
				Quality:
				<input
					v-model="imgQuality"
					type="number"
					min="1"
					max="100"
				>
			</label>
			<label>
				Densities:
				<input
					v-model="imgDensities"
					type="text"
					placeholder="e.g. 1 2"
				>
			</label>
			<label>
				Ratio:
				<input
					v-model="imgRatio"
					type="text"
					placeholder="e.g. 16/9"
				>
			</label>
			<label>
				Sizes:
				<input
					v-model="imgSizes"
					type="text"
					placeholder="e.g. 100vw >=1080:800px"
				>
			</label>
			<label>
				Src:
				<input
					v-model="imgSrc"
					type="text"
					style="width: 300px"
				>
			</label>
		</div>

		<BaseImg
			:fit="imgFit"
			:width="imgWidth"
			:height="imgHeight"
			:quality="imgQuality"
			:densities="imgDensities"
			:ratio="imgRatio"
			:sizes="imgSizes || undefined"
			:src="imgSrc"
			:modifiers="{ upscale: true }"
			@click="onBaseImgClick"
		>
			<template #default>
				<span
					style="
						color: #fff;
						background: rgb(0 0 0 / 0.5);
						padding: 2px 8px;
					"
				>Slot Content</span>
			</template>
		</BaseImg>

		<NuxtPictureExt
			:fit="imgFit"
			:width="imgWidth"
			:height="imgHeight"
			:quality="imgQuality"
			:densities="imgDensities"
			:ratio="imgRatio"
			:sizes="imgSizes || undefined"
			:src="imgSrc"
			@load="onNuxtPictureExtLoad"
		/>

		<div
			v-if="imgSrc === ''"
			style="color: red; margin-top: 1rem"
		>
			Error: No image source provided!
		</div>

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

<script setup lang="ts">
const imgWidth = ref(400);
const imgHeight = ref(200);
const imgFit = ref('cover');
const imgQuality = ref(66);
const imgDensities = ref('1 2');
const imgRatio = ref('');
const imgSizes = ref('');
const imgSrc = ref('/photo-1507615000156-f066acbb8edc.avif');

function onBaseImgClick() {
	console.log('BaseImg clicked');
}

function onNuxtPictureExtLoad() {
	console.log('NuxtPictureExt loaded');
}
</script>
