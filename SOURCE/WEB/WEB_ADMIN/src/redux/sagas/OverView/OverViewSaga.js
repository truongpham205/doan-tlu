import { put, takeEvery, call } from 'redux-saga/effects'
import { GET_LIST_OVERVIEW, GET_LIST_OVERVIEW_SUCCESS, GET_LIST_OVERVIEW_FAIL } from '../../actions/type'
import * as API from 'constants/Api'

export function* getListOverView(action) {
  try {
    const response = yield call(API.getListOverView, action.payload)
    yield put({ type: GET_LIST_OVERVIEW_SUCCESS, payload: response })
  } catch (err) {
    yield put({ type: GET_LIST_OVERVIEW_FAIL, payload: err })
  }
}
const watchGetListOverView = takeEvery(GET_LIST_OVERVIEW, getListOverView)
export default watchGetListOverView
