import { put, takeEvery, call } from 'redux-saga/effects'
import { LOGIN, LOGIN_SUCCESS, LOGIN_FAIL } from '../../actions/type'
import * as API from 'constants/Api'

export function* login(action) {
  try {
    const response = yield call(API.login, action.payload)
    yield put({ type: LOGIN_SUCCESS, payload: response.data })
  } catch (err) {
    yield put({ type: LOGIN_FAIL, payload: err })
  }
}
const watchLogin = takeEvery(LOGIN, login)
export default watchLogin
