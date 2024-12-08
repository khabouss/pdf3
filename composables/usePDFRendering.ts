import { ref } from 'vue'
import * as PDFJS from 'pdfjs-dist'
import { PDFDocument } from 'pdf-lib'

export function usePDFRendering() {
  const renderedPages = ref(new Set<number>())
  let loadedPdfDoc: any = null
  let pdfBytes: Uint8Array | null | undefined = null

  const cleanup = () => {
    renderedPages.value.clear()
    if (loadedPdfDoc) {
      loadedPdfDoc.destroy()
      loadedPdfDoc = null
    }
    pdfBytes = null
  }

  const renderPage = async (
    pageIndex: number,
    pdf: PDFDocument,
    canvas: HTMLCanvasElement
  ) => {
    if (renderedPages.value.has(pageIndex)) return

    try {
      if (!loadedPdfDoc) {
        pdfBytes = await pdf.save()
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

  return {
    renderedPages,
    cleanup,
    renderPage
  }
}