import Url from '@constants/Url'
import { ApiClient } from '@constants/Api'

const orderApi = {
  createOrder: (payload) => {
    return ApiClient.post(Url.createOrder, payload)
  },
  listOrder: (payload) => {
    return ApiClient.get(Url.listOrder, payload)
  },
  orderDetail: (payload) => {
    return ApiClient.get(Url.orderDetail, payload)
  },
  createTransaction: (payload) => {
    return ApiClient.post(Url.createTransaction, payload)
  },
  orderCustomer: (payload) => {
    return ApiClient.post(Url.orderCustomer, payload)
  },
  orderReview: (payload) => {
    return ApiClient.post(Url.orderReview, payload)
  },
  transactionDetail: (payload) => {
    return ApiClient.get(Url.transactionDetail, payload)
  },
  createOrderCustomer: (payload) => {
    return ApiClient.post(Url.createOrderCustomer, payload)
  },
  deleteOrderCustomer: (payload) => {
    return ApiClient.post(Url.deleteOrderCustomer, payload)
  },
  requestPayment: (payload) => {
    return ApiClient.post(Url.requestPament, payload)
  },
}

export default orderApi
