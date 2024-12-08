<template>
  <div class="space-y-5 p-6 bg-white shadow-md rounded-lg mt-6 max-w-full mx-auto">
    <div>
      <label class="block text-lg font-semibold text-gray-800">Shape Type</label>
      <select
        v-model="shapeSettings.type"
        class="mt-2 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
      >
        <option value="rectangle">Rectangle</option>
        <option value="circle">Circle</option>
        <option value="line">Line</option>
        <option value="arrow">Arrow</option>
      </select>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <template v-if="shapeSettings.type !== 'line' && shapeSettings.type !== 'arrow'">
        <div>
          <label class="block text-sm font-medium text-gray-600">Width</label>
          <input
            v-model.number="shapeSettings.width"
            type="number"
            min="10"
            max="500"
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600">Height</label>
          <input
            v-model.number="shapeSettings.height"
            type="number"
            min="10"
            max="500"
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </template>

      <template v-else>
        <div>
          <label class="block text-sm font-medium text-gray-600">Length</label>
          <input
            v-model.number="shapeSettings.length"
            type="number"
            min="10"
            max="500"
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600">Angle (degrees)</label>
          <input
            v-model.number="shapeSettings.angle"
            type="number"
            min="0"
            max="360"
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </template>

      <div>
        <label class="block text-sm font-medium text-gray-600">X Position</label>
        <input
          v-model.number="shapeSettings.x"
          type="number"
          min="0"
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-600">Y Position</label>
        <input
          v-model.number="shapeSettings.y"
          type="number"
          min="0"
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-600">Line Width</label>
      <div class="flex items-center gap-4 mt-2">
        <input
          v-model="shapeSettings.lineWidth"
          type="range"
          min="1"
          max="10"
          step="1"
          class="flex-1 h-2 rounded-lg bg-gray-200 appearance-none focus:ring-2 focus:ring-indigo-500 transition-all"
        />
        <span class="text-lg text-gray-700">{{ shapeSettings.lineWidth }}px</span>
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-600">Color</label>
      <div class="flex items-center gap-4 mt-2">
        <input
          v-model="shapeSettings.color"
          type="color"
          class="w-10 h-10 rounded-full border-2 border-gray-300 shadow-md focus:ring-2 focus:ring-indigo-500 transition-all"
        />
        <span class="text-lg text-gray-700">Choose Color</span>
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-600">Fill Shape</label>
      <div class="flex items-center gap-2 mt-2">
        <input
          v-model="shapeSettings.fill"
          type="checkbox"
          class="rounded text-indigo-600 focus:ring-indigo-500"
          :disabled="shapeSettings.type === 'line' || shapeSettings.type === 'arrow'"
        />
        <span class="text-sm text-gray-600">Fill with color</span>
      </div>
    </div>

    <div class="flex gap-4 mt-6">
      <button
        @click="addShapeToCurrentPage"
        class="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 transition-all text-lg flex items-center justify-center gap-3"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add to Current Page
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';

const eventBus = useNuxtApp().$eventBus as any;

const shapeSettings = ref({
  type: 'rectangle',
  width: 100,
  height: 60,
  length: 100,
  angle: 0,
  x: 50,
  y: 50,
  lineWidth: 2,
  color: '#000000',
  fill: false
});

const addShapeToCurrentPage = () => {
  eventBus.emit('addShapeToPDF', {
    settings: { ...shapeSettings.value },
    isCurrentPage: true
  });
};
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