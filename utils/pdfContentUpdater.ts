import { PDFDocument, PDFPage, rgb } from 'pdf-lib'
import type { TextElement, ImageElement, WhiteoutElement, HighlightElement, DrawElement, ShapeElement, LinkElement, RGB } from '~/types/pdf'
import { hexToRgb } from '~/utils/color'

export class PDFContentUpdater {
  private drawShapes(page: PDFPage, shapes: ShapeElement[]) {
    shapes.forEach(shape => {
      const { r, g, b } = hexToRgb(shape.color)
      
      switch (shape.type) {
        case 'rectangle':
          this.drawRectangle(page, shape, { r, g, b })
          break
        case 'circle':
          this.drawCircle(page, shape, { r, g, b })
          break
        case 'line':
        case 'arrow':
          this.drawLine(page, shape, { r, g, b })
          break
      }
    })
  }

  private drawRectangle(page: PDFPage, shape: ShapeElement, color: RGB) {
    const options = shape.fill ? {
      x: shape.x,
      y: page.getHeight() - shape.y - (shape.height || 0),
      width: shape.width || 0,
      height: shape.height || 0,
      color: rgb(color.r / 255, color.g / 255, color.b / 255),
      borderWidth: shape.lineWidth
    } : {
      x: shape.x,
      y: page.getHeight() - shape.y - (shape.height || 0),
      width: shape.width || 0,
      height: shape.height || 0,
      borderColor: rgb(color.r / 255, color.g / 255, color.b / 255),
      borderWidth: shape.lineWidth
    }
    
    page.drawRectangle(options)
  }

  private drawCircle(page: PDFPage, shape: ShapeElement, color: RGB) {
    const options = shape.fill ? {
      x: shape.x + ((shape.width || 0) / 2),
      y: page.getHeight() - shape.y - ((shape.height || 0) / 2),
      size: Math.min(shape.width || 0, shape.height || 0) / 2,
      color: rgb(color.r / 255, color.g / 255, color.b / 255),
      borderWidth: shape.lineWidth
    } : {
      x: shape.x + ((shape.width || 0) / 2),
      y: page.getHeight() - shape.y - ((shape.height || 0) / 2),
      size: Math.min(shape.width || 0, shape.height || 0) / 2,
      borderColor: rgb(color.r / 255, color.g / 255, color.b / 255),
      borderWidth: shape.lineWidth
    }
    
    page.drawCircle(options)
  }

  private drawLine(page: PDFPage, shape: ShapeElement, color: RGB) {
    const angle = ((shape.angle || 0) * Math.PI) / 180
    const length = shape.length || 0
    const endX = shape.x + length * Math.cos(angle)
    const endY = shape.y + length * Math.sin(angle)
    
    page.moveTo(shape.x, page.getHeight() - shape.y)
    page.lineTo(endX, page.getHeight() - endY)
    page.setStrokeColor(rgb(color.r / 255, color.g / 255, color.b / 255))
    page.setLineWidth(shape.lineWidth)
    page.stroke()
    
    if (shape.type === 'arrow') {
      this.drawArrowHead(page, shape, { endX, endY })
    }
  }

  private drawArrowHead(page: PDFPage, shape: ShapeElement, { endX, endY }: { endX: number, endY: number }) {
    const arrowLength = 15
    const arrowAngle = Math.PI / 6
    
    const dx = endX - shape.x
    const dy = endY - shape.y
    const lineAngle = Math.atan2(dy, dx)
    
    const arrow1X = endX - arrowLength * Math.cos(lineAngle + arrowAngle)
    const arrow1Y = endY - arrowLength * Math.sin(lineAngle + arrowAngle)
    const arrow2X = endX - arrowLength * Math.cos(lineAngle - arrowAngle)
    const arrow2Y = endY - arrowLength * Math.sin(lineAngle - arrowAngle)
    
    page.moveTo(endX, page.getHeight() - endY)
    page.lineTo(arrow1X, page.getHeight() - arrow1Y)
    page.moveTo(endX, page.getHeight() - endY)
    page.lineTo(arrow2X, page.getHeight() - arrow2Y)
    page.stroke()
  }

