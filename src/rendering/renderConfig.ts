/**
 * 描画パラメータの正本。見た目の調整は原則このファイルだけを変更する。
 */
export const RENDER_CONFIG = {
  /**
   * 背景画像の拡大率と位置。
   * 拡大率はcover配置を倍率1とし、位置はキャンバス幅・高さに対する割合で表す。
   */
  minImageZoom: 1,
  maxImageZoom: 3,
  defaultImageZoom: 1,
  maxImageOffset: 0.5,
  /** 文字サイズの指定範囲(px)。 */
  minFontSize: 24,
  maxFontSize: 200,
  /** 既定の文字サイズ(px)。 */
  defaultFirstLineFontSize: 75,
  defaultSecondLineFontSize: 93,
  /** 行高の倍率。 */
  lineHeightRatio: 1.05,
  /**
   * 文字全体の高さが画面高に占める割合。
   * この値へ合わせて文字を縦方向へ伸縮する。
   */
  minHeightRate: 0.3,
  maxHeightRate: 0.45,
  defaultHeightRate: 0.4,
  /** 文字領域の安全余白(px)。下端は0で画面最下部へ張り付ける。 */
  safeHorizontalMargin: 64,
  safeBottomMargin: 0,
  /** 縁取り幅のフォントサイズ比と、その実寸の下限・上限(px)。 */
  defaultStrokeRatio: 0.18,
  minStrokeRatio: 0.1,
  maxStrokeRatio: 0.3,
  minStrokeWidth: 6,
  maxStrokeWidth: 48,
  fontWeight: 'bold',
  fontFamily:
    '"Arial Black", "Noto Sans JP", "Yu Gothic", "Hiragino Kaku Gothic ProN", sans-serif',
  /** 縁取りは全色で共通の黒とする。 */
  strokeColor: '#111111',
  fillColors: {
    white: '#FFFFFF',
    yellow: '#FFD400',
    red: '#FF3B30',
  },
} as const
