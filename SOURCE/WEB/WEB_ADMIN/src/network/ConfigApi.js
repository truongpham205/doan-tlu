import { ApiClient } from 'constants/Api'

export const getConfig = (payload) => ApiClient.get('/user/getConfig', payload)
export const updateConfig = (payload) => ApiClient.post('/user/updateConfig', payload)
export const getListMessage = (payload) => ApiClient.get('/user/getListMessage', payload)
export const getListMessageOption = (payload) => ApiClient.get('/user/getListMessageOption', payload)
export const createSampleMessage = (payload) => ApiClient.post('/user/createOrUpdateMessage', payload)
export const updateSampleMessage = (payload) => ApiClient.post('/user/createOrUpdateMessage', payload)
