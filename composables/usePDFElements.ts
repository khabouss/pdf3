import { ref } from 'vue'
import type { PDFElement, TextElement, ImageElement, WhiteoutElement, HighlightElement, DrawElement, ShapeElement } from '~/types/pdf'

export function usePDFElements() {
  const textElements = ref<Record<string, TextElement>>({})
  const imageElements = ref<Record<string, ImageElement>>({})
  const whiteoutElements = ref<Record<string, WhiteoutElement>>({})
  const highlightElements = ref<Record<string, HighlightElement>>({})
  const drawElements = ref<Record<string, DrawElement>>({})
  const shapeElements = ref<Record<string, ShapeElement>>({})

  const addElement = <T extends PDFElement>(
    elements: Record<string, T>,
    element: Omit<T, 'id'>,
    prefix: string
  ) => {
    const id = `${prefix}-${Date.now()}-${Math.random()}`
    elements[id] = { ...element, id } as T
    return id
  }

  const deleteElement = <T extends PDFElement>(
    elements: Record<string, T>,
    id: string
  ) => {
    delete elements[id]
  }

  const getPageElements = <T extends PDFElement>(
    elements: Record<string, T>,
    pageIndex: number
  ): Record<string, T> => {
    return Object.entries(elements).reduce((acc, [id, element]) => {
      if (element.pageIndex === pageIndex) {
        acc[id] = element
      }
      return acc
    }, {} as Record<string, T>)
  }

  const clearAllElements = () => {
    textElements.value = {}
    imageElements.value = {}
    whiteoutElements.value = {}
    highlightElements.value = {}
    drawElements.value = {}
    shapeElements.value = {}
  }

  return {
    textElements,
    imageElements,
    whiteoutElements,
    highlightElements,
    drawElements,
    shapeElements,
    addElement,
    deleteElement,
    getPageElements,
    clearAllElements
  }
}