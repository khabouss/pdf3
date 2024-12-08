<!-- PDF page viewer with page management -->
<template>
  <div class="space-y-4">

    <!-- Page List -->
    <div class="space-y-4">
      <div v-for="(_, index) in pageCount" :key="index" :ref="(el: any) => { if (el) pageRefs[index] = el }"
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
              :ref="(el: any) => { if (el) pageRefs[index] = el }" :data-page-container-index="index">

              <TextComponent v-for="(textElement, index2) in textElements" :key="index2"
                @drag-start="($event) => onDragStart(index2, $event, 'text')"
                @drag-end="($event) => onDragEnd(index2, $event, 'text')" @delete-element="deleteTextElement(index2)"
                :text-element="textElement" :index="index" />

              <ImageComponent v-for="(imageElement, index2) in imageElements" :key="index2"
                @resize-start="($event) => onResizeStart(index2, $event)"
                @drag-start="($event) => onDragStart(index2, $event, 'image')"
                @drag-end="($event) => onDragEnd(index2, $event, 'image')" @delete-element="deleteImageElement(index2)"
                :image-element="imageElement" :index="index" />

              <WhiteoutComponent v-for="(whiteoutElement, index2) in whiteoutElements" :key="index2"
                @drag-start="($event) => onDragStart(index2, $event, 'whiteout')"
                @drag-end="($event) => onDragEnd(index2, $event, 'whiteout')"
                @delete-element="deleteWhiteoutElement(index2)" :whiteout-element="whiteoutElement" :index="index" />

              <HighlightComponent v-for="(highlightElement, index2) in highlightElements" :key="index2"
                @drag-start="($event) => onDragStart(index2, $event, 'highlight')"
                @drag-end="($event) => onDragEnd(index2, $event, 'highlight')"
                @delete-element="deleteHighlightElement(index2)" :highlight-element="highlightElement" :index="index" />

              <canvas id="contentCanvas" :width="595" :height="842" class="w-full h-full"></canvas>

              <!-- Drawing Canvas -->
              <canvas v-if="isDrawingMode && currentPage === index" ref="drawCanvas"
                class="absolute top-0 left-0 w-full h-full cursor-crosshair" @mousedown="startPath"
                @mousemove="drawPath" @mouseup="endPath" @mouseleave="endPath"></canvas>

              <!-- Rendered Drawings -->
              <canvas v-for="(drawing, drawingId) in getPageDrawings(index)" :key="drawingId"
                :ref="(el: any) => { if (el) renderDrawing(el, drawing) }"
                class="absolute top-0 left-0 w-full h-full pointer-events-none"></canvas>

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
import { PDFDocument } from 'pdf-lib'
import * as PDFJS from 'pdfjs-dist'
import { useWindowSize } from '@vueuse/core'
import { useThrottleFn } from '@vueuse/core'
import { PDFContentUpdater } from '~/utils/pdfContentUpdater'
import TextComponent from './TextComponent.vue'
import ImageComponent from './ImageComponent.vue'
import HighlightComponent from './HighlightComponent.vue'

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

type ImageType = { x: number; y: number; width: number; imageData: Uint8Array; pageIndex: number }
type TextType = { x: number; y: number; content: string; fontSize: string; color: string; pageIndex: number, lineHeight: string }
type WithoutType = { x: number; y: number; width: number; height: number; opacity: number; pageIndex: number }
type LinkType = { x: number; y: number; width: number; height: number; url: string; pageIndex: number }
type HighlightType = { x: number; y: number; width: number; height: number; color: string; opacity: number; pageIndex: number }
type DrawType = { paths: { x: number; y: number }[][]; color: string; brushSize: number; opacity: number; pageIndex: number }
type ShapeType = { type: string; x: number; y: number; width?: number; height?: number; length?: number; angle?: number; lineWidth: number; color: string; fill: boolean; pageIndex: number }
type DraggableElementsType = 'text' | 'image' | 'whiteout' | 'link' | 'highlight' | 'shape';

const pageRefs = ref<{ [key: number]: Element | ComponentPublicInstance }>({})
const renderedPages = ref(new Set<number>())
const currentPage = ref<number>(0)
const textElements = ref<{ [key: string]: TextType }>({})
const imageElements = ref<{ [key: string]: ImageType }>({})
const whiteoutElements = ref<{ [key: string]: WithoutType }>({})
const linkElements = ref<{ [key: string]: LinkType }>({})
const highlightElements = ref<{ [key: string]: HighlightType }>({})
const drawElements = ref<{ [key: string]: DrawType }>({})
const shapeElements = ref<{ [key: string]: ShapeType }>({})
const isDrawingMode = ref(false)
const currentPath = ref<{ x: number; y: number }[]>([])
const drawSettings = ref({
  color: '#000000',
  brushSize: 2,
  opacity: 1
})
const pageCount = computed(() => (props.pdf as PDFDocument)?.getPageCount())
const draggableElements = {
  'text': textElements,
  'image': imageElements,
  'whiteout': whiteoutElements,
  'link': linkElements,
  'highlight': highlightElements,
  'shape': shapeElements,
};
const draggableElemebtsEvents = {
  'addTextToPDF': 'text',
  'addShapeToPDF': 'shape',
  'addImageToPDF': 'image',
  'addWhiteoutToPDF': 'whiteout',
  'addHighlightToPDF': 'highlight',
  'addLinkToPDF': 'link'
};

