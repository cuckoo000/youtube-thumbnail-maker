import { describe, expect, it } from 'vitest'
import { buildIntentUrl, buildShareText } from '../../src/share/shareToX.ts'

describe('buildIntentUrl', () => {
  it('本文・ツールURL・ハッシュタグをクエリに含める', () => {
    const url = new URL(buildIntentUrl())

    expect(url.origin + url.pathname).toBe('https://x.com/intent/tweet')
    expect(url.searchParams.get('text')).toBe('例のサムネ、作りました。')
    expect(url.searchParams.get('url')).toBe('https://tools.vrceve.com/thumbnail/')
    expect(url.searchParams.get('hashtags')).toBe('例のサムネメーカー,YouTube')
  })
})

describe('buildShareText', () => {
  it('ハッシュタグとツールURLを本文へ埋め込む', () => {
    const text = buildShareText()

    expect(text).toContain('#例のサムネメーカー')
    expect(text).toContain('#YouTube')
    expect(text).toContain('https://tools.vrceve.com/thumbnail/')
  })
})
