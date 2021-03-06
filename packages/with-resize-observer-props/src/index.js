import { createElement, Component } from 'react'
import { setDisplayName, wrapDisplayName } from 'recompose'

const isResizeObserverSupported = typeof global.ResizeObserver === 'function'

const withResizeObserverProps = (mapStateToProps, onRefName = 'onRef') => (Target) => {
  if (!isResizeObserverSupported) {
    return Target
  }

  class WithResizeObserverProps extends Component {
    constructor (props, context) {
      super(props, context)

      this.state = {}
      this.onObserve = this.onObserve.bind(this)
      this.onRef = this.onRef.bind(this)
      this.observer = new global.ResizeObserver(this.onObserve)
    }

    componentDidMount () {
      this.observer.observe(this.domNode)
    }

    componentWillUnmount () {
      this.observer.disconnect()
    }

    onRef (ref) {
      this.domNode = ref

      if (typeof this.props[onRefName] === 'function') {
        this.props[onRefName](ref)
      }
    }

    onObserve (entries) {
      this.setState(
        entries.reduce((result, entry) => ({
          ...result,
          ...mapStateToProps(entry.contentRect)
        }), {})
      )
    }

    render () {
      return createElement(Target, {
        ...this.props,
        ...this.state,
        [onRefName]: this.onRef
      })
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    return setDisplayName(
      wrapDisplayName(Target, 'withResizeObserverProps')
    )(WithResizeObserverProps)
  }

  return WithResizeObserverProps
}

export default withResizeObserverProps
