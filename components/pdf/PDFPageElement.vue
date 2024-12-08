<!-- Generic component for PDF page elements -->
<template>
  <div
    class="absolute cursor-move bg-transparent"
    :style="{
      top: `${y}px`,
      left: `${x}px`,
    }"
    draggable="true"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
  >
    <div v-if="isCurrentPage" class="relative">
      <slot></slot>
      <button
        class="absolute -top-[10px] -right-[10px] bg-red-500 text-white rounded-full px-2 py-1 text-xs"
        @click="$emit('delete')"
      >
        X
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PDFElement } from '~/types/pdf'

const props = defineProps<{
  element: PDFElement
  currentPage: number
}>()

const emit = defineEmits<{
  (e: 'update:position', x: number, y: number): void
  (e: 'delete'): void
}>()

const isCurrentPage = computed(() => props.element.pageIndex === props.currentPage)

const dragStartPos = ref({ x: 0, y: 0 })

function onDragStart(event: DragEvent) {
  const container = event.target?.closest('#pdfContainer')
  if (!container) return

  const rect = container.getBoundingClientRect()
  dragStartPos.value = {
    x: event.clientX - props.element.x - rect.left,
    y: event.clientY - props.element.y - rect.top
  }
}

function onDragEnd(event: DragEvent) {
  const container = event.target?.closest('#pdfContainer')
  if (!container) return

  const rect = container.getBoundingClientRect()
  const newX = event.clientX - dragStartPos.value.x - rect.left
  const newY = event.clientY - dragStartPos.value.y - rect.top

  emit('update:position', newX, newY)
}
</script>