import { ApiClient } from 'constants/Api'
export const createTour = (payload) => ApiClient.post('/tour/createOrUpdateTour', payload)
export const updateTour = (payload) => ApiClient.post('/tour/createOrUpdateTour', payload)
export const getListTour = (payload) => ApiClient.get('/tour/listTour', payload)
export const getTourDetail = (payload) => ApiClient.get('/service/serviceDetail', payload)
export const deleteTour = (payload) => ApiClient.post('/service/deleteService', payload)
export const addProvider = (payload) => ApiClient.post('/tour/addProvider', payload)
export const deleteProvider = (payload) => ApiClient.post('/tour/deleteProvider', payload)
export const updateIsPayment = (payload) => ApiClient.post('/tour/updateIsPayment', payload)
