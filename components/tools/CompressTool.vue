<template>
  <div class="space-y-5 p-6 bg-white shadow-md rounded-lg mt-6 max-w-full mx-auto">
    <div>
      <label class="block text-lg font-semibold text-gray-800">Compress PDF</label>
      <div class="mt-4 space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-600">Compression Level</label>
          <select
            v-model="compressionLevel"
            class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="low">Low (Better Quality)</option>
            <option value="medium">Medium (Balanced)</option>
            <option value="high">High (Smaller Size)</option>
          </select>
        </div>

        <div class="space-y-2">
          <label class="flex items-center">
            <input
              v-model="options.compressImages"
              type="checkbox"
              class="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span class="ml-2 text-sm text-gray-600">Compress Images</span>
          </label>

          <label class="flex items-center">
            <input
              v-model="options.removeMetadata"
              type="checkbox"
              class="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span class="ml-2 text-sm text-gray-600">Remove Metadata</span>
          </label>
        </div>

        <div v-if="options.compressImages">
          <label class="block text-sm font-medium text-gray-600">Image Quality</label>
          <div class="flex items-center gap-4 mt-2">
            <input
              v-model="imageQuality"
              type="range"
              min="1"
              max="100"
              step="1"
              class="flex-1 h-2 rounded-lg bg-gray-200 appearance-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
            <span class="text-lg text-gray-700">{{ imageQuality }}%</span>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-4">
      <div v-if="originalSize" class="text-sm text-gray-600">
        Original Size: {{ formatFileSize(originalSize) }}
      </div>
      <div v-if="compressedSize" class="text-sm text-gray-600">
        Compressed Size: {{ formatFileSize(compressedSize) }}
        ({{ calculateReduction }}% reduction)
      </div>
    </div>

    <p class="text-sm text-gray-600 italic mt-2">
      Compress your PDF file to reduce its size while maintaining readability.
    </p>

    <div class="flex gap-4 mt-6">
      <button
        @click="compressPDF"
        :disabled="isCompressing"
        class="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 transition-all text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        {{ isCompressing ? 'Compressing...' : 'Compress PDF' }}
      </button>
    </div>

    <div v-if="error" class="text-red-600 text-sm mt-2">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { PDFDocument } from 'pdf-lib'

const props = defineProps<{
  pdf?: PDFDocument | null
}>()

const emit = defineEmits(['update:pdf'])

const compressionLevel = ref('medium')
const imageQuality = ref(75)
const isCompressing = ref(false)
const error = ref('')
const originalSize = ref<number>(0)
const compressedSize = ref<number>(0)

const options = ref({
  compressImages: true,
  removeMetadata: false
})

const calculateReduction = computed(() => {
  if (!originalSize.value || !compressedSize.value) return 0
  const reduction = ((originalSize.value - compressedSize.value) / originalSize.value) * 100
  return Math.round(reduction)
})

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getCompressionSettings = () => {
  switch (compressionLevel.value) {
    case 'low':
      return { imageQuality: Math.max(imageQuality.value, 85) }
    case 'medium':
      return { imageQuality: Math.max(imageQuality.value, 60) }
    case 'high':
      return { imageQuality: Math.max(imageQuality.value, 30) }
    default:
      return { imageQuality: imageQuality.value }
  }
}

const compressPDF = async () => {
  if (!props.pdf) return

  try {
    isCompressing.value = true
    error.value = ''

    // Get original size
    const originalBytes = await props.pdf.save()
    originalSize.value = originalBytes.length

    // Create a new PDF document
    const compressedPdf = await PDFDocument.load(originalBytes)
    
    if (options.value.removeMetadata) {
      compressedPdf.setTitle('')
      compressedPdf.setAuthor('')
      compressedPdf.setSubject('')
      compressedPdf.setKeywords('')
      compressedPdf.setCreator('')
      compressedPdf.setProducer('')
    }

    // Save with compression
    const settings = getCompressionSettings()
    const compressedBytes = await compressedPdf.save({
      useObjectStreams: true,
      addDefaultPage: false,
      useCompression: true
    })
    
    compressedSize.value = compressedBytes.length
    
    // Only update if we achieved compression
    if (compressedSize.value < originalSize.value) {
      emit('update:pdf', compressedPdf)
    } else {
      error.value = 'Could not compress the PDF further'
    }
  } catch (e) {
    error.value = 'Failed to compress PDF. Please try again.'
    console.error('Error compressing PDF:', e)
  } finally {
    isCompressing.value = false
  }
}
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