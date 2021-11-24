import { ApiClient } from 'constants/Api'
export const getListSalary = (payload) => ApiClient.get('/provider/getListSalary', payload)
export const deleteSalary = (payload) => ApiClient.post('/provider/deleteSalary', payload)
export const getSalaryDetail = (payload) => ApiClient.get('/provider/getsalaryDetail', payload)
export const getSalariesOfProvider = (payload) => ApiClient.get('/provider/getSalariesOfProvider', payload)
export const salaryOfProvider = (payload) => ApiClient.post('/provider/salaryOfProvider', payload)
export const updatePayment = (payload) => ApiClient.post('/provider/updatePayment', payload)
