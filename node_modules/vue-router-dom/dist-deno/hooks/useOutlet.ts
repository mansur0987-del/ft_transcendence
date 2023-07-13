import { inject, computed, ComputedRef } from 'vue'
import { ROUTE_CONTEXT } from '../api/keys'

import type { RouterParams, RouteContextObject } from '../api/types'

export const useRouteContext = <P extends RouterParams = RouterParams>() =>
  inject(
    ROUTE_CONTEXT,
    computed(() => ({
      pathname: '',
      outlet: null,
      params: {},
      route: null,
    })),
  ) as ComputedRef<RouteContextObject<P>>

export const useOutlet = () => {
  const context = useRouteContext()
  return computed(() => context.value.outlet)
}
