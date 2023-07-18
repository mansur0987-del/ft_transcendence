import { defineComponent, computed, renderSlot } from 'vue'
import { useRoutes_ } from '../hooks/useRoutes'
import { createRoutesFromChildren } from '../api/createRoutesFromChildren'

export const Routes = defineComponent({
  name: 'Routes',

  props: { basename: { default: '', required: false, type: String } },

  setup(props, { slots }) {
    const routes = computed(() =>
      createRoutesFromChildren([renderSlot(slots, 'default')]),
    )

    const vnode = useRoutes_(routes, () => props.basename)

    return () => vnode.value
  },
})
