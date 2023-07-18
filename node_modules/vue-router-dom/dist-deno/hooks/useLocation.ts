import { inject, toRef, Ref } from 'vue'
import type { State, Location } from 'history'
import { LOCATION_CONTEXT } from '../api/keys'
import { assert } from '../utils/assert'

export const useLocation = <S extends State = State>() => {
  const locationContext = inject(LOCATION_CONTEXT, null)

  assert(
    locationContext,
    `useLocation() may be used only in the context of a <Router> component.`,
  )

  return toRef(locationContext, 'location') as Ref<Location<S>>
}
