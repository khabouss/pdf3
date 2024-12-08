<template>
  <div class="space-y-5 p-6 bg-white shadow-md rounded-lg mt-6 max-w-full mx-auto">
    <div>
      <label class="block text-lg font-semibold text-gray-800">Drawing Settings</label>
      
      <div class="mt-4">
        <label class="block text-sm font-medium text-gray-600">Brush Size</label>
        <div class="flex items-center gap-4 mt-2">
          <input
            v-model="drawSettings.brushSize"
            type="range"
            min="1"
            max="20"
            step="1"
            class="flex-1 h-2 rounded-lg bg-gray-200 appearance-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
          <span class="text-lg text-gray-700">{{ drawSettings.brushSize }}px</span>
        </div>
      </div>

      <div class="mt-4">
        <label class="block text-sm font-medium text-gray-600">Color</label>
        <div class="flex items-center gap-4 mt-2">
          <input
            v-model="drawSettings.color"
            type="color"
            class="w-10 h-10 rounded-full border-2 border-gray-300 shadow-md focus:ring-2 focus:ring-indigo-500 transition-all"
          />
          <span class="text-lg text-gray-700">Choose Color</span>
        </div>
      </div>

      <div class="mt-4">
        <label class="block text-sm font-medium text-gray-600">Opacity</label>
        <div class="flex items-center gap-4 mt-2">
          <input
            v-model="drawSettings.opacity"
            type="range"
            min="0"
            max="1"
            step="0.1"
            class="flex-1 h-2 rounded-lg bg-gray-200 appearance-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
          <span class="text-lg text-gray-700">{{ Math.round(drawSettings.opacity * 100) }}%</span>
        </div>
      </div>
    </div>

    <div class="mt-6">
      <div class="flex gap-4">
        <button
          @click="startDrawing"
          class="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 transition-all text-lg flex items-center justify-center gap-3"
          :class="{ 'bg-green-600 hover:bg-green-700': isDrawing }"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              :d="isDrawing ? 'M5 13l4 4L19 7' : 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z'" />
          </svg>
          {{ isDrawing ? 'Finish Drawing' : 'Start Drawing' }}
        </button>
      </div>
    </div>

    <p class="text-sm text-gray-600 italic mt-2">
      Click "Start Drawing" to begin drawing on the current page. Click "Finish Drawing" when done.
    </p>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';

const eventBus = useNuxtApp().$eventBus as any;

const drawSettings = ref({
  brushSize: 2,
  color: '#000000',
  opacity: 1,
});

const isDrawing = ref(false);

const startDrawing = () => {
  isDrawing.value = !isDrawing.value;
  eventBus.emit('toggleDrawing', {
    isDrawing: isDrawing.value,
    settings: { ...drawSettings.value }
  });
};

watch(drawSettings, (newSettings) => {
  if (isDrawing.value) {
    eventBus.emit('updateDrawSettings', { ...newSettings });
  }
}, { deep: true });

onBeforeUnmount(() => {
  if (isDrawing.value) {
    eventBus.emit('toggleDrawing', { isDrawing: false });
  }
});
</script>

<style scoped>
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  background: #e5e7eb;
  border-radius: 4px;
  outline: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: #4f46e5;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
}

input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

input[type="color"] {
  -webkit-appearance: none;
  padding: 0;
  border: none;
  border-radius: 50%;
  cursor: pointer;
}

input[type="color"]::-webkit-color-swatch-wrapper {
  padding: 0;
  border-radius: 50%;
}

input[type="color"]::-webkit-color-swatch {
  border: none;
  border-radius: 50%;
}

button {
  transition: all 0.3s ease;
}

button:hover {
  transform: scale(1.05);
}
</style>