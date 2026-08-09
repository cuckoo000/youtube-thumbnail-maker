import { loadImageFile, releaseImage } from '../image/imageLoader.ts'
import { createMeasureText, renderThumbnail } from '../rendering/canvasRenderer.ts'
import { exportPng } from '../rendering/exporter.ts'
import { createTextLayout } from '../rendering/textLayout.ts'
import {
  buildIntentUrl,
  copyPngToClipboard,
  shareThumbnailFile,
  supportsFileShare,
} from '../share/shareToX.ts'
import type {
  EditorError,
  FontSizes,
  HeadlineInput,
  TextLayout,
} from '../types/editor.ts'
import { createInitialState } from './state.ts'

/** style.css の1列レイアウトと同じ境界。 */
const NARROW_LAYOUT_QUERY = '(max-width: 860px)'

function requireElement<T extends Element>(
  id: string,
  constructor: abstract new () => T,
): T {
  const element = document.getElementById(id)
  if (!(element instanceof constructor)) {
    throw new Error(`必要な要素が見つかりません: ${id}`)
  }
  return element
}

/** 狭い画面では操作パネルを閉じた状態で表示し、プレビューを画面内へ収める。 */
function collapsePanelsOnNarrowScreen(): void {
  if (!window.matchMedia(NARROW_LAYOUT_QUERY).matches) {
    return
  }
  for (const panel of document.querySelectorAll<HTMLDetailsElement>(
    'details.panel',
  )) {
    panel.open = false
  }
}

