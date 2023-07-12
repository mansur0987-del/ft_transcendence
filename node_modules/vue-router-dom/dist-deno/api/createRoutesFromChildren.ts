import { isVNode, Fragment, renderSlot } from 'vue'

import type { VNodeNormalizedChildren, Slots } from 'vue'
import type { RouteObject } from '../api/types'

export const createRoutesFromChildren = (
  normalizedChildren: VNodeNormalizedChildren,
) => {
  const routes: RouteObject[] = []

  const children = Array.isArray(normalizedChildren)
    ? normalizedChildren
    : normalizedChildren instanceof Object
    ? [renderSlot(normalizedChildren as Slots, 'default')]
    : []

  for (const element of children) {
    if (!isVNode(element)) {
      continue
    }

    if (element.type === 'template' || element.type === Fragment) {
      routes.push(...createRoutesFromChildren(element.children))
      continue
    }

    const { path, caseSensitive } = element.props || {}

    const route: RouteObject = {
      path: path || '/',
      caseSensitive: caseSensitive === true,
      element,
    }

    if (element.children) {
      const childRoutes = createRoutesFromChildren(element.children)

      if (childRoutes.length) {
        route.children = childRoutes
      }
    }

    routes.push(route)
  }

  return routes
}
