<template>
  <div class="space-y-5 p-6 bg-white shadow-md rounded-lg mt-6 max-w-full mx-auto">
    <div>
      <label class="block text-lg font-semibold text-gray-800">Text</label>
      <textarea v-model="textSettings.content"
        class="mt-2 block w-full h-32 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-lg p-3 resize-none transition-all"
        placeholder="Enter text" :style="textStyle" rows="4" />
    </div>

    <div>
      <label class="block text-lg font-semibold text-gray-800">Font Size</label>
      <div class="flex items-center gap-4 mt-2">
        <input v-model="textSettings.fontSize" type="range" min="8" max="72" step="1"
          class="flex-1 h-2 rounded-lg bg-gray-200 appearance-none focus:ring-2 focus:ring-indigo-500 transition-all" />
        <span class="text-lg text-gray-700">{{ textSettings.fontSize }}px</span>
      </div>
    </div>

    <div>
      <label class="block text-lg font-semibold text-gray-800">Line Height</label>
      <div class="flex items-center gap-4 mt-2">
        <input v-model="textSettings.lineHeight" type="range" min="1" max="2.5" step="0.1"
          class="flex-1 h-2 rounded-lg bg-gray-200 appearance-none focus:ring-2 focus:ring-indigo-500 transition-all" />
        <span class="text-lg text-gray-700">{{ textSettings.lineHeight }}x</span>
      </div>
    </div>

    <div>
      <label class="block text-lg font-semibold text-gray-800">Text Color</label>
      <div class="flex items-center gap-4 mt-2">
        <input type="color" v-model="textSettings.color"
          class="w-10 h-10 rounded-full border-2 border-gray-300 shadow-md focus:ring-2 focus:ring-indigo-500 transition-all" />
        <span class="text-lg text-gray-700">Choose Color</span>
      </div>
    </div>

    <p class="text-sm text-gray-600 italic mt-2">
      Customize the text for either the current page or all pages.
    </p>

    <div class="flex gap-4 mt-6">
      <button @click="addTextToCurrentPage"
        class="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 transition-all text-lg flex items-center justify-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Current Page
      </button>

    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
const eventBus = useNuxtApp().$eventBus as any;

const textSettings = ref({
  content: '',
  fontSize: '16',
  color: '#000000',
  lineHeight: '1.5',
});

// Computed styles for the text preview
const textStyle = computed(() => {
  return {
    fontSize: `${textSettings.value.fontSize}px`,
    color: textSettings.value.color,
    lineHeight: textSettings.value.lineHeight,
    fontFamily: 'Arial, sans-serif',
  };
});

const addTextToCurrentPage = () => {
  eventBus.emit('addTextToPDF', { settings: textSettings.value, isCurrentPage: true });
};
</script>

<style scoped>
/* Compact and clean layout */
.bg-white {
  background-color: white;
}

.shadow-md {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.rounded-lg {
  border-radius: 0.5rem;
}

.max-w-full {
  max-width: 100%;
}

.mx-auto {
  margin-left: auto;
  margin-right: auto;
}

input[type="color"] {
  padding: 0;
  -webkit-appearance: none;
  appearance: none;
  border: none;
  cursor: pointer;
}

input[type="color"]:focus {
  outline: none;
}

textarea {
  resize: none;
  font-family: 'Arial', sans-serif;
  transition: all 0.2s ease-in-out;
}

button {
  transition: all 0.3s ease;
}

button:hover {
  transform: scale(1.05);
}
</style>
