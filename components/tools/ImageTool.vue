<template>
  <div class="space-y-5 p-6 bg-white shadow-md rounded-lg mt-6 max-w-full mx-auto">
    <div>
      <label class="block text-lg font-semibold text-gray-800">Upload Image</label>
      <input
        type="file"
        accept="image/*"
        @change="handleImageUpload"
        class="mt-2 block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-indigo-50 file:text-indigo-700
          hover:file:bg-indigo-100"
      />
    </div>

    <div v-if="imagePreview">
      <label class="block text-lg font-semibold text-gray-800">Preview</label>
      <img
        :src="imagePreview"
        class="mt-2 max-w-full h-auto max-h-48 rounded-lg border border-gray-200"
        alt="Image preview"
      />
    </div>

    <div>
      <label class="block text-lg font-semibold text-gray-800">Image Size</label>
      <div class="flex items-center gap-4 mt-2">
        <input
          v-model="imageSettings.width"
          type="range"
          min="50"
          max="500"
          step="10"
          class="flex-1 h-2 rounded-lg bg-gray-200 appearance-none focus:ring-2 focus:ring-indigo-500 transition-all"
        />
        <span class="text-lg text-gray-700">{{ imageSettings.width }}px</span>
      </div>
    </div>

    <div>
      <label class="block text-lg font-semibold text-gray-800">Position</label>
      <div class="grid grid-cols-2 gap-4 mt-2">
        <div>
          <label class="block text-sm font-medium text-gray-600">X Position</label>
          <input
            v-model.number="imageSettings.x"
            type="number"
            min="0"
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600">Y Position</label>
          <input
            v-model.number="imageSettings.y"
            type="number"
            min="0"
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>
    </div>

    <p class="text-sm text-gray-600 italic mt-2">
      Upload an image and customize its size and position on the page.
    </p>

    <div class="flex gap-4 mt-6">
      <button
        @click="addImageToCurrentPage"
        :disabled="!imageData"
        class="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 transition-all text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
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

const imageSettings = ref({
  width: 200,
  x: 50,
  y: 50,
});

const imagePreview = ref<string | null>(null);
const imageData = ref<Uint8Array | null>(null);

const handleImageUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  
  if (file) {
    // Create preview URL
    imagePreview.value = URL.createObjectURL(file);
    
    // Convert image to bytes
    const arrayBuffer = await file.arrayBuffer();
    imageData.value = new Uint8Array(arrayBuffer);
  }
};

const addImageToCurrentPage = () => {
  if (imageData.value) {
    if (typeof imageSettings.value.width === 'number') {
      imageSettings.value.width = parseInt(imageSettings.value.width as any);
    }
    eventBus.emit('addImageToPDF', {
      settings: {
        imageData: imageData.value,
        ...imageSettings.value
      },
      isCurrentPage: true
    });
  }
};

// Cleanup preview URL when component is unmounted
onBeforeUnmount(() => {
  if (imagePreview.value) {
    URL.revokeObjectURL(imagePreview.value);
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

button {
  transition: all 0.3s ease;
}

button:not(:disabled):hover {
  transform: scale(1.05);
}
</style>