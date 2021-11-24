import { ApiClient } from 'constants/Api'

export const createRoomType = (payload) => ApiClient.post('/service/createOrUpdateCate', payload)
export const updateRoomType = (payload) => ApiClient.post('/service/createOrUpdateCate', payload)
export const getListRoomType = (payload) => ApiClient.get('/service/listCate', payload)
export const deleteRoomType = (payload) => ApiClient.post('/service/deleteCate', payload)
