import type { AutoGameflowActionController } from './action-controller'
import type { AutoAcceptNotifier } from './auto-accept-notification'
import type { AutoGameflowMainContext } from './context'
import type { AutoGameflowMatchmakingController } from './matchmaking-controller'

export class AutoGameflowIpcHandlers {
  constructor(
    private readonly _context: AutoGameflowMainContext,
    private readonly _actionController: AutoGameflowActionController,
    private readonly _matchmaking: AutoGameflowMatchmakingController,
    private readonly _notifier: AutoAcceptNotifier
  ) {}

  register() {
    const { ipc, namespace, state } = this._context

    ipc.onCall(namespace, 'cancelAutoAccept', () => {
      this._actionController.cancelAutoAccept('normal')
    })

    ipc.onCall(namespace, 'cancelAutoMatchmaking', () => {
      this._matchmaking.cancelAutoMatchmaking('normal')
    })

    ipc.onCall(namespace, 'setFriendsToBeInvited', (_, puuids: string[]) => {
      state.setFriendsToBeInvited(puuids)
    })

    ipc.onCall(namespace, 'sendTestNotification', () => this._notifier.sendTest())
  }
}
