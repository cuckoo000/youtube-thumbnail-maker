export const CANVAS_WIDTH = 1280
export const CANVAS_HEIGHT = 720

export type FillColorId = 'white' | 'yellow' | 'red'

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

export interface LoadedImage {
  bitmap: ImageBitmap
  fileName: string
  width: number
  height: number
}

/** 1行目は白、2行目は前半が黄、後半が赤で描画する。 */
export interface HeadlineInput {
  firstLine: string
  secondLineLead: string
  secondLineTail: string
}

export interface LayoutSegment {
  text: string
  fillColor: string
  width: number
}

export interface LayoutLine {
  segments: LayoutSegment[]
  width: number
  fontSize: number
  lineHeight: number
  strokeWidth: number
}

export interface TextLayout {
  lines: LayoutLine[]
  /** 文字を縦方向へ伸縮する倍率。 */
  verticalScale: number
  region: Rect
}

export type EditorErrorCode =
  | 'unsupported-format'
  | 'file-too-large'
  | 'too-many-pixels'
  | 'decode-failed'
  | 'export-failed'
  | 'share-failed'

export interface EditorError {
  code: EditorErrorCode
  message: string
}

/** 背景画像のcover配置からの拡大率と、キャンバス比での平行移動量。 */
export interface ImageTransform {
  zoom: number
  offsetX: number
  offsetY: number
}

/** 1行目と2行目で個別に指定する文字サイズ(px)。 */
export interface FontSizes {
  firstLine: number
  secondLine: number
}

export interface EditorState {
  image: LoadedImage | null
  imageTransform: ImageTransform
  headline: HeadlineInput
  fontSizes: FontSizes
  heightRate: number
  strokeRatio: number
  error: EditorError | null
}
