import { describe, expect, it } from 'vitest'

import { AutoAcceptNotificationGate } from './gate'

function createGate(enabled = true) {
  let current = enabled
  return {
    gate: new AutoAcceptNotificationGate(() => current),
    setEnabled: (value: boolean) => {
      current = value
    }
  }
}

describe('AutoAcceptNotificationGate', () => {
  it('notifies once when an accepted ready check becomes champion select', () => {
    const { gate } = createGate()

    gate.onReadyCheckResponse('Accepted')

    expect(gate.onPhaseChanged('ChampSelect')).toBe(true)
    expect(gate.onPhaseChanged('ChampSelect')).toBe(false)
  })

  it('does not notify when the previous ready check was declined by someone else', () => {
    const { gate } = createGate()

    gate.onReadyCheckResponse('Accepted')
    expect(gate.onPhaseChanged('Matchmaking')).toBe(false)

    gate.onReadyCheckResponse('Accepted')
    expect(gate.onPhaseChanged('ChampSelect')).toBe(true)
  })

  it('ignores a repeated ready check event while still armed', () => {
    const { gate } = createGate()

    gate.onReadyCheckResponse('Accepted')

    expect(gate.onPhaseChanged('ReadyCheck')).toBe(false)
    expect(gate.onPhaseChanged('ChampSelect')).toBe(true)
  })

  it('does not notify after the local player declined', () => {
    const { gate } = createGate()

    gate.onReadyCheckResponse('Accepted')
    gate.onReadyCheckResponse('Declined')

    expect(gate.onPhaseChanged('ChampSelect')).toBe(false)
  })

  it('does not notify when auto accept is disabled', () => {
    const { gate, setEnabled } = createGate(false)

    setEnabled(false)
    gate.onReadyCheckResponse('Accepted')

    expect(gate.onPhaseChanged('ChampSelect')).toBe(false)
  })

  it('notifies when the accept request succeeded without a ready check event', () => {
    const { gate } = createGate()

    gate.onAcceptRequestSucceeded()

    expect(gate.onPhaseChanged('ChampSelect')).toBe(true)
  })

  it('re-arms for the next match after a completed notification', () => {
    const { gate } = createGate()

    gate.onReadyCheckResponse('Accepted')
    expect(gate.onPhaseChanged('ChampSelect')).toBe(true)

    gate.onPhaseChanged('InProgress')
    gate.onReadyCheckResponse('Accepted')

    expect(gate.onPhaseChanged('ChampSelect')).toBe(true)
  })
})
