import type { VNode } from 'vue'
import { Action, Location, History } from 'history'

export interface RouterMatch<Params extends RouterParams = RouterParams> {
  isExact: boolean
  params: Params
  path: string
  url: string
}
export interface MatchPathOptions {
  path?: MatchPathOptionsPath
  exact?: boolean
  strict?: boolean
  sensitive?: boolean
}

export type MatchPathOptionsPath = string | string[]

export type RouterParams = Record<string, string>

export interface RouteObject {
  caseSensitive?: boolean
  children?: RouteObject[]
  element: VNode | null
  path: string
}

export interface PartialRouteObject {
  caseSensitive?: boolean
  children?: PartialRouteObject[]
  element: VNode | null
  path: string
}

export interface RouteContextObject<P extends RouterParams = RouterParams> {
  outlet: VNode | null
  params: P
  pathname: string
  route: RouteObject | null
}

export type Navigator = Omit<
  History,
  'action' | 'location' | 'back' | 'forward' | 'listen'
>
export interface LocationContextObject {
  action: Action
  location: Location
  navigator: Navigator
  static: boolean
}

export type PathPattern =
  | string
  | { path: string; caseSensitive?: boolean; end?: boolean }

export interface PathMatch<P extends RouterParams = RouterParams> {
  path: string
  pathname: string
  params: P
}
