import { describe, expect, it } from 'vitest'
import { buildIntentUrl, buildShareText } from '../../src/share/shareToX.ts'

describe('buildIntentUrl', () => {
  it('改行を含む本文だけをクエリに渡す', () => {
    const url = new URL(buildIntentUrl())

    expect(url.origin + url.pathname).toBe('https://x.com/intent/tweet')
    expect(url.searchParams.get('text')).toBe(buildShareText())
    expect(url.searchParams.get('url')).toBeNull()
    expect(url.searchParams.get('hashtags')).toBeNull()
  })
})

describe('buildShareText', () => {
  it('挨拶・ツールURL・ハッシュタグを行で分ける', () => {
    expect(buildShareText()).toBe(
      '例のサムネ、作りました。\nhttps://tools.vrceve.com/thumbnail/\n#例のサムネメーカー #YouTube',
    )
  })
})