  private drawHighlights(page: PDFPage, highlights: HighlightElement[]) {
    highlights.forEach(highlight => {
      const { r, g, b } = hexToRgb(highlight.color)
      page.drawRectangle({
        x: highlight.x,
        y: page.getHeight() - highlight.y - highlight.height,
        width: highlight.width,
        height: highlight.height,
        color: rgb(r / 255, g / 255, b / 255),
        opacity: highlight.opacity
      })
    })
  }

  private drawWhiteouts(page: PDFPage, whiteouts: WhiteoutElement[]) {
    whiteouts.forEach(whiteout => {
      page.drawRectangle({
        x: whiteout.x,
        y: page.getHeight() - whiteout.y - whiteout.height,
        width: whiteout.width,
        height: whiteout.height,
        color: rgb(1, 1, 1),
        opacity: whiteout.opacity
      })
    })
  }

  private drawPaths(page: PDFPage, drawings: DrawElement[]) {
    drawings.forEach(drawing => {
      drawing.paths.forEach(path => {
        if (path.length < 2) return
        
        const { r, g, b } = hexToRgb(drawing.color)
        page.moveTo(path[0].x, page.getHeight() - path[0].y)
        
        for (let i = 1; i < path.length; i++) {
          page.lineTo(path[i].x, page.getHeight() - path[i].y)
        }
        
        page.setStrokeColor(rgb(r / 255, g / 255, b / 255))
        page.setLineWidth(drawing.brushSize)
        page.setLineCap('round')
        page.setLineJoin('round')
        page.setOpacity(drawing.opacity)
        page.stroke()
      })
    })
  }

  private async drawTexts(page: PDFPage, texts: TextElement[]) {
    texts.forEach(text => {
      const { r, g, b } = hexToRgb(text.color)
      page.drawText(text.content, {
        x: text.x,
        y: page.getHeight() - text.y,
        size: parseInt(text.fontSize, 10),
        color: rgb(r / 255, g / 255, b / 255),
        lineHeight: parseInt(text.lineHeight, 10)
      })
    })
  }

  private async drawImages(page: PDFPage, images: ImageElement[], pdf: PDFDocument) {
    try {
      for (const image of images) {
        const pdfImage = await pdf.embedPng(image.imageData)  
        console.log(pdfImage);
        const newHeight = (pdfImage.height * image.width) / pdfImage.width;
        page.drawImage(pdfImage, {
          x: image.x,
          y: page.getHeight() - image.y - newHeight,
          width: image.width,
          height: newHeight
        })
      }
    } catch (e) {
      console.error(e);
    }
  }

  async updatePDFContent(
    pdf: PDFDocument,
    pageElements: {
      links: LinkElement[]
      shapes: ShapeElement[]
      highlights: HighlightElement[]
      whiteouts: WhiteoutElement[]
      drawings: DrawElement[]
      texts: TextElement[]
      images: ImageElement[]
    }[]
  ) {
    const pages = pdf.getPages()
    
    for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
      const page = pages[pageIndex]
      const elements = pageElements[pageIndex]
      
      // Add links first
      elements.links.forEach(link => {
        page.node.setAnnotation('Link', {
          x: link.x,
          y: page.getHeight() - link.y - link.height,
          width: link.width,
          height: link.height,
          url: link.url,
          color: rgb(0, 0, 1),
          borderWidth: 1
        })
      })
      
      // Draw elements in correct order
      this.drawShapes(page, elements.shapes)
      this.drawHighlights(page, elements.highlights)
      this.drawWhiteouts(page, elements.whiteouts)
      this.drawPaths(page, elements.drawings)
      await this.drawImages(page, elements.images, pdf)
      await this.drawTexts(page, elements.texts)
    }
  }
}