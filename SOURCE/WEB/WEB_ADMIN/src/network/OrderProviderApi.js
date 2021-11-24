import { ApiClient } from 'constants/Api'
export const getListOrder = (payload) => ApiClient.get('/provider/listOrder', payload)
export const getOrderDetail = (payload) => ApiClient.get('/order/detail', payload)
export const updateStatus = (payload) => ApiClient.post('/order/updateStatus', payload)
