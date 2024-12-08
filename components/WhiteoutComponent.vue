<template>
	<div class="absolute cursor-move bg-transparent" :style="{
		top: whiteoutElement.y + 'px',
		left: whiteoutElement.x + 'px',
	}" draggable="true" @dragstart="emit('dragStart', $event)" @dragend="emit('dragEnd', $event)">
		<div v-if="whiteoutElement.pageIndex === index" class="relative">
			<div class="border border-gray-200 bg-white shadow-sm" :style="{
				width: whiteoutElement.width + 'px',
				height: whiteoutElement.height + 'px',
				opacity: whiteoutElement.opacity
			}">
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
const emit = defineEmits(['dragStart', 'dragEnd', 'deleteElement'])
defineProps<{
	whiteoutElement: { x: number; y: number; width: number; height: number; opacity: number; pageIndex: number; };
	index: any;
}>()
</script>
