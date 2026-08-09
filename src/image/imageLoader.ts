import type { EditorError, LoadedImage } from '../types/editor.ts'

const ALLOWED_TYPES: ReadonlySet<string> = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
])
const MAX_FILE_BYTES = 20 * 1024 * 1024
const MAX_PIXELS = 40_000_000

export type LoadImageResult =
  | { ok: true; image: LoadedImage }
  | { ok: false; error: EditorError }

/** 選択されたファイルを検証し、ImageBitmapへデコードする。 */
export async function loadImageFile(file: File): Promise<LoadImageResult> {
  if (!ALLOWED_TYPES.has(file.type)) {
    return {
      ok: false,
      error: {
        code: 'unsupported-format',
        message: 'JPEG、PNG、WebPを選択してください',
      },
    }
  }

  if (file.size > MAX_FILE_BYTES) {
    return {
      ok: false,
      error: { code: 'file-too-large', message: '画像は20MiB以下にしてください' },
    }
  }

  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    return {
      ok: false,
      error: { code: 'decode-failed', message: '画像を読み込めませんでした' },
    }
  }

  if (bitmap.width * bitmap.height > MAX_PIXELS) {
    bitmap.close()
    return {
      ok: false,
      error: {
        code: 'too-many-pixels',
        message: '画像の縦横サイズが大きすぎます',
      },
    }
  }

  return {
    ok: true,
    image: {
      bitmap,
      fileName: file.name,
      width: bitmap.width,
      height: bitmap.height,
    },
  }
}

/** 保持していたデコード結果を解放する。 */
export function releaseImage(image: LoadedImage | null): void {
  image?.bitmap.close()
}
