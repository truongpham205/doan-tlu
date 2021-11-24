import { ApiClient } from 'constants/Api'
//order Book room
export const createOrderBookRoom = (payload) => ApiClient.post('/order/createOrder', payload)
export const getListOrderBookRoom = (payload) => ApiClient.get('/order/listOrder', payload)
export const assignSale = (payload) => ApiClient.post('/order/asign', payload)
export const getOrderBookRoomDetail = (payload) => ApiClient.get('/order/detail', payload)
export const updateTransaction = (payload) => ApiClient.post('/order/updateTransaction', payload)
export const createTransaction = (payload) => ApiClient.post('/order/createTransaction', payload)
export const updatePrice = (payload) => ApiClient.post('/order/updatePrice', payload)
export const resetPaymentTime = (payload) => ApiClient.post('/order/resetpaymentTime', payload)
export const createSurcharges = (payload) => ApiClient.post('/order/createOrUpdateSurcharge', payload)
export const updateSurcharges = (payload) => ApiClient.post('/order/createOrUpdateSurcharge', payload)
export const updatePaymentStatus = (payload) => ApiClient.post('/order/updatePaymentStatus', payload)
export const changePaymentStatus = (payload) => ApiClient.post('/order/changePaymentStatus', payload)

// order Book tour
export const createOrderBookTour = (payload) => ApiClient.post('/tour/createOrUpdateTour', payload)
export const getListOrderTour = (payload) => ApiClient.get('/tour/listTour', payload)
export const getOrderTourDetail = (payload) => ApiClient.get('/tour/listTour', payload)
export const getOrderBookTourDetail = (payload) => ApiClient.get('/tour/getdetail', payload)

//update orderStatus
export const changeOrderStatus = (payload) => ApiClient.post('/order/updateStatus', payload)

export const orderOverview = (payload) => ApiClient.get('/order/overView', payload)
export const downloadExcel = (payload) => ApiClient.get('/order/export', payload)
