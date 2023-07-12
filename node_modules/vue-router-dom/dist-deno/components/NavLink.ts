import { Link, linkProps } from './Link'

import { computed, defineComponent, h, toRefs, PropType } from 'vue'
import { useLocation } from '../hooks/useLocation'
import { useResolvedPath } from '../hooks/useResolvedPath'
import { useComputedCallback } from '../utils/useComputedCallback'

import type { ComputedCallback } from '../utils/useComputedCallback'

const useCaseSensitive = (
  caseSensitiveValue: ComputedCallback<boolean>,
  stringValue: ComputedCallback<string>,
) => {
  const caseSensitive = useComputedCallback(caseSensitiveValue)
  const string = useComputedCallback(stringValue)

  return computed(() => {
    const stringValue = string.value
    return caseSensitive.value ? stringValue : stringValue.toLowerCase()
  })
}

export const NavLink = defineComponent({
  name: 'NavLink',

  props: {
    activeClassName: {
      default: '',
      required: false,
      type: String,
    },
    activeStyle: {
      default: () => ({}),
      required: false,
      type: Object as PropType<Record<string, string>>,
    },
    caseSensitive: {
      default: false,
      required: false,
      type: Boolean,
    },
    end: {
      default: false,
      required: false,
      type: Boolean,
    },
    ariaCurrent: { default: 'page', type: String, required: false },
    ...linkProps,
  },

  setup(props, { slots }) {
    const location = useLocation()
    const { to, caseSensitive } = toRefs(props)
    const path = useResolvedPath(to)

    const locationPathname = computed(() => location.value.pathname)
    const toPathname = computed(() => path.value.pathname)

    const caseSensitiveLocationPathname = useCaseSensitive(
      caseSensitive,
      locationPathname,
    )
    const caseSensitiveToPathname = useCaseSensitive(caseSensitive, toPathname)

    const isActive = computed(() => {
      const locationPathname = caseSensitiveLocationPathname.value
      const toPathname = caseSensitiveToPathname.value
      return props.end
        ? locationPathname === toPathname
        : locationPathname.startsWith(toPathname)
    })

    const ariaCurrent = computed(() =>
      isActive.value ? props.ariaCurrent : undefined,
    )

    const className = computed(() => isActive.value && props.activeClassName)

    const style = computed(() => isActive.value && props.activeStyle)

    return () =>
      h(
        Link,
        {
          style: style.value,
          class: className.value,
          to: props.to,
          ariaCurrent: ariaCurrent.value,
        },
        { default: slots.default },
      )
  },
})
