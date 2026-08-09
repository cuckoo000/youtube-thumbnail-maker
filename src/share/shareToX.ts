import { canvasToPngBlob } from '../rendering/exporter.ts'

const TOOL_URL = 'https://tools.vrceve.com/thumbnail/'
const HASHTAGS = ['例のサムネメーカー', 'YouTube'] as const
const MESSAGE = '例のサムネ、作りました。'
const FILE_NAME = 'thumbnail.png'

export type ShareResult =
  | { ok: true }
  | { ok: false; reason: 'canceled' | 'failed' }

/** Xの投稿画面へ渡す本文。画像添付時はurl欄が無視される端末があるためURLも本文に含める。 */
export function buildShareText(): string {
  const hashtags = HASHTAGS.map((tag) => `#${tag}`).join(' ')
  return `${MESSAGE} ${hashtags}\n${TOOL_URL}`
}

/** 画像を添付できない環境向けのWeb Intent URL。 */
export function buildIntentUrl(): string {
  const params = new URLSearchParams({
    text: MESSAGE,
    url: TOOL_URL,
    hashtags: HASHTAGS.join(','),
  })
  return `https://x.com/intent/tweet?${params.toString()}`
}

/**
 * 画像付き共有に対応しているかを、PNG生成を待たずに同期的に判定する。
 * 非対応時のwindow.openをクリック直後に実行し、ポップアップブロックを避けるため。
 */
export function supportsFileShare(): boolean {
  if (
    typeof navigator.share !== 'function' ||
    typeof navigator.canShare !== 'function'
  ) {
    return false
  }
  const probe = new File([], FILE_NAME, { type: 'image/png' })
  return navigator.canShare({ files: [probe] })
}

/** CanvasのPNGを共有シートへ渡す。supportsFileShare() が true のときだけ呼ぶ。 */
export async function shareThumbnailFile(
  canvas: HTMLCanvasElement,
): Promise<ShareResult> {
  const blob = await canvasToPngBlob(canvas)
  if (blob === null) {
    return { ok: false, reason: 'failed' }
  }

  const file = new File([blob], FILE_NAME, { type: 'image/png' })
  if (!navigator.canShare({ files: [file] })) {
    return { ok: false, reason: 'failed' }
  }

  try {
    await navigator.share({ files: [file], text: buildShareText() })
    return { ok: true }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return { ok: false, reason: 'canceled' }
    }
    return { ok: false, reason: 'failed' }
  }
}
