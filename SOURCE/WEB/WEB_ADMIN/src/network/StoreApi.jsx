import { ApiClient } from 'constants/Api'
export const listStore = (payload) => ApiClient.get('/store/list-web', payload)

export const addStoreRole = (payload) => ApiClient.put('/customer/store', payload)
export const deleteStoreRole = (payload) => ApiClient.delete('/customer/store', payload)
// export const detail = (payload) => ApiClient.get('/product', payload)
export const storeList = (payload) => ApiClient.get('/store/list', payload)

export const districtList = (payload) => ApiClient.get('/u-connect/districts', payload)
export const wardList = (payload) => ApiClient.get('/u-connect/wards', payload)

export const addStore = (payload) => ApiClient.post('/store', payload)
export const updateStore = (payload) => ApiClient.put('/store', payload)

// export const listParentCategory = (payload) => ApiClient.get('/product/parent-category', payload)
