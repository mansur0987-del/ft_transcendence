import { defineComponent } from 'vue'
import { useOutlet } from '../hooks/useOutlet'

export const Outlet = defineComponent({
  name: 'Outlet',

  setup() {
    const outletElement = useOutlet()

    return () => outletElement.value
  },
})
