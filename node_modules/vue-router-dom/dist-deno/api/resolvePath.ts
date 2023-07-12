import { parsePath } from 'history'

import type { To, Path } from 'history'

const trimTrailingSlashes = (path: string) => path.replace(/\/+$/, '')
const normalizeSlashes = (path: string) => path.replace(/\/\/+/g, '/')
export const joinPaths = (paths: string[]) => normalizeSlashes(paths.join('/'))
const splitPath = (path: string) => normalizeSlashes(path).split('/')

const resolvePathname = (toPathname: string, fromPathname: string): string => {
  const segments = splitPath(trimTrailingSlashes(fromPathname))
  const relativeSegments = splitPath(toPathname)

  relativeSegments.forEach((segment) => {
    if (segment === '..') {
      // Keep the root "" segment so the pathname starts at /
      if (segments.length > 1) segments.pop()
    } else if (segment !== '.') {
      segments.push(segment)
    }
  })

  return segments.length > 1 ? joinPaths(segments) : '/'
}

export const resolvePath = (to: To, fromPathname = '/'): Path => {
  const { pathname: toPathname, search = '', hash = '' } =
    typeof to === 'string' ? parsePath(to) : to

  const pathname = toPathname
    ? resolvePathname(
        toPathname,
        toPathname.startsWith('/') ? '/' : fromPathname,
      )
    : fromPathname

  return { pathname, search, hash }
}