// Cache for loaded PDFs to prevent repeated loading
let loadedPdfDoc: any = null
let pdfBytes: Uint8Array | null | undefined = null

const isResizing = ref(false);
const resizeStartPos = reactive({ x: 0, y: 0 });
const activeIndexIMG = ref<null | string>(null);

// Cleanup function to release resources
const cleanup = () => {
  renderedPages.value.clear()
  clearDrawing()
  if (loadedPdfDoc) {
    loadedPdfDoc.destroy()
    loadedPdfDoc = null
  }
  pdfBytes = null
}

const onResizeStart = (index: any, event: any) => {
  isResizing.value = true;
  activeIndexIMG.value = index;
  resizeStartPos.x = event.clientX;
  resizeStartPos.y = event.clientY;

  document.addEventListener('mousemove', onResize);
  document.addEventListener('mouseup', onResizeEnd);
};

function modifyImageWidth(value: number) {
  const modifiedObject = {
    ...imageElements.value,
    [activeIndexIMG.value as string]: {
      ...imageElements.value[activeIndexIMG.value as string],
      width: imageElements.value[activeIndexIMG.value as string].width + value,
    },
  };
  imageElements.value = modifiedObject;
}

const onResize = (event: any) => {
  if (!isResizing.value) return;

  const deltaX = event.clientX - resizeStartPos.x;

  modifyImageWidth(deltaX);

  resizeStartPos.x = event.clientX;
  resizeStartPos.y = event.clientY;
};

const onResizeEnd = () => {
  isResizing.value = false;
  document.removeEventListener('mousemove', onResize);
  document.removeEventListener('mouseup', onResizeEnd);
};

const clearDrawing = () => {
  const canvas = document.querySelector('canvas[ref="drawCanvas"]') as HTMLCanvasElement;
  if (canvas) {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
}

const startPath = (event: MouseEvent) => {
  if (!isDrawingMode.value) return;

  const canvas = event.target as HTMLCanvasElement;
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  currentPath.value = [{ x, y }];
  drawOnCanvas(canvas, currentPath.value);
};

const drawPath = (event: MouseEvent) => {
  if (!isDrawingMode.value || currentPath.value.length === 0) return;

  const canvas = event.target as HTMLCanvasElement;
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  currentPath.value.push({ x, y });
  drawOnCanvas(canvas, currentPath.value);
};

const endPath = () => {
  if (!isDrawingMode.value || currentPath.value.length === 0) return;

  const drawingId = `drawing-${Date.now()}-${Math.random()}`;
  drawElements.value[drawingId] = {
    paths: [currentPath.value],
    color: drawSettings.value.color,
    brushSize: drawSettings.value.brushSize,
    opacity: drawSettings.value.opacity,
    pageIndex: currentPage.value
  };

  currentPath.value = [];
  clearDrawing();
};

const drawOnCanvas = (canvas: HTMLCanvasElement, path: { x: number; y: number }[]) => {
  const ctx = canvas.getContext('2d');
  if (!ctx || path.length < 2) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.moveTo(path[0].x, path[0].y);

  for (let i = 1; i < path.length; i++) {
    ctx.lineTo(path[i].x, path[i].y);
  }

  ctx.strokeStyle = drawSettings.value.color;
  ctx.lineWidth = drawSettings.value.brushSize;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.globalAlpha = drawSettings.value.opacity;
  ctx.stroke();
};

const getPageDrawings = (pageIndex: number) => {
  return Object.entries(drawElements.value).reduce((acc, [id, drawing]) => {
    if (drawing.pageIndex === pageIndex) {
      acc[id] = drawing;
    }
    return acc;
  }, {} as typeof drawElements.value);
};

const renderDrawing = (canvas: HTMLCanvasElement, drawing: any) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = drawing.color;
  ctx.lineWidth = drawing.brushSize;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.globalAlpha = drawing.opacity;

  drawing.paths.forEach((path: { x: number; y: number }[]) => {
    if (path.length < 2) return;

    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);

    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x, path[i].y);
    }

    ctx.stroke();
  });
};

