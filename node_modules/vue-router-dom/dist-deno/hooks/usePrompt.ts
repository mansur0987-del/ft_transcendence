import { useComputedCallback } from '../utils/useComputedCallback'
import { useBlocker } from './useBlocker'

import type { ComputedCallback } from '../utils/useComputedCallback'

export const usePrompt = (
  messageValue: ComputedCallback<string>,
  whenValue: ComputedCallback<boolean> = true,
) => {
  const message = useComputedCallback(messageValue)

  useBlocker((tx) => {
    if (window.confirm(message.value)) {
      tx.retry()
    }
  }, whenValue)
}
