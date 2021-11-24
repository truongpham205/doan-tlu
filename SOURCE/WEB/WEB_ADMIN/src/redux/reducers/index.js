import { combineReducers } from 'redux'
import ListAccountReducer from './Account/ListAccountReducer'

import CustomerReducer from './CustomerSlice'
import LoginReducer from './Login/LoginReducer'
import OverViewReducer from './OverView/OverViewReducer'
import NotificationReducer from './Notification/NotificationReducer'

import { RESET } from '../actions/type'

let appReducer = combineReducers({
  listAccountReducer: ListAccountReducer,
  customerReducer: CustomerReducer,
  loginReducer: LoginReducer,
  overViewReducer: OverViewReducer,
  NotificationReducer: NotificationReducer,
})

const initialState = appReducer({}, {})

export default (state, action) => {
  if (action.type === RESET) {
    state = initialState
  }

  return appReducer(state, action)
}
