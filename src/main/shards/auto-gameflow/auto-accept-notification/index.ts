import { i18next } from '@main/i18n'
import { formatError } from '@shared/utils/errors'

import type { AutoGameflowMainContext } from '../context'
import { AutoAcceptNotificationGate } from './gate'
import { NtfyClient } from './ntfy'

export const MATCH_ACCEPTED_NOTIFICATION_KEY = 'auto-gameflow-main.match-accepted-notification'

export class AutoAcceptNotifier {
  private readonly _gate: AutoAcceptNotificationGate
  private readonly _client: NtfyClient

  constructor(private readonly _context: AutoGameflowMainContext) {
    this._gate = new AutoAcceptNotificationGate(
      () => this._context.settings.autoAcceptNotifyEnabled
    )
    this._client = new NtfyClient(() => this._context.network.createAxiosClient())
  }

  watch() {
    const { leagueClient, logger, mobxUtils } = this._context

    leagueClient.events.on('/lol-matchmaking/v1/ready-check', (event) => {
      if (event.data) {
        this._gate.onReadyCheckResponse(event.data.playerResponse)
      }
    })

    mobxUtils.reaction(
      () => leagueClient.data.gameflow.phase,
      (phase) => {
        if (this._gate.onPhaseChanged(phase)) {
          logger.info('Match accepted by all players, sending push notification')
          void this._notifyMatchAccepted()
        }
      },
      { fireImmediately: true }
    )
  }

  onAcceptRequestSucceeded() {
    this._gate.onAcceptRequestSucceeded()
  }

  async sendTest() {
    const { settings } = this._context

    if (!settings.ntfyServerUrl.trim() || !settings.ntfyTopic.trim()) {
      throw new Error(i18next.t(`${MATCH_ACCEPTED_NOTIFICATION_KEY}.missing-configuration`))
    }

    await this._publish(
      i18next.t(`${MATCH_ACCEPTED_NOTIFICATION_KEY}.test-title`),
      i18next.t(`${MATCH_ACCEPTED_NOTIFICATION_KEY}.test-body`),
      ['bell']
    )
  }

  private async _notifyMatchAccepted() {
    const { logger, settings } = this._context

    if (!settings.ntfyServerUrl.trim() || !settings.ntfyTopic.trim()) {
      logger.info('Skipped match-accepted notification: ntfy server or topic is not configured')
      return
    }

    try {
      await this._publish(
        i18next.t(`${MATCH_ACCEPTED_NOTIFICATION_KEY}.title`),
        i18next.t(`${MATCH_ACCEPTED_NOTIFICATION_KEY}.body`),
        ['white_check_mark']
      )

      logger.info('Sent match-accepted push notification')
    } catch (error) {
      logger.warn(`Failed to send match-accepted push notification: ${formatError(error)}`)
    }
  }

  private async _publish(title: string, message: string, tags: string[]) {
    const { settings } = this._context

    await this._client.publish({
      serverUrl: settings.ntfyServerUrl,
      topic: settings.ntfyTopic,
      accessToken: settings.ntfyAccessToken.trim() || undefined,
      title,
      message,
      tags
    })
  }
}
