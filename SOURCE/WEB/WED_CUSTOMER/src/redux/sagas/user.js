import Cookie from "js-cookie";
import { all, call, fork, put, takeEvery } from "redux-saga/effects";
import loginApi from  '../../networks/loginApi'
import { error, success } from "../status";
import { actionTypes } from "../types";

function* login(action) {
  try {
    yield put({
      name: actionTypes.USER,
      type: actionTypes.LOADING,
    });
    let response = yield call(loginApi.login, action.payload);
    if (response.status === 1) {
      response.data.token && Cookie.set("token", response.data.token);
    } else {
      yield put(error({ name: action.name, payload: response }));
    }
    yield put(success({ name: action.name, payload: response }));
  } catch (e) {
    yield put(error({ name: action.name, payload: e }));
  }
}

function* watchLoginSaga() {
  yield takeEvery(actionTypes.LOGIN, login);
}

export default function* userSaga() {
  yield all([
    fork(watchLoginSaga)
  ]);
}
