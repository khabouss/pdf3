<template>
  <div class="space-y-5 p-6 bg-white shadow-md rounded-lg mt-6 max-w-full mx-auto">
    <div>
      <label class="block text-lg font-semibold text-gray-800">Reorder Pages</label>
      <p class="text-sm text-gray-600 mt-2">
        Drag and drop pages to reorder them. Changes will be applied immediately.
      </p>
    </div>

    <div class="space-y-4">
      <draggable
        v-model="pages"
        class="grid grid-cols-2 sm:grid-cols-3 gap-4"
        ghost-class="opacity-50"
        @end="handleReorder"
      >
        <div
          v-for="(page, index) in pages"
          :key="index"
          class="relative aspect-[1/1.4] border rounded-lg overflow-hidden cursor-move hover:shadow-lg transition-shadow"
        >
          <!-- Page Preview -->
          <div class="absolute inset-0 bg-gray-50 flex items-center justify-center">
            <canvas
              :ref="el => { if (el) pageCanvases[index] = el }"
              class="w-full h-full"
              width="200"
              height="280"
            ></canvas>
          </div>
          
          <!-- Page Number -->
          <div class="absolute top-2 left-2 bg-white/80 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium text-gray-600">
            Page {{ index + 1 }}
          </div>
        </div>
      </draggable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import draggable from 'vuedraggable'
import * as PDFJS from 'pdfjs-dist'
import { PDFDocument } from 'pdf-lib'

const props = defineProps<{
  pdf?: PDFDocument | null
}>()

const emit = defineEmits(['update:pdf'])

const pages = ref<number[]>([])
const pageCanvases = ref<{ [key: number]: HTMLCanvasElement }>({})

// Initialize PDF.js worker if not already initialized
if (!PDFJS.GlobalWorkerOptions.workerSrc) {
  const workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.js', import.meta.url).href
  PDFJS.GlobalWorkerOptions.workerSrc = workerSrc
}

// Initialize pages array
onMounted(async () => {
  if (props.pdf) {
    pages.value = Array.from({ length: props.pdf.getPageCount() }, (_, i) => i)
    await renderPagePreviews()
  }
})

// Re-render previews when pages are reordered
watch(pages, async () => {
  await renderPagePreviews()
}, { deep: true })

// Render page previews using PDF.js
const renderPagePreviews = async () => {
  try {
    if (!props.pdf) return
    
    const pdfBytes = await props.pdf.save()
    const pdfDoc = await PDFJS.getDocument({ data: pdfBytes }).promise

    for (const [index, pageNum] of pages.value.entries()) {
      const canvas = pageCanvases.value[index]
      if (!canvas) continue

      const page = await pdfDoc.getPage(pageNum + 1)
      const viewport = page.getViewport({ scale: canvas.width / page.getViewport({ scale: 1 }).width })
      const context = canvas.getContext('2d')

      if (context) {
        await page.render({
          canvasContext: context,
          viewport
        }).promise
      }
    }
  } catch (error) {
    console.error('Error rendering page previews:', error)
  }
}

// Handle page reordering
const handleReorder = async () => {
  try {
    if (!props.pdf) return
    
    // Create a new PDF with reordered pages
    const newPdf = await PDFDocument.create()
    const copiedPages = await newPdf.copyPages(props.pdf, pages.value)
    copiedPages.forEach(page => newPdf.addPage(page))
    
    // Emit the updated PDF
    emit('update:pdf', newPdf)
  } catch (error) {
    console.error('Error reordering pages:', error)
  }
}
</script>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
}

.aspect {
  aspect-ratio: 1/1.4;
}
</style>