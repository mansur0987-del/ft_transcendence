import { watchEffect, toRef, inject } from 'vue'
import { useComputedCallback } from '../utils/useComputedCallback'

import type { Blocker } from 'history'
import type { ComputedCallback } from '../utils/useComputedCallback'
import { LOCATION_CONTEXT } from '../api/keys'
import { assert } from '../utils/assert'

export const useBlocker = (
  blocker: Blocker,
  whenValue: ComputedCallback<boolean> = true,
) => {
  const locationContext = inject(LOCATION_CONTEXT, null)

  assert(
    locationContext,
    `useBlocker() may be used only in the context of a <Router> component.`,
  )

  const when = useComputedCallback(whenValue)
  const navigator = toRef(locationContext, 'navigator')

  watchEffect((onCleanup) => {
    if (!when.value) {
      return
    }

    const unblock = navigator.value.block((tx) => {
      blocker({
        ...tx,
        retry() {
          unblock()
          tx.retry()
        },
      })
    })

    onCleanup(unblock)
  })
}
