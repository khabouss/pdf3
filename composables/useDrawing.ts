import { ref } from 'vue'
import type { DrawSettings, Point } from '~/types/pdf'

export function useDrawing() {
  const isDrawingMode = ref(false)
  const currentPath = ref<Point[]>([])
  const drawSettings = ref<DrawSettings>({
    color: '#000000',
    brushSize: 2,
    opacity: 1
  })

  const clearDrawing = (canvas: HTMLCanvasElement | null) => {
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }

  const drawOnCanvas = (canvas: HTMLCanvasElement, path: Point[]) => {
    const ctx = canvas.getContext('2d')
    if (!ctx || path.length < 2) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.beginPath()
    ctx.moveTo(path[0].x, path[0].y)

    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x, path[i].y)
    }

    ctx.strokeStyle = drawSettings.value.color
    ctx.lineWidth = drawSettings.value.brushSize
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.globalAlpha = drawSettings.value.opacity
    ctx.stroke()
  }

  return {
    isDrawingMode,
    currentPath,
    drawSettings,
    clearDrawing,
    drawOnCanvas
  }
}