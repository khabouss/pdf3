<template>
  <div class="space-y-5 p-6 bg-white shadow-md rounded-lg mt-6 max-w-full mx-auto">
    <div>
      <label class="block text-lg font-semibold text-gray-800">Document Properties</label>
      <div class="mt-4 space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-600">Title</label>
          <input
            v-model="metadata.title"
            type="text"
            placeholder="Document title"
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-600">Author</label>
          <input
            v-model="metadata.author"
            type="text"
            placeholder="Document author"
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-600">Subject</label>
          <input
            v-model="metadata.subject"
            type="text"
            placeholder="Document subject"
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-600">Keywords</label>
          <input
            v-model="metadata.keywords"
            type="text"
            placeholder="Comma-separated keywords"
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-600">Creator</label>
          <input
            v-model="metadata.creator"
            type="text"
            placeholder="Application or tool used to create the document"
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-600">Producer</label>
          <input
            v-model="metadata.producer"
            type="text"
            placeholder="PDF producer"
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>
    </div>

    <p class="text-sm text-gray-600 italic mt-2">
      Edit document properties to improve organization and searchability.
    </p>

    <div class="flex gap-4 mt-6">
      <button
        @click="updateMetadata"
        class="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 transition-all text-lg flex items-center justify-center gap-3"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
        </svg>
        Update Metadata
      </button>
    </div>

    <div v-if="error" class="text-red-600 text-sm mt-2">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { PDFDocument } from 'pdf-lib'

const props = defineProps<{
  pdf?: PDFDocument | null
}>()

const emit = defineEmits(['update:pdf'])

const metadata = ref({
  title: '',
  author: '',
  subject: '',
  keywords: '',
  creator: '',
  producer: ''
})

const error = ref('')

onMounted(async () => {
  if (props.pdf) {
    // Load existing metadata
    metadata.value = {
      title: props.pdf.getTitle() || '',
      author: props.pdf.getAuthor() || '',
      subject: props.pdf.getSubject() || '',
      keywords: props.pdf.getKeywords() || '',
      creator: props.pdf.getCreator() || '',
      producer: props.pdf.getProducer() || ''
    }
  }
})

const updateMetadata = async () => {
  if (!props.pdf) return

  try {
    const pdfCopy = await PDFDocument.load(await props.pdf.save())
    
    // Update metadata
    pdfCopy.setTitle(metadata.value.title)
    pdfCopy.setAuthor(metadata.value.author)
    pdfCopy.setSubject(metadata.value.subject)
    pdfCopy.setKeywords(metadata.value.keywords)
    pdfCopy.setCreator(metadata.value.creator)
    pdfCopy.setProducer(metadata.value.producer)

    emit('update:pdf', pdfCopy)
    error.value = ''
  } catch (e) {
    error.value = 'Failed to update metadata. Please try again.'
    console.error('Error updating metadata:', e)
  }
}
</script>

<style scoped>
button {
  transition: all 0.3s ease;
}

button:hover {
  transform: scale(1.05);
}
</style>