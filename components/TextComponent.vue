<template>
	<div class="absolute cursor-move bg-transparent" :style="{
		top: textElement.y + 'px',
		left: textElement.x + 'px',
	}" draggable="true" @dragstart="emit('dragStart', $event)" @dragend="emit('dragEnd', $event)">
		<div v-if="textElement.pageIndex === index" class="p-2 border rounded-md shadow-md relative"
			:style="{ fontSize: textElement.fontSize + 'px', color: textElement.color, lineHeight: textElement.lineHeight }">
			{{ textElement.content }}
			<!-- Delete Button -->
			<button class="absolute -top-[10px] -right-[10px] bg-red-500 text-white rounded-full px-2 py-1 text-xs"
				@click="emit('deleteElement')">
				X
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
defineProps<{
	textElement: any,
	index: any
}>()
const emit = defineEmits(['dragStart', 'dragEnd', 'deleteElement'])
</script>