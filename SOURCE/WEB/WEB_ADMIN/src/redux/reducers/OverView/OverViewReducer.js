import { GET_LIST_OVERVIEW, GET_LIST_OVERVIEW_SUCCESS, GET_LIST_OVERVIEW_FAIL } from '../../actions/type'

const initialState = {
  data: {},
  isLoading: true,
  error: null,
}

export default function (state = initialState, action) {
  switch (action.type) {
    case GET_LIST_OVERVIEW: {
      return { ...state, isLoading: true }
    }
    case GET_LIST_OVERVIEW_SUCCESS: {
      return {
        ...state,
        isLoading: false,
        error: null,
        data: action.payload,
      }
    }
    case GET_LIST_OVERVIEW_FAIL: {
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
