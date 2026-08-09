import type {
  FontSizes,
  HeadlineInput,
  LayoutLine,
  LayoutSegment,
  Rect,
  TextLayout,
} from '../types/editor.ts'
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../types/editor.ts'
import { RENDER_CONFIG } from './renderConfig.ts'

/** フォントサイズ指定で文字列の描画幅を返す計測関数。 */
export type MeasureText = (text: string, fontSize: number) => number

export type TextLayoutResult =
  | { ok: true; layout: TextLayout }
  | { ok: false; reason: 'empty' }

interface StyledGrapheme {
  text: string
  fillColor: string
}

interface SourceLine {
  graphemes: StyledGrapheme[]
  fontSize: number
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/** 文字を配置できる領域。下端は画面最下部へ張り付ける。 */
export function calculateTextRegion(): Rect {
  const height = CANVAS_HEIGHT - RENDER_CONFIG.safeBottomMargin

  return {
    x: RENDER_CONFIG.safeHorizontalMargin,
    y: 0,
    width: CANVAS_WIDTH - RENDER_CONFIG.safeHorizontalMargin * 2,
    height,
  }
}

/** 絵文字や結合文字を壊さない表示文字単位へ分割する。 */
export function segmentGraphemes(text: string): string[] {
  if (typeof Intl.Segmenter === 'function') {
    const segmenter = new Intl.Segmenter('ja', { granularity: 'grapheme' })
    return Array.from(segmenter.segment(text), (segment) => segment.segment)
  }
  return Array.from(text)
}

export function calculateStrokeWidth(
  fontSize: number,
  strokeRatio: number,
): number {
  const ratio = clamp(
    strokeRatio,
    RENDER_CONFIG.minStrokeRatio,
    RENDER_CONFIG.maxStrokeRatio,
  )
  return clamp(
    fontSize * ratio,
    RENDER_CONFIG.minStrokeWidth,
    RENDER_CONFIG.maxStrokeWidth,
  )
}

function toStyledGraphemes(text: string, fillColor: string): StyledGrapheme[] {
  return segmentGraphemes(text).map((grapheme) => ({
    text: grapheme,
    fillColor,
  }))
}

/** 入力欄の内容を色付きの論理行へ変換する。空欄の行は詰める。 */
function toSourceLines(
  headline: HeadlineInput,
  fontSizes: FontSizes,
): SourceLine[] {
  const colors = RENDER_CONFIG.fillColors
  const lines: SourceLine[] = [
    {
      graphemes: toStyledGraphemes(headline.firstLine.trim(), colors.white),
      fontSize: fontSizes.firstLine,
    },
    {
      graphemes: [
        ...toStyledGraphemes(headline.secondLineLead.trim(), colors.yellow),
        ...toStyledGraphemes(headline.secondLineTail.trim(), colors.red),
      ],
      fontSize: fontSizes.secondLine,
    },
  ]

  return lines.filter((line) => line.graphemes.length > 0)
}

function toLayoutLine(
  graphemes: StyledGrapheme[],
  fontSize: number,
  strokeRatio: number,
  measure: MeasureText,
): LayoutLine {
  const segments: LayoutSegment[] = []

  for (const grapheme of graphemes) {
    const last = segments.at(-1)
    if (last !== undefined && last.fillColor === grapheme.fillColor) {
      last.text += grapheme.text
    } else {
      segments.push({
        text: grapheme.text,
        fillColor: grapheme.fillColor,
        width: 0,
      })
    }
  }

  let width = 0
  for (const segment of segments) {
    segment.width = measure(segment.text, fontSize)
    width += segment.width
  }

  return {
    segments,
    width,
    fontSize,
    lineHeight: fontSize * RENDER_CONFIG.lineHeightRatio,
    strokeWidth: calculateStrokeWidth(fontSize, strokeRatio),
  }
}

/**
 * 指定された文字サイズのまま、画面最下部から積み上げるレイアウトを作る。
 * 自動改行はせず、幅を超えた分は画面外へはみ出させる。
 * 高さは指定された画面占有率へ合わせて縦方向へ伸縮する。
 */
export function createTextLayout(params: {
  headline: HeadlineInput
  fontSizes: FontSizes
  heightRate: number
  strokeRatio: number
  measure: MeasureText
}): TextLayoutResult {
  const sourceLines = toSourceLines(params.headline, params.fontSizes)
  if (sourceLines.length === 0) {
    return { ok: false, reason: 'empty' }
  }

  const lines = sourceLines.map((sourceLine) =>
    toLayoutLine(
      sourceLine.graphemes,
      clamp(
        sourceLine.fontSize,
        RENDER_CONFIG.minFontSize,
        RENDER_CONFIG.maxFontSize,
      ),
      params.strokeRatio,
      params.measure,
    ),
  )

  const baseHeight = lines.reduce((sum, line) => sum + line.lineHeight, 0)
  const targetHeight =
    CANVAS_HEIGHT *
    clamp(
      params.heightRate,
      RENDER_CONFIG.minHeightRate,
      RENDER_CONFIG.maxHeightRate,
    )

  return {
    ok: true,
    layout: {
      lines,
      verticalScale: targetHeight / baseHeight,
      region: calculateTextRegion(),
    },
  }
}
