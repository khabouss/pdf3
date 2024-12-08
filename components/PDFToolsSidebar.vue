<template>
  <div class="fixed z-50 lg:right-4 lg:top-24 lg:w-[370px]" :class="{
    'inset-x-0 bottom-0': isMobile,
    'bg-white rounded-lg shadow-lg': true
  }" :style="{
    'transition': 'transform 0.3s ease-in-out',
    'transform': isOpen || !isMobile ? 'translateY(0)' : 'translateY(100%)'
  }">
    <div v-if="isMobile" class=" inset-x-0 h-7 bg-white rounded-t-lg flex items-center justify-center cursor-pointer"
      @click="closePopup" @mousedown="startDrag" @mouseup="endDrag" @mousemove="onDrag">
      <div class="w-12 h-1 bg-gray-300 rounded-full"></div>
    </div>

    <div class="p-4 space-y-4">
      <h3 class="text-lg font-medium text-gray-900">PDF Tools</h3>

      <!-- Tools List -->
      <div id="sidebar" class="space-y-2 max-h-[60vh] overflow-y-auto">
        <div v-for="tool in pdfTools">
          <button :key="tool.id" @click="activeTool = activeTool === tool.id ? null : tool.id"
            class="w-full flex items-center px-3 py-2 text-sm rounded-md cursor-pointer"
            :class="activeTool === tool.id ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'">
            <span class="flex-1 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="tool.icon" />
              </svg>
              {{ tool.name }}
            </span>
            <svg v-if="hasSettings(tool.id)" class="w-5 h-5" :class="activeTool === tool.id ? 'rotate-180' : ''"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div v-if="activeTool === tool.id">
            <component :is="loadToolComponent(tool.id)" :key="tool.id" :pdf="props.pdf" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useWindowSize } from '@vueuse/core'
import { pdfTools } from './tools/PDFTools'
import TextTool from '@/components/tools/TextTool.vue';
import ImageTool from './tools/ImageTool.vue';
import WhiteoutTool from './tools/WhiteoutTool.vue';
import LinksTool from './tools/LinksTool.vue';
import HighlightTool from './tools/HighlightTool.vue';
import DrawTool from './tools/DrawTool.vue';
import ReorderTool from './tools/ReorderTool.vue';
import ProtectTool from './tools/ProtectTool.vue';
import ShapesTool from './tools/ShapesTool.vue';
import CompressTool from './tools/CompressTool.vue';
import MetadataTool from './tools/MetadataTool.vue';

const eventBus = useNuxtApp().$eventBus as any;

const { width } = useWindowSize()
const isMobile = computed(() => width.value < 1024)
const isDragging = ref(false);
const startY = ref(0);
const currentY = ref(0);

const props = defineProps<{
  isOpen: boolean
  currentPage?: number
  toolsRef?: any,
  pdf?: PDFDocument | null
}>()

const emit = defineEmits(['update:closePopup'])

const activeTool = ref<string | null>(null)

// Emit the event when the div is clicked
const closePopup = () => {
  // Emits the update:closePopup event to the parent
  emit('update:closePopup');
};

// Start tracking the drag
const startDrag = (event: any) => {
  isDragging.value = true;
  startY.value = event.clientY; // Capture the starting Y position of the drag
};

// End tracking the drag
const endDrag = () => {
  isDragging.value = false;
  startY.value = 0;
  currentY.value = 0;
};

// Handle dragging events
const onDrag = (event: any) => {
  if (isDragging.value) {
    currentY.value = event.clientY;

    // Detect a drag from top to bottom (positive Y direction)
    if (currentY.value > startY.value) {
      emit('update:closePopup');
      endDrag(); // End the drag after the event is emitted
    }
  }
};


const loadToolComponent = (id: string) => {
  switch (id) {
    case 'text':
      return TextTool;
    case 'image':
      return ImageTool;
    case 'whiteout':
      return WhiteoutTool;
    case 'highlight':
      return HighlightTool;
    case 'links':
      return LinksTool;
    case 'reorder':
      return ReorderTool;
    case 'protect':
      return ProtectTool;
    case 'draw':
      return DrawTool;
    case 'shapes':
      return ShapesTool;
    case 'metadata':
      return MetadataTool;
    case 'compress':
      return CompressTool;
    // Add cases for all tools
    default:
      return null;
  }
};

const hasSettings = (toolId: string): boolean => {
  // Add more tools that have settings panels
  return ['text', 'image', 'whiteout', 'highlight', 'draw', 'shapes', 'links', 'reorder', 'protect', 'metadata', 'compress'].includes(toolId)
}

onMounted(() => {
  eventBus.on('addTextToPDF', (data: any) => {
    activeTool.value = null;
    const sidebarElement = document.getElementById('sidebar');

    if (sidebarElement === null) return;
    sidebarElement.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  });
})

defineExpose({
  activeTool,
})
</script>