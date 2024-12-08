export interface Point {
  x: number
  y: number
}

export interface DrawSettings {
  color: string
  brushSize: number
  opacity: number
}

export interface PDFElement {
  id: string
  x: number
  y: number
  pageIndex: number
}

export interface TextElement extends PDFElement {
  content: string
  fontSize: string
  color: string
  lineHeight: string
}

export interface ImageElement extends PDFElement {
  width: number
  height: number
  imageData: Uint8Array
}

export interface WhiteoutElement extends PDFElement {
  width: number
  height: number
  opacity: number
}

export interface HighlightElement extends PDFElement {
  width: number
  height: number
  color: string
  opacity: number
}

export interface DrawElement extends PDFElement {
  paths: Point[][]
  color: string
  brushSize: number
  opacity: number
}

export interface ShapeElement extends PDFElement {
  type: 'rectangle' | 'circle' | 'line' | 'arrow'
  width?: number
  height?: number
  length?: number
  angle?: number
  lineWidth: number
  color: string
  fill: boolean
}

export interface LinkElement extends PDFElement {
  width: number
  height: number
  url: string
}

export interface RGB {
  r: number
  g: number
  b: number
}