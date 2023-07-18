import { reactive, readonly } from 'vue'

export const useReducer = <S extends object, A extends unknown[]>(
  reducer: (state: S, ...args: A) => void,
  initialState: S,
) => {
  const state = reactive(initialState)

  const dispatch = (...arg: A) => {
    reducer(state as S, ...arg)
  }

  return [readonly(state), dispatch] as const
}
