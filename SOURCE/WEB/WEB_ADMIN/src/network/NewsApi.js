import { ApiClient } from 'constants/Api'
export const getListNews = (payload) => ApiClient.get('/news/listnews', payload)
export const createNews = (payload) => ApiClient.post('/news/createOrUpdateNews', payload)
export const updateNews = (payload) => ApiClient.post('/news/createOrUpdateNews', payload)
export const getNewsDetail = (payload) => ApiClient.get('/news/newsDetail', payload)
export const deleteNews = (payload) => ApiClient.post('/news/deleteNew', payload)
export const getListNewsType = (payload) => ApiClient.get('/news/newsType', payload)
