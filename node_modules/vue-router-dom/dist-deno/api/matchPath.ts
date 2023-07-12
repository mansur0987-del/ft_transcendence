import { assert } from '../utils/assert'

import type { RouterParams, PathPattern, PathMatch } from './types'

const compilePath = (
  path: string,
  caseSensitive: boolean,
  end: boolean,
): [RegExp, string[]] => {
  const keys: string[] = []
  let source =
    '^(' +
    path
      .replace(/^\/*/, '/') // Make sure it has a leading /
      .replace(/\/?\*?$/, '') // Ignore trailing / and /*, we'll handle it below
      .replace(/[\\.*+^$?{}|()[\]]/g, '\\$&') // Escape special regex chars
      .replace(/:(\w+)/g, (_: string, key: string) => {
        keys.push(key)
        return '([^\\/]+)'
      }) +
    ')'

  if (path.endsWith('*')) {
    if (path.endsWith('/*')) {
      source += '\\/?' // Don't include the / in params['*']
    }
    keys.push('*')
    source += '(.*)'
  } else if (end) {
    source += '\\/?'
  }

  if (end) source += '$'

  const flags = caseSensitive ? undefined : 'i'
  const matcher = new RegExp(source, flags)

  return [matcher, keys]
}

const safelyDecodeURIComponent = (value: string, paramName: string) => {
  try {
    return decodeURIComponent(value.replace(/\+/g, ' '))
  } catch (error) {
    assert(
      false,
      `The value for the URL param "${paramName}" will not be decoded because` +
        ` the string "${value}" is a malformed URL segment. This is probably` +
        ` due to a bad percent encoding (${error}).`,
    )
  }
}

export const matchPath = <P extends RouterParams = RouterParams>(
  pattern: PathPattern,
  pathname: string,
): PathMatch<P> | null => {
  if (typeof pattern === 'string') {
    pattern = { path: pattern }
  }

  const { path, caseSensitive = false, end = true } = pattern
  const [matcher, paramNames] = compilePath(path, caseSensitive, end)
  const match = pathname.match(matcher)

  if (!match) return null

  const matchedPathname = match[1]
  const values = match.slice(2)

  const params = paramNames.reduce((memo, paramName, index) => {
    memo[paramName] = safelyDecodeURIComponent(values[index], paramName)
    return memo
  }, {} as RouterParams) as P

  return { path, pathname: matchedPathname, params }
}
