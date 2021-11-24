import { ApiClient } from 'constants/Api'

export const getListCustomer = (payload) => ApiClient.get('/customer/listCustomer', payload)
export const getCustomerDetail = (payload) => ApiClient.get('/customer/detail', payload)
export const changeStatusCustomer = (payload) => ApiClient.post('/customer/updateIsActive', payload)
export const deleteCustomer = (payload) => ApiClient.post('/customer/deleteCustomer', payload)
export const registerCustomer = (payload) => ApiClient.post('/customer/register', payload)
export const getPointHistory = (payload) => ApiClient.get('/user/getPointHistory', payload)
export const getListOrder = (payload) => ApiClient.get('/customer/listOrder', payload)
export const getListAccumulation = (payload) => ApiClient.get('/user/getPointHistory', payload)
