import { ApiClient } from 'constants/Api'

export const createRoom = (payload) => ApiClient.post('/service/createOrUpdateService', payload)
export const updateRoom = (payload) => ApiClient.post('/service/createOrUpdateService', payload)
export const getListRoom = (payload) => ApiClient.get('/service/listService', payload)
export const getRoomDetail = (payload) => ApiClient.get('/service/serviceDetail', payload)
export const deleteRoom = (payload) => ApiClient.post('/service/deleteService', payload)
