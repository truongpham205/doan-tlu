import { all, fork } from "redux-saga/effects";
import userSaga from "./user";

export const rootSaga = function* root() {
  yield all([fork(userSaga)]);
};
