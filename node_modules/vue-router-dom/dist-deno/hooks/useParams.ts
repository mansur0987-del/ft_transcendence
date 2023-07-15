import { useRouteContext } from '../hooks/useOutlet'
import { computed } from 'vue'

import type { RouterParams } from '../api/types'

export const useParams = <P extends RouterParams>() => {
  const context = useRouteContext<P>()

  return computed(() => context.value.params)
}
