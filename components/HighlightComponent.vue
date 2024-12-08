<template>
	<div 
		class="absolute cursor-move bg-transparent" :style="{
			top: highlightElement.y + 'px',
			left: highlightElement.x + 'px',
		}" draggable="true" @dragstart="emit('dragStart', $event)" @dragend="emit('dragEnd', $event)">
		<div v-if="highlightElement.pageIndex === index" class="relative">
			<div class="border border-transparent shadow-sm" :style="{
				width: highlightElement.width + 'px',
				height: highlightElement.height + 'px',
				backgroundColor: highlightElement.color,
				opacity: highlightElement.opacity
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
	highlightElement: { x: number; y: number; width: number; height: number; color: string; opacity: number; pageIndex: number };
	index: any;
}>()
</script>
