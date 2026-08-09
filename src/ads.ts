declare global {
  interface Window {
    adsbygoogle?: unknown[]
  }
}

// スロットIDが未設定のうちは空枠が残るため、枠ごと隠して push もしない。
export function startAds(): void {
  const container = document.getElementById('ad-slot')
  const unit = container?.querySelector<HTMLElement>('.adsbygoogle')
  if (!container || !unit || !unit.dataset.adSlot) {
    return
  }

  container.hidden = false
  window.adsbygoogle = window.adsbygoogle ?? []
  window.adsbygoogle.push({})
}
