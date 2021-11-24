import Url from '@constants/Url'
import { ApiClient } from '@constants/Api'

const serviceApi = {
  listService: (payload) => {
    return ApiClient.get(Url.listService, payload)
  },
  serviceDetail: (payload) => {
    return ApiClient.get(Url.serviceDetail, payload)
  },
  review: (payload) => {
    return ApiClient.get(Url.review, payload)
  },
  listCate: (payload) => {
    return ApiClient.get(Url.listCate, payload)
  },
  likeService: (payload) => {
    return ApiClient.post(Url.likeService, payload)
  },
  listServiceLiked: (payload) => {
    return ApiClient.get(Url.listServiceLiked, payload)
  },
}

export default serviceApi
