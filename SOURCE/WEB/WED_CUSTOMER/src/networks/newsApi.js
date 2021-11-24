import Url from '@constants/Url'
import { ApiClient } from '@constants/Api'

const newsApi = {
  home: (payload) => {
    return ApiClient.get(Url.home, payload)
  },
  newDetail: (payload) => {
    return ApiClient.get(Url.newDetail, payload)
  },
}

export default newsApi