const dragStartPos = ref({ x: 0, y: 0 });

function onDragStart(index: number | string, event: any, element: DraggableElementsType) {
  console.log("dragstart", index, element);

  const elements = {
    'text': textElements,
    'image': imageElements,
    'whiteout': whiteoutElements,
    'link': linkElements,
    'highlight': highlightElements,
    'shape': shapeElements,
  };
  const pdfContainer = document.getElementById("pdfContainer");
  if (pdfContainer === null) return;
  const drawRect = pdfContainer.getBoundingClientRect();

  dragStartPos.value = {
    x: event.clientX - elements[element].value[index].x - drawRect.left,
    y: event.clientY - elements[element].value[index].y - drawRect.top,
  };
}

function deleteTextElement(key: string | number) {
  delete textElements.value[key]
}

function deleteImageElement(key: string | number) {
  delete imageElements.value[key]
}

function deleteWhiteoutElement(key: string | number) {
  delete whiteoutElements.value[key]
}

function deleteHighlightElement(key: string | number) {
  delete highlightElements.value[key]
}

function onDragEnd(index: number | string, event: any, element: DraggableElementsType) {
  const pdfContainer = document.getElementById("pdfContainer");
  if (pdfContainer === null) return;
  const drawRect = pdfContainer.getBoundingClientRect();

  const newLeft = event.clientX - dragStartPos.value.x - drawRect.left;
  const newTop = event.clientY - dragStartPos.value.y - drawRect.top;

  draggableElements[element].value[index].x = newLeft;
  draggableElements[element].value[index].y = newTop;
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

const addElementToPage = async (pageIndex: number, settings: any, element: DraggableElementsType) => {
  const elementId = `element-${Date.now()}-${Math.random()}`
  draggableElements[element].value[elementId] = {
    x: settings.x ?? 50,
    y: settings.y ?? 50,
    ...settings,
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

const getPageImageElements = (pageIndex: number) => {
  return Object.entries(imageElements.value).reduce((acc, [id, image]) => {
    if (image.pageIndex === pageIndex) {
      acc[id] = image
    }
    return acc
  }, {} as typeof imageElements.value)
}

const updatePDFWithNewContent = async () => {
  const pages = (props.pdf as PDFDocument).getPages();
  const pageElements = pages.map((_, pageIndex) => {
    const pageTexts = getPageTextElements(pageIndex)
    const pageImages = getPageImageElements(pageIndex)
    const pageLinks = Object.values(linkElements.value).filter(l => l.pageIndex === pageIndex)
    const pageWhiteouts = Object.values(whiteoutElements.value).filter(w => w.pageIndex === pageIndex)
    const pageHighlights = Object.values(highlightElements.value).filter(h => h.pageIndex === pageIndex)
    const pageDrawings = Object.values(drawElements.value).filter(d => d.pageIndex === pageIndex)
    const pageShapes = Object.values(shapeElements.value).filter(s => s.pageIndex === pageIndex)

    return {
      links: pageLinks,
      shapes: pageShapes,
      highlights: pageHighlights,
      whiteouts: pageWhiteouts,
      drawings: pageDrawings,
      texts: Object.values(pageTexts),
      images: Object.values(pageImages)
    }
  })

  const contentUpdater = new PDFContentUpdater()
  await contentUpdater.updatePDFContent(props.pdf as PDFDocument, pageElements as any)

  // Clear all elements after updating
  textElements.value = {}
  imageElements.value = {}
  linkElements.value = {}
  whiteoutElements.value = {}
  highlightElements.value = {}
  drawElements.value = {}
  shapeElements.value = {}
}

onMounted(() => {
  for (const element in draggableElemebtsEvents) {
    eventBus.on(element, (data: any) => {
      if (data.isCurrentPage) {
        addElementToPage(currentPage.value, data.settings, (draggableElemebtsEvents as any)[element])
      }
    });
  }
  eventBus.on('toggleDrawing', (data: any) => {
    isDrawingMode.value = data.isDrawing;
    if (data.isDrawing) {
      drawSettings.value = { ...data.settings };
    }
  });
  eventBus.on('updateDrawSettings', (settings: any) => {
    drawSettings.value = { ...settings };
  });
  // Let the intersection observer handle initial rendering
  Object.entries(pageRefs.value).forEach(([index, element]) => {
    observer.observe(element as Element)
  })
})

onBeforeUnmount(() => {
  for (const element in draggableElemebtsEvents) eventBus.off(element);
  eventBus.off('toggleDrawing');
  eventBus.off('updateDrawSettings');
  cleanup()
  observer.disconnect()
  document.removeEventListener('mousemove', onResize);
  document.removeEventListener('mouseup', onResizeEnd);
})

defineExpose({
  updatePDFWithNewContent
})
</script>