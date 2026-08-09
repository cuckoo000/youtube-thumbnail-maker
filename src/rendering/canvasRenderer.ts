import { calculateCoverPlacement } from '../image/imagePlacement.ts'
import type {
  ImageTransform,
  LayoutLine,
  LayoutSegment,
  LoadedImage,
  TextLayout,
} from '../types/editor.ts'
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../types/editor.ts'
import { RENDER_CONFIG } from './renderConfig.ts'
import type { MeasureText } from './textLayout.ts'

const EMPTY_BACKGROUND_COLOR = '#d9d9d6'

function fontOf(fontSize: number): string {
  return `${RENDER_CONFIG.fontWeight} ${fontSize}px ${RENDER_CONFIG.fontFamily}`
}

/** 文字レイアウト計算へ渡すCanvas依存の計測関数を作る。 */
export function createMeasureText(
  context: CanvasRenderingContext2D,
): MeasureText {
  return (text, fontSize) => {
    context.font = fontOf(fontSize)
    return context.measureText(text).width
  }
}

/** 背景、縁、文字の順でサムネイルを描画する。 */
export function renderThumbnail(
  context: CanvasRenderingContext2D,
  params: {
    image: LoadedImage | null
    imageTransform: ImageTransform
    layout: TextLayout | null
  },
): void {
  context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

  if (params.image === null) {
    context.fillStyle = EMPTY_BACKGROUND_COLOR
    context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  } else {
    const placement = calculateCoverPlacement(
      params.image.width,
      params.image.height,
      CANVAS_WIDTH,
      CANVAS_HEIGHT,
      params.imageTransform,
    )
    context.drawImage(
      params.image.bitmap,
      placement.x,
      placement.y,
      placement.width,
      placement.height,
    )
  }

  const layout = params.layout
  if (layout === null) {
    return
  }

  context.textAlign = 'left'
  context.textBaseline = 'middle'
  context.lineJoin = 'round'
  context.strokeStyle = RENDER_CONFIG.strokeColor

  const centerX = layout.region.x + layout.region.width / 2
  const totalHeight = layout.lines.reduce(
    (sum, line) => sum + line.lineHeight * layout.verticalScale,
    0,
  )

  // 画面最下部へ張り付けるため、下端から積み上げた位置を求める。
  let top = CANVAS_HEIGHT - RENDER_CONFIG.safeBottomMargin - totalHeight
  const placedLines = layout.lines.map((line) => {
    const scaledHeight = line.lineHeight * layout.verticalScale
    const centerY = top + scaledHeight / 2
    top += scaledHeight
    return { line, centerY }
  })

  // 縦長にするため、行ごとに中心を原点として縦方向だけ拡大した座標系で描く。
  const drawLine = (
    line: LayoutLine,
    centerY: number,
    drawSegment: (segment: LayoutSegment, x: number) => void,
  ): void => {
    context.save()
    context.translate(centerX, centerY)
    context.scale(1, layout.verticalScale)
    let x = -line.width / 2
    for (const segment of line.segments) {
      drawSegment(segment, x)
      x += segment.width
    }
    context.restore()
  }

  // 縁が隣の文字の塗りを削らないよう、全行の縁を描いてから塗りを重ねる。
  for (const { line, centerY } of placedLines) {
    context.font = fontOf(line.fontSize)
    context.lineWidth = line.strokeWidth
    drawLine(line, centerY, (segment, x) => {
      context.strokeText(segment.text, x, 0)
    })
  }

  for (const { line, centerY } of placedLines) {
    context.font = fontOf(line.fontSize)
    drawLine(line, centerY, (segment, x) => {
      context.fillStyle = segment.fillColor
      context.fillText(segment.text, x, 0)
    })
  }
}
