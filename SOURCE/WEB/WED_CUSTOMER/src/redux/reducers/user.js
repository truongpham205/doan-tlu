import { actionTypes } from "../types";

const initialState = {
  data: null,
  isLoading: false,
  error: false,
};

export const userReducer = (state = initialState, action) => {
  if (action.name === actionTypes.USER) {
    switch (action.type) {
      case actionTypes.LOADING:
        return { ...state, isLoading: true, error: false };
      case actionTypes.SUCCESS:
        return {
          ...state,
          data: action.payload,
          isLoading: false,
          error: false,
        };
      case actionTypes.FAIL:
        return {
          ...state,
          data: action.payload.data,
          isLoading: false,
          error: true,
        };
      default:
        return state;
    }
  } else {
    return state;
  }
};
