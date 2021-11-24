import { GET_LIST_ACCOUNT, GET_LIST_ACCOUNT_SUCCESS, GET_LIST_ACCOUNT_FAIL } from '../../actions/type'

const initialState = {
  data: {},
  isLoading: true,
  error: null,
}

export default function (state = initialState, action) {
  switch (action.type) {
    case GET_LIST_ACCOUNT: {
      return { ...state, isLoading: true }
    }
    case GET_LIST_ACCOUNT_SUCCESS: {
      return {
        ...state,
        isLoading: false,
        error: null,
        data: action.payload,

      }
    }
    case GET_LIST_ACCOUNT_FAIL: {
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      }
    }
    default:
      return state
  }
}
