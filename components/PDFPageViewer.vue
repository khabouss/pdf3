<!-- PDF page viewer with page management -->
<template>
  <div class="space-y-4">
    <!-- Page List -->
    <div class="space-y-4">
      <div v-for="(_, index) in pageCount" :key="index" :ref="el => { if (el) pageRefs[index] = el }"
        :data-page-index="index"
        class="relative group border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col items-center"
        :class="{
          'bg-white': currentPage !== index,
          'bg-indigo-50 border-indigo-200': currentPage === index
        }">
        <!-- Page Preview -->
        <div class="flex flex-col items-center self-start ml-2" :class="{ 'self-center': isMobile || isLarge }">
          <div class="py-3 text-center w-fit">
            <div class="">
              <button @click="removePage(index)"
                class="text-gray-400 hover:text-red-600 transition-colors rounded-full hover:bg-red-50">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
            <span class="text-gray-400 font-medium">{{ index + 1 }}</span>
          </div>

          <div class="flex-1 p-3">
            <div id="pdfContainer"
              class="w-[595px] h-[842px]  bg-transparent relative origin-top-left border shadow-sm transform-gpu cursor-pointer"
              :ref="el => { if (el) pageRefs[index] = el }" :data-page-container-index="index">
              <div v-for="(textElement, index2) in textElements" :key="index2"
                class="absolute cursor-move bg-transparent" :style="{
                  top: textElement.y + 'px',
                  left: textElement.x + 'px',
                }" draggable="true" @dragstart="onDragStart(index2, $event)" @dragend="onDragEnd(index2, $event)">
                <div v-if="textElement.pageIndex === index" class="p-2 border rounded-md shadow-md relative"
                  :style="{ fontSize: textElement.fontSize + 'px', color: textElement.color, lineHeight: textElement.lineHeight }">
                  {{ textElement.content }}
                  <!-- Delete Button -->
                  <button class="absolute -top-[10px] -right-[10px] bg-red-500 text-white rounded-full px-2 py-1 text-xs"
                    @click="deleteTextElement(index2)">
                    X
                  </button>
                </div>
              </div>


              <canvas id="contentCanvas" :width="595" :height="842" class="w-full h-full"></canvas>

            </div>
          </div>
        </div>

      </div>

      <!-- Action Buttons -->
      <div class="flex space-x-4" id="bottom-action-buttons">
        <!-- Add Blank Page Button -->
        <button @click="$emit('add-blank-page')"
          class="flex-1 p-4 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center gap-2 text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Add Blank Page</span>
        </button>

        <!-- Add PDF Button -->
        <button @click="$emit('add-pdf')"
          class="flex-1 p-4 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center gap-2 text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <span>Upload PDF</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { PDFDocument, rgb } from 'pdf-lib'
import * as PDFJS from 'pdfjs-dist'
import { useWindowSize } from '@vueuse/core'
import { useThrottleFn, useElementBounding, useIntersectionObserver } from '@vueuse/core'

// Initialize PDF.js worker
const workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.js', import.meta.url).href
PDFJS.GlobalWorkerOptions.workerSrc = workerSrc

const props = defineProps<{
  pdf: Object | null
  toolsRef: any
}>()

const { width } = useWindowSize()
const isMobile = computed(() => width.value < 1024)
const isLarge = computed(() => width.value >= 1400)

const emit = defineEmits(['remove:pdf', 'update:pdf', 'add-blank-page', 'add-pdf', 'pdf-error'])
const eventBus = useNuxtApp().$eventBus as any;

const pageRefs = ref<{ [key: number]: Element | ComponentPublicInstance }>({})
const renderedPages = ref(new Set<number>())
const currentPage = ref<number>(0)
const textElements = ref<{ [key: string]: { x: number; y: number; content: string; fontSize: string; color: string; pageIndex: number, lineHeight: string } }>({})
const pageCount = computed(() => (props.pdf as PDFDocument)?.getPageCount())

// Cache for loaded PDFs to prevent repeated loading
let loadedPdfDoc: any = null
let pdfBytes: Uint8Array | null | undefined = null

// Cleanup function to release resources
const cleanup = () => {
  renderedPages.value.clear()
  if (loadedPdfDoc) {
    loadedPdfDoc.destroy()
    loadedPdfDoc = null
  }
  pdfBytes = null
}

const dragStartPos = ref({ x: 0, y: 0 });

function onDragStart(index: number | string, event: any) {
  const pdfContainer = document.getElementById("pdfContainer");
  if (pdfContainer === null) return;
  const drawRect = pdfContainer.getBoundingClientRect();

  dragStartPos.value = {
    x: event.clientX - textElements.value[index].x - drawRect.left,
    y: event.clientY - textElements.value[index].y - drawRect.top,
  };
}

function deleteTextElement(key: string|number) {
  delete textElements.value[key]
}

function onDragEnd(index: number | string, event: any) {
  const pdfContainer = document.getElementById("pdfContainer");
  if (pdfContainer === null) return;
  const drawRect = pdfContainer.getBoundingClientRect();

  const newLeft = event.clientX - dragStartPos.value.x - drawRect.left;
  const newTop = event.clientY - dragStartPos.value.y - drawRect.top;

  textElements.value[index].x = newLeft;
  textElements.value[index].y = newTop;
}

