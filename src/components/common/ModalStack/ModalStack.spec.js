import React from 'react'
import Immutable from 'immutable'
import injectTapEventPlugin from 'react-tap-event-plugin'
import { Provider } from 'react-redux'
import { mockStore } from 'specsInit'
import { DUCK_MODALS } from 'redux/modals/actions'
import { mount } from 'enzyme'
import ModalDialog from 'components/dialogs/ModalDialog'
import ModalStack from 'components/common/ModalStack/ModalStack'

injectTapEventPlugin()

const modals = {
  foo: {
    key: 'foo',
    component: ModalDialog,
    props: {
      children: (<div>Foo</div>),
    },
  },
  bar: {
    key: 1,
    component: ModalDialog,
    props: {
      children: (<div>Bar</div>),
    },
  },
}

describe('ModalStack', () => {
  it('should mount without children', () => {
    const store = mockStore(Immutable.Map({
      [DUCK_MODALS]: {
        stack: [],
        counter: 0,
      },
    }))
    const wrapper = mount(
      <Provider store={store}>
        <ModalStack />
      </Provider>
    )

    expect(wrapper.find(ModalStack).children().length).toEqual(0)
  })

  it('should mount with 1 modal', () => {
    const store = mockStore(Immutable.Map({
      [DUCK_MODALS]: {
        stack: [modals.foo],
        counter: 0,
      },
    }))
    const wrapper = mount(
      <Provider store={store}>
        <ModalStack />
      </Provider>
    )

    expect(wrapper.find(ModalStack).children().length).toEqual(1)
  })

  it('should mount with 2 modals', () => {
    const store = mockStore(Immutable.Map({
      [DUCK_MODALS]: {
        stack: [modals.foo, modals.bar],
        counter: 0,
      },
    }))
    const wrapper = mount(
      <Provider store={store}>
        <ModalStack />
      </Provider>
    )

    expect(wrapper.find(ModalStack).children().length).toEqual(2)
  })
})

