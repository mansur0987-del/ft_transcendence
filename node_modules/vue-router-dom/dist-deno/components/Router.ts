import { defineComponent, renderSlot, provide, PropType } from 'vue'
import { LOCATION_CONTEXT } from '../api/keys'

import { Location, Action } from 'history'
import { Navigator } from '../api/types'

export const Router = defineComponent({
  name: 'Router',

  props: {
    location: { required: true, type: Object as PropType<Location> },
    navigator: { required: true, type: Object as PropType<Navigator> },
    action: {
      required: false,
      type: String as PropType<Action>,
      default: Action.Pop,
    },
    static: { required: false, type: Boolean, default: false },
  },

  setup(props, { slots }) {
    provide(LOCATION_CONTEXT, props)

    return () => renderSlot(slots, 'default')
  },
})
