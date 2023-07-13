import type { InjectionKey, Ref } from 'vue'
import type { RouteContextObject, LocationContextObject } from './types'

export const ROUTE_CONTEXT: InjectionKey<Ref<RouteContextObject>> = Symbol(
  'ROUTE_CONTEXT',
)

export const LOCATION_CONTEXT: InjectionKey<LocationContextObject> = Symbol(
  'LOCATION_CONTEXT',
)
