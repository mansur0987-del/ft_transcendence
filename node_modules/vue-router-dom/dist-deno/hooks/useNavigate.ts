import { resolvePath } from '../api/resolvePath'
import { useRouteContext } from '../hooks/useOutlet'
import { computed, inject, toRef } from 'vue'

import type { State, To } from 'history'
import { LOCATION_CONTEXT } from '../api/keys'
import { assert } from '../utils/assert'

export const useNavigate = () => {
  const locationContext = inject(LOCATION_CONTEXT, null)

  assert(
    locationContext,
    `useNavigate() may be used only in the context of a <Router> component.`,
  )

  const navigator = toRef(locationContext, 'navigator')

  const context = useRouteContext()
  const pathname = computed(() => context.value.pathname)

  const navigate = (
    to: To | number,
    {
      state,
      replace = false,
    }: {
      state?: State
      replace?: boolean
    } = {},
  ) => {
    const navigatorValue = navigator.value

    if (typeof to === 'number') {
      return navigatorValue.go(to)
    }

    const path = resolvePath(to, pathname.value)
    ;(replace ? navigatorValue.replace : navigatorValue.push)(path, state)
  }

  return navigate
}
