export const NTFY_TOPIC_MAX_LENGTH = 64

/**
 * 64 symbols, so `byte % 64` maps every byte value uniformly and adds no modulo bias.
 */
const NTFY_TOPIC_ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-'

export function generateNtfyTopic(prefix = 'akari-', randomLength = 32) {
  const bytes = new Uint8Array(randomLength)
  crypto.getRandomValues(bytes)

  let suffix = ''
  for (const byte of bytes) {
    suffix += NTFY_TOPIC_ALPHABET.charAt(byte % NTFY_TOPIC_ALPHABET.length)
  }

  return (prefix + suffix).slice(0, NTFY_TOPIC_MAX_LENGTH)
}
