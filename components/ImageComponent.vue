<template>
	<div class="absolute cursor-move bg-transparent" :style="{
		top: imageElement.y + 'px',
		left: imageElement.x + 'px',
	}" draggable="false" @dragstart="emit('dragStart', $event)" @dragend="emit('dragEnd', $event)">
		<div v-if="imageElement.pageIndex === index" class="relative">
			<img :src="getImageUrl(imageElement.imageData)" :width="imageElement.width" class="max-w-none" />
			<!-- Resize Handles -->
			<div class="resize-handle" @mousedown="emit('resize-start', $event)">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none"
					stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<line x1="16" y1="8" x2="22" y2="2" /> <!-- Top-right arrow -->
					<polyline points="16 2 22 2 22 8" />
					<line x1="8" y1="16" x2="2" y2="22" /> <!-- Bottom-left arrow -->
					<polyline points="2 16 2 22 8 22" />
				</svg>

			</div>
			<!-- Delete Button -->
			<button class="absolute -top-[10px] -right-[10px] bg-red-500 text-white rounded-full px-2 py-1 text-xs"
				@click="emit('deleteElement')">
				X
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">

type T = { x: number; y: number; width: number; imageData: Uint8Array; pageIndex: number }
const emit = defineEmits(['dragStart', 'dragEnd', 'deleteElement', 'resize-start'])
defineProps<{
	imageElement: T;
	index: any;
}>()
function getImageUrl(imageData: Uint8Array) {
  const blob = new Blob([imageData], { type: 'image/png' });
  return URL.createObjectURL(blob);
}
</script>

<style>
.resize-handle {
  position: absolute;
  width: 10px;
  height: 10px;
  background: transparent;
  cursor: pointer;
  bottom: -5px;
  right: -5px;
  cursor: se-resize;
}
</style>
