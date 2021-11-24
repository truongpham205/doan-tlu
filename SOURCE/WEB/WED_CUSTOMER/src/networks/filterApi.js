import Url from '@constants/Url'
import { ApiClient } from '@constants/Api'

const filterApi = {
  regions: (payload) => {
    return ApiClient.get(Url.regions, payload)
  },
}

export default filterApi
