declare global {
  interface Window {
    adsbygoogle?: unknown[]
  }
}

// サイドレールを表示できる最小幅。src/style.css のメディアクエリと一致させる。
const RAIL_MEDIA_QUERY = '(min-width: 1600px)'

const ALWAYS_ON_SLOT_IDS = ['ad-slot']
const RAIL_SLOT_IDS = ['ad-rail-left', 'ad-rail-right']

// スロットIDが未設定のうちは空枠が残るため、枠ごと隠して push もしない。
function activateSlot(containerId: string): void {
  const container = document.getElementById(containerId)
  const unit = container?.querySelector<HTMLElement>('.adsbygoogle')
  if (!container || !unit || !unit.dataset.adSlot || !container.hidden) {
    return
  }

  container.hidden = false
  window.adsbygoogle = window.adsbygoogle ?? []
  window.adsbygoogle.push({})
}

export function startAds(): void {
  ALWAYS_ON_SLOT_IDS.forEach(activateSlot)

  // 非表示のまま push すると幅0で配信要求が飛ぶため、表示条件を満たしてから有効化する。
  const rail = window.matchMedia(RAIL_MEDIA_QUERY)
  const activateRails = (): void => {
    if (!rail.matches) {
      return
    }
    RAIL_SLOT_IDS.forEach(activateSlot)
  }

  activateRails()
  rail.addEventListener('change', activateRails)
}
