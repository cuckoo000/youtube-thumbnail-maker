const FILE_NAME = 'thumbnail.png'

/** CanvasをPNGへ変換し、端末へダウンロードする。 */
export async function exportPng(canvas: HTMLCanvasElement): Promise<boolean> {
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/png')
  })
  if (blob === null) {
    return false
  }

  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = FILE_NAME
  anchor.click()
  // ダウンロード開始前に解放するとキャンセルされる環境があるため次のタスクで破棄する。
  setTimeout(() => URL.revokeObjectURL(url), 0)
  return true
}
