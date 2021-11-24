import { put, takeEvery, call } from 'redux-saga/effects'
import { GET_LIST_NOTIFICATION, GET_LIST_NOTIFICATION_SUCCESS, GET_LIST_NOTIFICATION_FAIL } from '../../actions/type'
import * as API from 'constants/Api'

export function* getListOverView(action) {
  try {
    const response = yield call(API.getListNotification, action.payload)
    yield put({ type: GET_LIST_NOTIFICATION_SUCCESS, payload: response })
  } catch (err) {
    yield put({ type: GET_LIST_NOTIFICATION_FAIL, payload: err })
  }
}
const watchGetListNotification = takeEvery(GET_LIST_NOTIFICATION, getListOverView)
export default watchGetListNotification
