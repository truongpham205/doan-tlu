import axios from 'axios'
import queryString from 'query-string'
import Cookie from 'js-cookie'

import { ROUTER } from '@constants/Constant'

// const URL = 'http://3.1.13.10:18921/'
// const URL = 'http://35.198.255.245:8765/'
// const URL = 'http://3.1.13.10:8765/'
const URL = 'http://localhost:8700/';
// const URL = process.env.REACT_APP_API_ENDPOINT;

console.log(URL)


const createAxios = () => {
  var axiosInstant = axios.create()
  axiosInstant.defaults.baseURL = URL
  axiosInstant.defaults.timeout = 20000
  axiosInstant.defaults.headers = { 'Content-Type': 'application/json' }
  axiosInstant.defaults.headers = { 'access-control-allow-origin': '*' }

  axiosInstant.interceptors.request.use(
    async (config) => {
      config.headers.token = Cookie.get('SESSION_ID')
      return config
    },
    (error) => Promise.reject(error)
  )

  axiosInstant.interceptors.response.use(
    (response) => {
      if (response && response.data) {
        return response.data
      }
      if (response.data.code === 403) {
        Cookie.remove('SESSION_ID')
        window.location.reload()
      }
      return response
    },
    (error) => {
      throw error
    }
  )
  return axiosInstant
}

const handleResult = (api) => {
  return api
    .then((res) => {
      if (res.status !== 1) {
        if (res.code === 403) {
          if (Cookie.get('SESSION_ID')) {
            alert('Tài khoản đã bị đăng nhập tại nơi khác, làm mới trang để đăng nhập lại')
            window.location.pathname = "/trang-chu"
            // window.location.reload();
            // this.props.history.push("/trang-chu")
          }
          Cookie.remove('SESSION_ID')
          this.props.history.push(ROUTER.LOGIN)
        }
        return Promise.reject(res)
      }
      return Promise.resolve(res)
    })
    .catch((err) => {
      if (err.msg) return Promise.reject({ ...err })
      return Promise.reject({ ...err, msg: err })
    })
}

const getAxios = createAxios()

const handleUrl = (url, query) => {
  return queryString.stringifyUrl({ url: url, query }, { arrayFormat: 'comma' })
}

export const ApiClient = {
  get: (url, payload) => handleResult(getAxios.get(handleUrl(url, payload))),
  post: (url, payload) => handleResult(getAxios.post(url, payload)),
  put: (url, payload) => handleResult(getAxios.put(url, payload)),
  path: (url, payload) => handleResult(getAxios.patch(url, payload)),
  delete: (url, payload) => handleResult(getAxios.delete(url, { data: payload })),
}