const renderPage = async (pageIndex: number) => {
  if (renderedPages.value.has(pageIndex)) return

  const pageElement = pageRefs.value[pageIndex]
  if (!pageElement) return

  const canvas = (pageElement as Element).querySelector('#contentCanvas')
  if (!canvas || !(canvas instanceof HTMLCanvasElement)) return

  try {
    if (!loadedPdfDoc) {
      pdfBytes = await (props.pdf as PDFDocument)?.save()
      loadedPdfDoc = await PDFJS.getDocument({
        data: pdfBytes,
        useWorkerFetch: true,
        isEvalSupported: false,
        useSystemFonts: true
      }).promise
    }

    const page = await loadedPdfDoc.getPage(pageIndex + 1)
    const scale = Math.min(
      canvas.width / page.getViewport({ scale: 1 }).width,
      canvas.height / page.getViewport({ scale: 1 }).height
    )
    const viewport = page.getViewport({ scale })
    const context = canvas.getContext('2d')

    if (context) {
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise
    }
    renderedPages.value.add(pageIndex)
  } catch (error) {
    console.error('Error rendering page:', error)
  }
}

// Throttled render function to prevent too many simultaneous renders
const throttledRender = useThrottleFn(renderPage, 100)

watch(() => (props.pdf as PDFDocument), async () => {
  // Re-render all pages when PDF changes
  cleanup()
  // Initial render of visible pages
  Object.keys(pageRefs.value).forEach(index => {
    throttledRender(parseInt(index))
  })
}, { deep: true })

// Set up intersection observer for lazy loading
const observerCallback = async (entries: IntersectionObserverEntry[]) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      const pageIndex = parseInt(entry.target.getAttribute('data-page-index') || '-1')
      if (pageIndex >= 0) {
        currentPage.value = pageIndex
        throttledRender(pageIndex)
      }
    }
  }
}

const observer = new IntersectionObserver(observerCallback, {
  root: null,
  rootMargin: '0px',
  threshold: [0.1, 0.5, 0.9]
})

const removePage = async (pageIndex: number) => {
  try {
    if (!(props.pdf as PDFDocument) || (props.pdf as PDFDocument).getPageCount() <= 1) {
      console.warn('Cannot remove the last page')
      return
    }
    emit('remove:pdf', pageIndex);
  } catch (error) {
    console.error('Error removing page:', error)
  }
}

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 }
}

const addTextToPage = async (pageIndex: number, settings: any) => {
  const textId = `text-${Date.now()}-${Math.random()}`
  textElements.value[textId] = {
    x: 50,
    y: 50,
    content: settings.content,
    fontSize: settings.fontSize,
    color: settings.color,
    lineHeight: settings.lineHeight,
    pageIndex
  }
}

const getPageTextElements = (pageIndex: number) => {
  return Object.entries(textElements.value).reduce((acc, [id, text]) => {
    if (text.pageIndex === pageIndex) {
      acc[id] = text
    }
    return acc
  }, {} as typeof textElements.value)
}

const updatePDFWithText = async () => {
  const pages = (props.pdf as PDFDocument).getPages();
  pages.forEach((page, pageIndex) => {
    const pageTexts = getPageTextElements(pageIndex)
    textElements.value = {};
    Object.values(pageTexts).forEach(text => {
      const { r, g, b } = hexToRgb(text.color)
      page.drawText(text.content, {
        x: text.x,
        y: page.getHeight() - text.y,
        size: parseInt(text.fontSize, 10),
        color: rgb(r / 255, g / 255, b / 255),
        lineHeight: parseInt(text.lineHeight, 10)
      })
    })
  });

  // const newPdf = await PDFDocument.create()
  // if (!(props.pdf as PDFDocument)) {
  //   throw new Error("pdf is undefined or null in PDFPageViewer");
  // }
  // const pages = await newPdf.copyPages((props.pdf as PDFDocument), [0, 1]) //(props.pdf as PDFDocument).getPageIndices()

  // pages.forEach((page, pageIndex) => {
  //   const pageTexts = getPageTextElements(pageIndex)

  //   Object.values(pageTexts).forEach(text => {
  //     const { r, g, b } = hexToRgb(text.color)
  //     page.drawText(text.content, {
  //       x: text.x,
  //       y: 50,
  //       size: 23,
  //       color: rgb(r / 255, g / 255, b / 255),
  //       lineHeight: 1.2
  //     })
  //   })
  //   newPdf.addPage(page)
  // })

  // emit('update:pdf', newPdf)
}

onMounted(() => {
  eventBus.on('addTextToPDF', (data: any) => {
    if (data.isCurrentPage) {
      addTextToPage(currentPage.value, data.settings)
    }
  });
  // Let the intersection observer handle initial rendering
  Object.entries(pageRefs.value).forEach(([index, element]) => {
    observer.observe(element as Element)
  })
})

onBeforeUnmount(() => {
  eventBus.off('addTextToPDF');
  cleanup()
  observer.disconnect()
})

defineExpose({
  updatePDFWithText
})
</script>

<style></style>