import { Outlet } from './Outlet'

import { defineComponent, h, renderSlot, PropType } from 'vue'

import type { VNode } from 'vue'

export const Route = defineComponent({
  name: 'Route',

  props: {
    path: {
      default: '',
      required: false,
      type: String,
    },
    caseSensitive: {
      default: false,
      required: false,
      type: Boolean,
    },
    element: {
      default: () => h(Outlet),
      required: false,
      type: Object as PropType<VNode>,
    },
  },

  setup(props, { slots }) {
    return () => renderSlot(slots, 'element', undefined, () => [props.element])
  },
})