export function startEditor(): void {
  const canvas = requireElement('preview-canvas', HTMLCanvasElement)
  const context = canvas.getContext('2d')
  if (context === null) {
    throw new Error('Canvasを初期化できませんでした')
  }

  const imageInput = requireElement('image-input', HTMLInputElement)
  const imageName = requireElement('image-name', HTMLParagraphElement)
  const exportButton = requireElement('export-button', HTMLButtonElement)
  const shareButton = requireElement('share-button', HTMLButtonElement)
  const shareDialog = requireElement('share-dialog', HTMLDialogElement)
  const shareDialogMessage = requireElement(
    'share-dialog-message',
    HTMLParagraphElement,
  )
  const shareDialogOpen = requireElement('share-dialog-open', HTMLButtonElement)
  const shareDialogClose = requireElement('share-dialog-close', HTMLButtonElement)
  const errorMessage = requireElement('error-message', HTMLParagraphElement)

  const headlineInputs: ReadonlyArray<[keyof HeadlineInput, HTMLInputElement]> = [
    ['firstLine', requireElement('line1-input', HTMLInputElement)],
    ['secondLineLead', requireElement('line2-lead-input', HTMLInputElement)],
    ['secondLineTail', requireElement('line2-tail-input', HTMLInputElement)],
  ]

  const fontSizeInputs: ReadonlyArray<
    [keyof FontSizes, HTMLInputElement, HTMLParagraphElement]
  > = [
    [
      'firstLine',
      requireElement('line1-size-input', HTMLInputElement),
      requireElement('line1-size-value', HTMLParagraphElement),
    ],
    [
      'secondLine',
      requireElement('line2-size-input', HTMLInputElement),
      requireElement('line2-size-value', HTMLParagraphElement),
    ],
  ]

  const state = createInitialState()
  const measure = createMeasureText(context)
  let frameHandle: number | null = null

  const showError = (error: EditorError | null): void => {
    state.error = error
    errorMessage.textContent = error === null ? '' : error.message
  }

  const draw = (): void => {
    frameHandle = null

    const result = createTextLayout({
      headline: state.headline,
      fontSizes: state.fontSizes,
      heightRate: state.heightRate,
      strokeRatio: state.strokeRatio,
      measure,
    })

    let layout: TextLayout | null = null
    let exportable = false

    if (result.ok) {
      layout = result.layout
      exportable = state.image !== null
    }

    renderThumbnail(context, {
      image: state.image,
      imageTransform: state.imageTransform,
      layout,
    })
    exportButton.disabled = !exportable
    shareButton.disabled = !exportable
  }

  const requestDraw = (): void => {
    if (frameHandle !== null) {
      return
    }
    frameHandle = requestAnimationFrame(draw)
  }

  /** パーセント表示のスライダーを、比率を扱う状態へ接続する。 */
  const bindRatioSlider = (
    inputId: string,
    outputId: string,
    initialRatio: number,
    apply: (ratio: number) => void,
  ): void => {
    const input = requireElement(inputId, HTMLInputElement)
    const output = requireElement(outputId, HTMLParagraphElement)
    const update = (percentage: number): void => {
      output.textContent = `${percentage}%`
      apply(percentage / 100)
    }

    input.value = String(Math.round(initialRatio * 100))
    update(Number(input.value))
    input.addEventListener('input', () => {
      update(Number(input.value))
      requestDraw()
    })
  }

  const applyImageFile = (file: File): void => {
    void loadImageFile(file).then((result) => {
      if (!result.ok) {
        showError(result.error)
        imageInput.value = ''
        return
      }
      releaseImage(state.image)
      state.image = result.image
      imageName.textContent = result.image.fileName
      showError(null)
      requestDraw()
    })
  }

  imageInput.addEventListener('change', () => {
    const file = imageInput.files?.[0]
    if (file !== undefined) {
      applyImageFile(file)
    }
  })

  for (const id of ['image-dropzone', 'preview-dropzone']) {
    const zone = requireElement(id, HTMLElement)
    const setDragover = (active: boolean): void => {
      zone.classList.toggle('is-dragover', active)
    }

    zone.addEventListener('dragover', (event) => {
      event.preventDefault()
      setDragover(true)
    })
    zone.addEventListener('dragleave', () => {
      setDragover(false)
    })
    zone.addEventListener('drop', (event) => {
      event.preventDefault()
      setDragover(false)
      const file = event.dataTransfer?.files[0]
      if (file !== undefined) {
        applyImageFile(file)
      }
    })
  }

  for (const [key, input] of headlineInputs) {
    input.value = state.headline[key]
    input.addEventListener('input', () => {
      state.headline[key] = input.value
      requestDraw()
    })
  }

  for (const [key, input, output] of fontSizeInputs) {
    input.value = String(state.fontSizes[key])
    output.textContent = `${input.value}px`
    input.addEventListener('input', () => {
      state.fontSizes[key] = Number(input.value)
      output.textContent = `${input.value}px`
      requestDraw()
    })
  }

  bindRatioSlider(
    'image-zoom-input',
    'image-zoom-value',
    state.imageTransform.zoom,
    (ratio) => {
      state.imageTransform.zoom = ratio
    },
  )
  bindRatioSlider(
    'image-offset-x-input',
    'image-offset-x-value',
    state.imageTransform.offsetX,
    (ratio) => {
      state.imageTransform.offsetX = ratio
    },
  )
  bindRatioSlider(
    'image-offset-y-input',
    'image-offset-y-value',
    state.imageTransform.offsetY,
    (ratio) => {
      state.imageTransform.offsetY = ratio
    },
  )
  bindRatioSlider(
    'height-rate-input',
    'height-rate-value',
    state.heightRate,
    (ratio) => {
      state.heightRate = ratio
    },
  )
  bindRatioSlider(
    'stroke-input',
    'stroke-value',
    state.strokeRatio,
    (ratio) => {
      state.strokeRatio = ratio
    },
  )

  exportButton.addEventListener('click', () => {
    void exportPng(canvas).then((succeeded) => {
      if (!succeeded) {
        showError({ code: 'export-failed', message: '画像を書き出せませんでした' })
      }
    })
  })

  shareButton.addEventListener('click', () => {
    showError(null)

    if (!supportsFileShare()) {
      // クリップボードへの書き込みはクリックと同一タスクで開始する必要がある。
      const copied = copyPngToClipboard(canvas)
      shareDialogMessage.textContent = '画像をクリップボードへコピーしています…'
      shareDialogMessage.classList.remove('share-dialog-message--failed')
      shareDialog.showModal()
      void copied.then((succeeded) => {
        shareDialogMessage.textContent = succeeded
          ? '画像をクリップボードへコピーしました。'
          : 'クリップボードへコピーできませんでした。PNGをダウンロードして手動で添付してください。'
        shareDialogMessage.classList.toggle(
          'share-dialog-message--failed',
          !succeeded,
        )
      })
      return
    }

    void shareThumbnailFile(canvas).then((result) => {
      if (result.ok || result.reason === 'canceled') {
        return
      }
      showError({
        code: 'share-failed',
        message: '共有できませんでした。PNGをダウンロードしてから投稿してください',
      })
    })
  })

  shareDialogOpen.addEventListener('click', () => {
    window.open(buildIntentUrl(), '_blank', 'noopener,noreferrer')
    shareDialog.close()
  })

  shareDialogClose.addEventListener('click', () => {
    shareDialog.close()
  })

  window.addEventListener('pagehide', () => {
    releaseImage(state.image)
    state.image = null
  })

  collapsePanelsOnNarrowScreen()
  draw()
}
