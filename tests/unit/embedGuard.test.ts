import { describe, expect, it } from 'vitest'
import { shouldRedirectToHostPage } from '../../src/embedGuard.ts'

const productionHost = 'youtube-thumbnail-maker.cuckoo-mailbox000.workers.dev'

describe('shouldRedirectToHostPage', () => {
  it('本番ホストに直接アクセスした場合は転送する', () => {
    expect(shouldRedirectToHostPage(productionHost, false)).toBe(true)
  })

  it('iframeへ埋め込まれている場合は転送しない', () => {
    expect(shouldRedirectToHostPage(productionHost, true)).toBe(false)
  })

  it('開発サーバーでは転送しない', () => {
    expect(shouldRedirectToHostPage('localhost', false)).toBe(false)
  })

  it('未知のホストでは転送しない', () => {
    expect(shouldRedirectToHostPage('example.com', false)).toBe(false)
  })
})
