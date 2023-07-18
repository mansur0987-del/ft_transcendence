import { computed, isRef } from 'vue'

import type { Ref } from 'vue'

export type ComputedCallback<T> = Ref<T> | (() => T) | T

export const useComputedCallback = <T>(value: ComputedCallback<T>): Ref<T> =>
  value instanceof Function
    ? computed(value)
    : isRef(value)
    ? value
    : computed(() => value)
