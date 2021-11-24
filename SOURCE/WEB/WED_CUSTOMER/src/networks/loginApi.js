import Url from '@constants/Url'
import { ApiClient } from '@constants/Api'

const loginApi = {
  login: (payload) => {
    return ApiClient.post(Url.login, payload)
  },
  logout: () => {
    return ApiClient.post(Url.logout)
  },
}

export default loginApi
