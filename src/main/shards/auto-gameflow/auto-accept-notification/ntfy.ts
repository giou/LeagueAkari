import type { AxiosInstance } from 'axios'

export interface NtfyPublishOptions {
  serverUrl: string
  topic: string
  title: string
  message: string
  accessToken?: string
  priority?: number
  tags?: string[]
}

const NTFY_URL_PATTERN = /^https?:\/\//i

/**
 * ntfy publishes JSON messages to the server root, not to the topic URL.
 * @see https://docs.ntfy.sh/publish/#publish-as-json
 */
export function resolveNtfyPublishUrl(serverUrl: string) {
  const trimmed = serverUrl.trim().replace(/\/+$/, '')

  if (!NTFY_URL_PATTERN.test(trimmed)) {
    throw new Error(`Invalid ntfy server URL: ${serverUrl}`)
  }

  return `${trimmed}/`
}

export function buildNtfyPayload(options: NtfyPublishOptions) {
  return {
    topic: options.topic.trim(),
    title: options.title,
    message: options.message,
    priority: options.priority ?? 3,
    tags: options.tags ?? []
  }
}

export class NtfyClient {
  constructor(private readonly _createHttpClient: () => AxiosInstance) {}

  async publish(options: NtfyPublishOptions) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }

    if (options.accessToken) {
      headers.Authorization = `Bearer ${options.accessToken}`
    }

    await this._createHttpClient().post(
      resolveNtfyPublishUrl(options.serverUrl),
      buildNtfyPayload(options),
      { headers, timeout: 5000 }
    )
  }
}
