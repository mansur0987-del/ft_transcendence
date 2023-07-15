import { useResolvedPath } from './useResolvedPath'

import { computed, inject, toRef } from 'vue'
import { useComputedCallback } from '../utils/useComputedCallback'

import type { ComputedCallback } from '../utils/useComputedCallback'
import type { To } from 'history'
import { LOCATION_CONTEXT } from '../api/keys'
import { assert } from '../utils/assert'

export const useHref = (toValue: ComputedCallback<To>) => {
  const locationContext = inject(LOCATION_CONTEXT, null)

  assert(
    locationContext,
    `useHref() may be used only in the context of a <Router> component.`,
  )

  const navigator = toRef(locationContext, 'navigator')
  const to = useComputedCallback(toValue)

  const path = useResolvedPath(to)
  return computed(() => navigator.value.createHref(path.value))
}
