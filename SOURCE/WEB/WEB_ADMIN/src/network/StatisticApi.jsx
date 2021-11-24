import { ApiClient } from 'constants/Api'

export const getListSaleStatistic = (payload) => ApiClient.get('/sale/saleStatistic', payload)
export const getListProviderStatistic = (payload) => ApiClient.get('/provider/providerStatistic', payload)
export const getProviderDetailStatistic = (payload) => ApiClient.get('/provider/providerDetailStatistic', payload)
