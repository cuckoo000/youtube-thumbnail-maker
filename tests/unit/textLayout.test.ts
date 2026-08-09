import { describe, expect, it } from 'vitest'
import {
  calculateStrokeWidth,
  calculateTextRegion,
  createTextLayout,
  segmentGraphemes,
} from '../../src/rendering/textLayout.ts'
import { RENDER_CONFIG } from '../../src/rendering/renderConfig.ts'
import type { FontSizes } from '../../src/types/editor.ts'
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../../src/types/editor.ts'

/** 実測の代わりに、1文字あたりフォントサイズと同じ幅を返す。 */
const measure = (text: string, fontSize: number): number =>
  segmentGraphemes(text).length * fontSize

const emptyHeadline = {
  firstLine: '',
  secondLineLead: '',
  secondLineTail: '',
}

const defaultFontSizes: FontSizes = {
  firstLine: RENDER_CONFIG.defaultFirstLineFontSize,
  secondLine: RENDER_CONFIG.defaultSecondLineFontSize,
}

function layout(
  headline: Partial<typeof emptyHeadline>,
  overrides: {
    heightRate?: number
    strokeRatio?: number
    fontSizes?: FontSizes
  } = {},
) {
  return createTextLayout({
    headline: { ...emptyHeadline, ...headline },
    fontSizes: overrides.fontSizes ?? defaultFontSizes,
    heightRate: overrides.heightRate ?? RENDER_CONFIG.defaultHeightRate,
    strokeRatio: overrides.strokeRatio ?? RENDER_CONFIG.defaultStrokeRatio,
    measure,
  })
}

describe('segmentGraphemes', () => {
  it('日本語をコードポイント単位で分割する', () => {
    expect(segmentGraphemes('あいう')).toEqual(['あ', 'い', 'う'])
  })

  it('サロゲートペアの絵文字を分割しない', () => {
    expect(segmentGraphemes('🎬')).toEqual(['🎬'])
  })

  it('結合絵文字を1文字として扱う', () => {
    expect(segmentGraphemes('👨‍👩‍👧')).toHaveLength(1)
  })
})

describe('calculateTextRegion', () => {
  it('左右へ安全余白を取り、下端は画面最下部へ張り付く', () => {
    const region = calculateTextRegion()

    expect(region.x).toBe(RENDER_CONFIG.safeHorizontalMargin)
    expect(region.width).toBe(
      CANVAS_WIDTH - RENDER_CONFIG.safeHorizontalMargin * 2,
    )
    expect(region.y + region.height).toBe(
      CANVAS_HEIGHT - RENDER_CONFIG.safeBottomMargin,
    )
  })
})

describe('calculateStrokeWidth', () => {
  it('フォントサイズと比率の積を返す', () => {
    expect(calculateStrokeWidth(100, 0.2)).toBe(20)
  })

  it('比率が範囲外でも実寸の上下限へ収まる', () => {
    expect(calculateStrokeWidth(200, 10)).toBe(RENDER_CONFIG.maxStrokeWidth)
    expect(calculateStrokeWidth(24, 0)).toBe(RENDER_CONFIG.minStrokeWidth)
  })
})

describe('createTextLayout', () => {
  it('全欄が空ならレイアウトを作らない', () => {
    expect(layout({})).toEqual({ ok: false, reason: 'empty' })
  })

  it('空白のみの入力も空とみなす', () => {
    expect(layout({ firstLine: '   ' })).toEqual({ ok: false, reason: 'empty' })
  })

  it('空欄の行は詰めて出力する', () => {
    const result = layout({ secondLineLead: 'テスト' })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.layout.lines).toHaveLength(1)
    expect(result.layout.lines[0]?.fontSize).toBe(
      defaultFontSizes.secondLine,
    )
  })

  it('2行目は前半を黄、後半を赤の別セグメントへ分ける', () => {
    const result = layout({
      secondLineLead: 'Youtube',
      secondLineTail: 'サムネ',
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    const segments = result.layout.lines[0]?.segments ?? []
    expect(segments).toHaveLength(2)
    expect(segments[0]?.fillColor).toBe(RENDER_CONFIG.fillColors.yellow)
    expect(segments[1]?.fillColor).toBe(RENDER_CONFIG.fillColors.red)
  })

  it('同色が連続する場合はセグメントを結合する', () => {
    const result = layout({ firstLine: 'あいうえお' })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    const segments = result.layout.lines[0]?.segments ?? []
    expect(segments).toHaveLength(1)
    expect(segments[0]?.text).toBe('あいうえお')
  })

  it('行の幅はセグメント幅の合計と一致する', () => {
    const result = layout({
      secondLineLead: 'Youtube',
      secondLineTail: 'サムネ',
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    const line = result.layout.lines[0]
    const total = (line?.segments ?? []).reduce(
      (sum, segment) => sum + segment.width,
      0,
    )
    expect(line?.width).toBe(total)
  })

  it('画面占有率どおりに縦方向へ伸縮する', () => {
    const result = layout({ firstLine: 'あ' }, { heightRate: 0.4 })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    const line = result.layout.lines[0]
    const scaledHeight = (line?.lineHeight ?? 0) * result.layout.verticalScale
    expect(scaledHeight).toBeCloseTo(CANVAS_HEIGHT * 0.4, 6)
  })

  it('画面占有率が範囲外でも上下限へ収まる', () => {
    const result = layout({ firstLine: 'あ' }, { heightRate: 5 })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    const line = result.layout.lines[0]
    const scaledHeight = (line?.lineHeight ?? 0) * result.layout.verticalScale
    expect(scaledHeight).toBeCloseTo(
      CANVAS_HEIGHT * RENDER_CONFIG.maxHeightRate,
      6,
    )
  })

  it('文字サイズが範囲外でも上下限へ収まる', () => {
    const result = layout(
      { firstLine: 'あ', secondLineLead: 'い' },
      { fontSizes: { firstLine: 1000, secondLine: 1 } },
    )

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.layout.lines[0]?.fontSize).toBe(RENDER_CONFIG.maxFontSize)
    expect(result.layout.lines[1]?.fontSize).toBe(RENDER_CONFIG.minFontSize)
  })

  it('60文字の見出しでも1行のまま自動改行しない', () => {
    const result = layout({ firstLine: 'あ'.repeat(60) })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.layout.lines).toHaveLength(1)
    expect(result.layout.lines[0]?.width).toBeGreaterThan(CANVAS_WIDTH)
  })

  it('絵文字を含んでも文字が壊れずセグメントへ入る', () => {
    const result = layout({ firstLine: '実況🎬開始' })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.layout.lines[0]?.segments[0]?.text).toBe('実況🎬開始')
  })
})
