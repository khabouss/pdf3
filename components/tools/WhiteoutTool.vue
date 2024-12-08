<template>
  <div class="space-y-5 p-6 bg-white shadow-md rounded-lg mt-6 max-w-full mx-auto">
    <div>
      <label class="block text-lg font-semibold text-gray-800">Whiteout Rectangle</label>
      <div class="grid grid-cols-2 gap-4 mt-4">
        <div>
          <label class="block text-sm font-medium text-gray-600">Width</label>
          <input
            v-model.number="whiteoutSettings.width"
            type="number"
            min="10"
            max="500"
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600">Height</label>
          <input
            v-model.number="whiteoutSettings.height"
            type="number"
            min="10"
            max="500"
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600">X Position</label>
          <input
            v-model.number="whiteoutSettings.x"
            type="number"
            min="0"
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600">Y Position</label>
          <input
            v-model.number="whiteoutSettings.y"
            type="number"
            min="0"
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>
    </div>

    <div>
      <label class="block text-lg font-semibold text-gray-800">Opacity</label>
      <div class="flex items-center gap-4 mt-2">
        <input
          v-model="whiteoutSettings.opacity"
          type="range"
          min="0"
          max="1"
          step="0.1"
          class="flex-1 h-2 rounded-lg bg-gray-200 appearance-none focus:ring-2 focus:ring-indigo-500 transition-all"
        />
        <span class="text-lg text-gray-700">{{ Math.round(whiteoutSettings.opacity * 100) }}%</span>
      </div>
    </div>

    <p class="text-sm text-gray-600 italic mt-2">
      Add a white rectangle to cover existing content on the page.
    </p>

    <div class="flex gap-4 mt-6">
      <button
        @click="addWhiteoutToCurrentPage"
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
import { ref } from 'vue';

const eventBus = useNuxtApp().$eventBus as any;

const whiteoutSettings = ref({
  width: 100,
  height: 50,
  x: 50,
  y: 50,
  opacity: 1
});

const addWhiteoutToCurrentPage = () => {
  eventBus.emit('addWhiteoutToPDF', {
    settings: { ...whiteoutSettings.value },
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

button {
  transition: all 0.3s ease;
}

button:hover {
  transform: scale(1.05);
}
</style>