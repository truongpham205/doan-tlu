import Url from '@constants/Url'
import { ApiClient } from '@constants/Api'

const userApi = {
  userInfo: () => {
    return ApiClient.get(Url.getUserInfo)
  },
  createUser: (payload) => {
    return ApiClient.post(Url.createUser, payload)
  },
  updateUser: (payload) => {
    return ApiClient.post(Url.customerUpdate, payload)
  },
  uploadAvatar: (payload) => {
    return ApiClient.post(Url.uploadAvatar, payload)
  },
  userReferred: (payload) => {
    return ApiClient.post(Url.userReferred, payload)
  },
  getListNotif: () => {
    return ApiClient.get(Url.getListNotif)
  },
  updateIsRead: (payload) => {
    return ApiClient.post(Url.updateIsRead, payload)
  },
  createNoti: (payload) => {
    return ApiClient.post(Url.createNoti, payload)
  },
}

export default userApi
