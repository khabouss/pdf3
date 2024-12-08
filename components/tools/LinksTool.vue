<template>
  <div class="space-y-5 p-6 bg-white shadow-md rounded-lg mt-6 max-w-full mx-auto">
    <div>
      <label class="block text-lg font-semibold text-gray-800">Add Hyperlink</label>
      <div class="mt-4 space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-600">URL</label>
          <input
            v-model="linkSettings.url"
            type="url"
            placeholder="https://example.com"
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-600">Width</label>
            <input
              v-model.number="linkSettings.width"
              type="number"
              min="10"
              max="500"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600">Height</label>
            <input
              v-model.number="linkSettings.height"
              type="number"
              min="10"
              max="500"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600">X Position</label>
            <input
              v-model.number="linkSettings.x"
              type="number"
              min="0"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600">Y Position</label>
            <input
              v-model.number="linkSettings.y"
              type="number"
              min="0"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>
      </div>
    </div>

    <p class="text-sm text-gray-600 italic mt-2">
      Add a clickable hyperlink area to the PDF. The link will be visible as a blue rectangle in the editor.
    </p>

    <div class="flex gap-4 mt-6">
      <button
        @click="addLinkToCurrentPage"
        :disabled="!isValidUrl"
        class="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 transition-all text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        Add Link
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const eventBus = useNuxtApp().$eventBus

const linkSettings = ref({
  url: '',
  width: 100,
  height: 30,
  x: 50,
  y: 50
})

const isValidUrl = computed(() => {
  try {
    new URL(linkSettings.value.url)
    return true
  } catch {
    return false
  }
})

const addLinkToCurrentPage = () => {
  if (!isValidUrl.value) return
  
  eventBus.emit('addLinkToPDF', {
    settings: { ...linkSettings.value },
    isCurrentPage: true
  })
}
</script>

<style scoped>
button {
  transition: all 0.3s ease;
}

button:not(:disabled):hover {
  transform: scale(1.05);
}
</style>