import { RENDER_CONFIG } from '../rendering/renderConfig.ts'
import type { EditorState } from '../types/editor.ts'

export function createInitialState(): EditorState {
  return {
    image: null,
    imageTransform: {
      zoom: RENDER_CONFIG.defaultImageZoom,
      offsetX: 0,
      offsetY: 0,
    },
    headline: {
      firstLine: 'あのサムネイルがだれでも作れる!?',
      secondLineLead: '例の',
      secondLineTail: 'サムネメーカー',
    },
    fontSizes: {
      firstLine: RENDER_CONFIG.defaultFirstLineFontSize,
      secondLine: RENDER_CONFIG.defaultSecondLineFontSize,
    },
    heightRate: RENDER_CONFIG.defaultHeightRate,
    strokeRatio: RENDER_CONFIG.defaultStrokeRatio,
    error: null,
  }
}
