import { actionTypes } from "./types";

export const success = ({ name, payload }) => {
  return {
    name: name,
    type: actionTypes.SUCCESS,
    payload: payload,
  };
};

export const error = (name, payload) => {
  return {
    name: name,
    type: actionTypes.FAIL,
    payload: payload,
  };
};
