import { describe, expect, it } from 'vitest'
import { calculateCoverPlacement } from '../../src/image/imagePlacement.ts'

const canvasWidth = 1280
const canvasHeight = 720
const identity = { zoom: 1, offsetX: 0, offsetY: 0 }

describe('calculateCoverPlacement', () => {
  it('キャンバスと同じ比率なら余白なく一致する', () => {
    const rect = calculateCoverPlacement(
      1920,
      1080,
      canvasWidth,
      canvasHeight,
      identity,
    )

    expect(rect).toEqual({ x: 0, y: 0, width: 1280, height: 720 })
  })

  it('縦長画像は幅を満たし、上下がはみ出す', () => {
    const rect = calculateCoverPlacement(
      1000,
      2000,
      canvasWidth,
      canvasHeight,
      identity,
    )

    expect(rect.width).toBe(canvasWidth)
    expect(rect.height).toBeGreaterThan(canvasHeight)
    expect(rect.x).toBe(0)
    expect(rect.y).toBeLessThan(0)
  })

  it('横長画像は高さを満たし、左右がはみ出す', () => {
    const rect = calculateCoverPlacement(
      4000,
      1000,
      canvasWidth,
      canvasHeight,
      identity,
    )

    expect(rect.height).toBe(canvasHeight)
    expect(rect.width).toBeGreaterThan(canvasWidth)
    expect(rect.y).toBe(0)
    expect(rect.x).toBeLessThan(0)
  })

  it('拡大してもキャンバス中心を基準に保つ', () => {
    const rect = calculateCoverPlacement(1920, 1080, canvasWidth, canvasHeight, {
      zoom: 2,
      offsetX: 0,
      offsetY: 0,
    })

    expect(rect.width).toBe(2560)
    expect(rect.height).toBe(1440)
    expect(rect.x + rect.width / 2).toBe(canvasWidth / 2)
    expect(rect.y + rect.height / 2).toBe(canvasHeight / 2)
  })

  it('平行移動量はキャンバス寸法に対する割合で反映される', () => {
    const rect = calculateCoverPlacement(1920, 1080, canvasWidth, canvasHeight, {
      zoom: 1,
      offsetX: 0.25,
      offsetY: -0.5,
    })

    expect(rect.x).toBe(canvasWidth * 0.25)
    expect(rect.y).toBe(canvasHeight * -0.5)
  })

  it('極端に細長い画像でも有限の矩形を返す', () => {
    const rect = calculateCoverPlacement(
      10000,
      1,
      canvasWidth,
      canvasHeight,
      identity,
    )

    expect(Number.isFinite(rect.width)).toBe(true)
    expect(Number.isFinite(rect.height)).toBe(true)
    expect(rect.height).toBe(canvasHeight)
  })
})
