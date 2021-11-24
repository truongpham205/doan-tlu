import { LOGIN, LOGIN_SUCCESS, LOGIN_FAIL } from '../../actions/type'

const initialState = {
  data: {},
  isLoading: true,
  error: null,
}

export default function (state = initialState, action) {
  switch (action.type) {
    case LOGIN: {
      return { ...state, isLoading: true }
    }

    case LOGIN_SUCCESS: {
      return {
        ...state,
        isLoading: false,
        error: null,
        data: action.payload,
      }
    }
    case LOGIN_FAIL: {
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
