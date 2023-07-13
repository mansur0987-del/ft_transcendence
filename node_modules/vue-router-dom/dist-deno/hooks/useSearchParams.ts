import { computed } from 'vue'
import { useComputedCallback } from '../utils/useComputedCallback'
import { useNavigate } from './useNavigate'
import { useLocation } from './useLocation'

import type { ComputedCallback } from '../utils/useComputedCallback'
import type { State } from 'history'

/**
 * Creates a URLSearchParams object using the given initializer.
 *
 * This is identical to `new URLSearchParams(init)` except it also
 * supports arrays as values in the object form of the initializer
 * instead of just strings. This is convenient when you need multiple
 * values for a given key, but don't want to use an array initializer.
 *
 * For example, instead of:
 *
 *   let searchParams = new URLSearchParams([
 *     ['sort', 'name'],
 *     ['sort', 'price']
 *   ]);
 *
 * you can do:
 *
 *   let searchParams = createSearchParams({
 *     sort: ['name', 'price']
 *   });
 */
export const createSearchParams = (
  init: URLSearchParamsInit = '',
): URLSearchParams =>
  new URLSearchParams(
    typeof init === 'string' ||
    Array.isArray(init) ||
    init instanceof URLSearchParams
      ? init
      : Object.keys(init).reduce<ParamKeyValuePair[]>((memo, key) => {
          const value = init[key]
          return memo.concat(
            Array.isArray(value) ? value.map((v) => [key, v]) : [[key, value]],
          )
        }, []),
  )

const useSetSearchParams = () => {
  const navigate = useNavigate()

  return (
    nextInit: URLSearchParamsInit,
    navigateOptions?: { replace?: boolean; state?: State },
  ) => {
    navigate(`?${createSearchParams(nextInit)}`, navigateOptions)
  }
}

const useGetSearchParams = (
  defaultInitValue?: ComputedCallback<URLSearchParamsInit>,
) => {
  const defaultInit = useComputedCallback(defaultInitValue)
  const defaultSearchParams = computed(() =>
    createSearchParams(defaultInit.value),
  )
  const location = useLocation()
  const searchParams = computed(() => createSearchParams(location.value.search))

  return computed(() => {
    const defaultSearchParamsValue = defaultSearchParams.value
    const searchParamsValue = createSearchParams(searchParams.value)

    for (const key of defaultSearchParamsValue.keys()) {
      if (!searchParamsValue.has(key)) {
        defaultSearchParamsValue.getAll(key).forEach((value) => {
          searchParamsValue.append(key, value)
        })
      }
    }

    return searchParamsValue
  })
}

export const useSearchParams = (
  defaultInit?: ComputedCallback<URLSearchParamsInit>,
) => {
  const searchParams = useGetSearchParams(defaultInit)
  const setSearchParams = useSetSearchParams()
  return [searchParams, setSearchParams] as const
}

type ParamKeyValuePair = [string, string]
type URLSearchParamsInit =
  | string
  | ParamKeyValuePair[]
  | Record<string, string | string[]>
  | URLSearchParams
