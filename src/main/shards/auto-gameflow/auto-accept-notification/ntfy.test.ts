import { describe, expect, it } from 'vitest'

import { buildNtfyPayload, resolveNtfyPublishUrl } from './ntfy'

describe('resolveNtfyPublishUrl', () => {
  it('appends the trailing slash required by the JSON publish endpoint', () => {
    expect(resolveNtfyPublishUrl('https://ntfy.sh')).toBe('https://ntfy.sh/')
  })

  it('does not duplicate an existing trailing slash', () => {
    expect(resolveNtfyPublishUrl('https://ntfy.sh/')).toBe('https://ntfy.sh/')
  })

  it('trims whitespace and extra slashes, keeping a server path prefix', () => {
    expect(resolveNtfyPublishUrl('  https://example.com/ntfy//  ')).toBe(
      'https://example.com/ntfy/'
    )
  })

  it('rejects a server URL without a scheme', () => {
    expect(() => resolveNtfyPublishUrl('ntfy.sh')).toThrow('Invalid ntfy server URL')
  })
})

describe('buildNtfyPayload', () => {
  it('builds a JSON publish payload with defaults', () => {
    expect(
      buildNtfyPayload({
        serverUrl: 'https://ntfy.sh',
        topic: ' akari-test ',
        title: 'Match accepted',
        message: 'Entering the game'
      })
    ).toEqual({
      topic: 'akari-test',
      title: 'Match accepted',
      message: 'Entering the game',
      priority: 3,
      tags: []
    })
  })
})
