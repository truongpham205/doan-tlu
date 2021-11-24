import { all } from 'redux-saga/effects'
import watchLogin from './Login/LoginSaga'
import watchGetListOverView from './OverView/OverViewSaga'
import watchGetListNotification from './Notification/NotificationSaga'
export default function* rootSaga() {
  yield all([watchLogin, watchGetListOverView, watchGetListNotification])
}
