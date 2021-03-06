import Immutable from 'immutable'

export const POLLS_VOTE_LIMIT = 'voting/POLLS_LIMIT'
export const POLLS_LOAD = 'voting/POLLS_LOAD'
export const POLLS_LIST = 'voting/POLLS_LIST'
export const POLLS_CREATE = 'voting/POLLS_CREATE'
export const POLLS_REMOVE = 'voting/POLLS_REMOVE'
export const POLLS_REMOVE_STUB = 'voting/POLLS_REMOVE_STUB'
export const POLLS_UPDATE = 'voting/POLLS_UPDATE'

const initialState = {
  voteLimitInTIME: null,
  list: new Immutable.Map(),
  isFetching: false,
  isFetched: false,
}

export default (state = initialState, action) => {
  switch (action.type) {
    case POLLS_VOTE_LIMIT:
      return {
        ...state,
        voteLimitInTIME: action.voteLimitInTIME,
      }
    case POLLS_LOAD:
      return {
        ...state,
        isFetching: true,
      }
    case POLLS_LIST:
      return {
        ...state,
        isFetching: false,
        isFetched: true,
        list: new Immutable.Map(action.list),
      }
    case POLLS_CREATE:
      return {
        ...state,
        list: state.list
          .set(
            action.poll.poll().id(),
            action.poll
          ),
      }
    case POLLS_REMOVE_STUB:
      return {
        ...state,
        list: state.list
          .filter((poll) => {
            const hash = poll.transactionHash()
            return hash === null || hash !== action.transactionHash
          }),
      }
    case POLLS_UPDATE:
      return {
        ...state,
        list: state.list.set(
          action.poll.poll().id(),
          action.poll
        ),
      }
    case POLLS_REMOVE:
      return {
        ...state,
        list: state.list.delete(action.id),
      }
    default:
      return state
  }
}
