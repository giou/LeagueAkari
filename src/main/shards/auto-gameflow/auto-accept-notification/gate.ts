import type { GameflowPhase } from '@shared/types/league-client/gameflow'

/**
 * Remembers whether the current ready-check chain was accepted by the local player, and
 * reports the single moment when that chain turns into champion select.
 *
 * `ChampSelect` is the phase the client enters once every player accepted, including modes whose
 * champion select is never shown to the player (observed with Swiftplay), so it is the only
 * match-start signal this feature needs.
 *
 * A chain is the sequence of ready checks that may follow one another when other players
 * decline. Declines by other players never arm the gate, so they never notify.
 */
export class AutoAcceptNotificationGate {
  private _accepted = false

  constructor(private readonly _isEnabled: () => boolean) {}

  /** Local player's ready-check response, as reported by the LCU. */
  onReadyCheckResponse(response: string) {
    if (response === 'Accepted') {
      this._accepted = this._isEnabled()
    } else if (response === 'Declined') {
      this._accepted = false
    }
  }

  /** The auto-accept request was accepted by the LCU. */
  onAcceptRequestSucceeded() {
    this._accepted = this._isEnabled()
  }

  /**
   * @returns true exactly once per accepted match, when the ready check turns into champion
   * select.
   */
  onPhaseChanged(phase: GameflowPhase | null): boolean {
    if (phase === 'ReadyCheck') {
      return false
    }

    const accepted = this._accepted
    this._accepted = false

    return accepted && phase === 'ChampSelect'
  }
}
