import { actionTypes } from "../types";

const login = (userInfo) => {
  console.log(userInfo, "chiensdbasdfajhsgfvdsnhgfvdsg");
  return {
    name: actionTypes.USER,
    type: actionTypes.LOGIN,
    payload: userInfo,
  };
};

export { login };
