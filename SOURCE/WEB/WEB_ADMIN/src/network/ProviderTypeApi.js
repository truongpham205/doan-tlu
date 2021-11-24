import { ApiClient } from 'constants/Api'
export const getListProviderType = (payload) => ApiClient.get('/provider/providerTypes', payload)
export const createProviderType = (payload) => ApiClient.post('/provider/createOrUpdateProviderCate', payload)
export const updateProviderType = (payload) => ApiClient.post('/provider/createOrUpdateProviderCate', payload)
export const deleteProviderType = (payload) => ApiClient.post('/provider/deleteProviderCate', payload)
