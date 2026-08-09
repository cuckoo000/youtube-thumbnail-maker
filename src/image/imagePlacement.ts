import type { ImageTransform, Rect } from '../types/editor.ts'

/** 中央基準のcover配置へ、拡大率と平行移動を適用した描画矩形を求める。 */
export function calculateCoverPlacement(
  imageWidth: number,
  imageHeight: number,
  canvasWidth: number,
  canvasHeight: number,
  transform: ImageTransform,
): Rect {
  const scale =
    Math.max(canvasWidth / imageWidth, canvasHeight / imageHeight) *
    transform.zoom
  const width = imageWidth * scale
  const height = imageHeight * scale

  return {
    x: (canvasWidth - width) / 2 + transform.offsetX * canvasWidth,
    y: (canvasHeight - height) / 2 + transform.offsetY * canvasHeight,
    width,
    height,
  }
}
