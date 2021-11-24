import { ApiClient } from 'constants/Api'
export const listProduct = (payload) => ApiClient.get('/product/list-web', payload)
export const productDetail = (payload) => ApiClient.get('/product', payload)

export const listStore = (payload) => ApiClient.get('/store/list', payload)
export const listParentCategory = (payload) => ApiClient.get('/product/parent-category-web', payload)

export const getListProductCategory = (payload) => ApiClient.get('/product/category', payload)
export const getListParentProductCategory = (payload) => ApiClient.get('/product/parent-category', payload)

export const listCategory = (payload) => ApiClient.get('/product/category', payload)

export const uploadImg = (payload) => ApiClient.post('/product/images', payload)

export const addProduct = (payload) => ApiClient.post('/product', payload)
export const updateProduct = (payload) => ApiClient.put('/product', payload)
export const addProductCategory = (payload) => ApiClient.post('/product/category', payload)

export const updateProductCategory = (payload) => ApiClient.put('/product/category', payload)

export const deleteProduct = (payload) => ApiClient.delete('/product', payload)
export const deleteProductCategory = (payload) => ApiClient.delete('/product/category', payload)

//product brand
export const listProductBrand = (payload) => ApiClient.get('/product-brand', payload)
export const addProductBrand = (payload) => ApiClient.post('/product-brand', payload)
export const deleteProductBrand = (payload) => ApiClient.delete('/product-brand', payload)
export const updateProductBrand = (payload) => ApiClient.put('/product-brand', payload)

// store
export const addStore = (payload) => ApiClient.post('/store', payload)
export const deleteStore = (payload) => ApiClient.delete('./store', payload)
export const updateStore = (payload) => ApiClient.put('./store', payload)
