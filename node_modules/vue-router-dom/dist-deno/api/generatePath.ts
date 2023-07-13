import { RouterParams } from './types'
import { assert } from '../utils/assert'

export const generatePath = (
  path: string,
  params: RouterParams = {},
): string => {
  return path
    .replace(/:(\w+)/g, (_, key) => {
      assert(params[key] != null, `Missing ":${key}" param`)
      return params[key]
    })
    .replace(/\/*\*$/, () =>
      params['*'] == null ? '' : params['*'].replace(/^\/*/, '/'),
    )
}
