import { ApiClient } from 'constants/Api'
export const getListProvider = (payload) => ApiClient.get('/provider/providers', payload)
export const getListManager = (payload) => ApiClient.get('/provider/getListManagers', payload)
export const createProvider = (payload) => ApiClient.post('/provider/create', payload)
export const updateProvider = (payload) => ApiClient.post('/provider/update', payload)
export const getProviderDetail = (payload) => ApiClient.get('/provider/detail', payload)
export const deleteProvider = (payload) => ApiClient.post('/provider/deleteProvider', payload)
export const deleteManager = (payload) => ApiClient.post('/provider/deleteManager', payload)

export const getListAccountProvider = (payload) => ApiClient.get('/user/userDetail', payload)
