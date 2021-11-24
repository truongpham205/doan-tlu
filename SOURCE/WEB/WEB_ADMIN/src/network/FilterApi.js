import { ApiClient } from 'constants/Api'
export const getListProvince = (payload) => ApiClient.get('/filter/province', payload)
export const getListDistrict = (payload) => ApiClient.get('/filter/district', payload)
export const getListVillage = (payload) => ApiClient.get('/filter/village', payload)
export const getListLeadSale = (payload) => ApiClient.get('/filter/saleLeader', payload)
export const getListRegions = (payload) => ApiClient.get('/filter/regions', payload)
export const updateRegion = (payload) => ApiClient.post('/filter/updateRegions', payload)
