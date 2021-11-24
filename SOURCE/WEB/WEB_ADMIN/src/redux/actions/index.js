import { GET_LIST_ACCOUNT, LOGIN, GET_LIST_OVERVIEW, GET_LIST_NOTIFICATION } from './type'

export const getListAccountAction = (payload) => ({
  type: GET_LIST_ACCOUNT,
  payload: payload,
})

export const login = (payload) => ({
  type: LOGIN,
  payload: payload,
})

export const getListOverView = (payload) => ({
  type: GET_LIST_OVERVIEW,
  payload: payload,
})

export const getListNotification = (payload) => ({
  type: GET_LIST_NOTIFICATION,
  payload: payload,
})
