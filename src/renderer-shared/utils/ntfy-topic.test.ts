import { describe, expect, it } from 'vitest'

import { NTFY_TOPIC_MAX_LENGTH, generateNtfyTopic } from './ntfy-topic'

const NTFY_TOPIC_PATTERN = /^[a-z0-9_-]+$/i

describe('generateNtfyTopic', () => {
  it('generates a prefixed, ntfy-safe topic', () => {
    const topic = generateNtfyTopic()

    expect(topic.startsWith('akari-')).toBe(true)
    expect(topic).toMatch(NTFY_TOPIC_PATTERN)
  })

  it('keeps a custom prefix and length', () => {
    expect(generateNtfyTopic('test-', 8)).toMatch(/^test-[a-z0-9_-]{8}$/i)
  })

  it('never exceeds the ntfy topic length limit', () => {
    expect(generateNtfyTopic('akari-', 128)).toHaveLength(NTFY_TOPIC_MAX_LENGTH)
  })

  it('generates a different topic every time', () => {
    const topics = new Set(Array.from({ length: 20 }, () => generateNtfyTopic()))

    expect(topics.size).toBe(20)
  })
})
