import { defineComponent, computed, watch, h, PropType } from 'vue'
import { createMemoryHistory, Update, InitialEntry } from 'history'
import { Router } from './Router'
import { useReducer } from '../utils/useReducer'

export const MemoryRouter = defineComponent({
  name: 'MemoryRouter',

  props: {
    initialEntries: {
      required: false,
      type: Array as PropType<InitialEntry[]>,
    },
    initialIndex: { required: false, type: Number },
  },

  setup(props, { slots }) {
    const history = computed(() =>
      createMemoryHistory({
        initialEntries: props.initialEntries,
        initialIndex: props.initialIndex,
      }),
    )

    const [state, dispatch] = useReducer(
      (state, { action, location }: Update) => {
        state.action = action
        state.location = location
      },
      {
        action: history.value.action,
        location: history.value.location,
      },
    )

    watch(history, (history) => history.listen(dispatch), {
      flush: 'sync',
      immediate: true,
    })

    return () =>
      h(
        Router,
        {
          location: state.location,
          action: state.action,
          navigator: history.value,
        },
        { default: slots.default },
      )
  },
})
