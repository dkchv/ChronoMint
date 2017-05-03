import { Map } from 'immutable'
import reducer from '../../../src/redux/operations/operations'

describe('operations', () => {
  it('should return the initial state', () => {
    expect(
      reducer(undefined, {})
    ).toEqual({
      list: new Map()
    })
  })
})