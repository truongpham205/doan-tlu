import axios from 'axios'
import Cookie from 'js-cookie'
import queryString from 'query-string'
import Url from './Url'
import swal from 'sweetalert'
const Reactotron = process.env.NODE_ENV !== 'production' && require('reactotron-react-js').default
const END_POINT_REAL_TIME = 'http://167.71.216.137:3211'
// const END_POINT_REAL_TIME = process.env.REACT_APP_END_POINT_REAL_TIME
function createAxios() {
  var axiosInstant = axios.create()
  axiosInstant.defaults.baseURL = 'http://localhost:8700/'
  // axiosInstant.defaults.baseURL = process.env.REACT_APP_END_POINT
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
      // log via ReactOtron
      if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
        Reactotron.apisauce(response)
      } else {
        // production code
      }

      if (response.data.code === 403) {
        Cookie.remove('SESSION_ID')
        window.location.reload()
      } else if (response.data.status !== 1)
        setTimeout(() => {
          swal({
            title: response.data.msg,
            icon: 'error',
          })
        }, 300)
      return response
    },
    (error) => { }
  )
  return axiosInstant
}

export const getAxios = createAxios()

function handleUrl(url, query) {
  return queryString.stringifyUrl({ url: url, query })
}

export const ApiClient = {
  get: (url, payload) => handleResult(getAxios.get(handleUrl(url, payload))),
  post: (url, payload) => handleResult(getAxios.post(url, payload)),
  put: (url, payload) => handleResult(getAxios.put(url, payload)),
  path: (url, payload) => handleResult(getAxios.patch(url, payload)),
  delete: (url, payload) => handleResult(getAxios.delete(url, { data: payload })),
}

/* Support function */
function handleResult(api) {
  return api.then((res) => {
    if (res?.data?.status !== 1) {
      if (res?.data?.code === 403) {
        Cookie.remove('SESSION_ID')
      }
      return Promise.reject(res?.data)
    }
    return Promise.resolve(res?.data)
  })
}

export const requestLogin = (payload) => {
  return handleResult(getAxios.post(Url.login, payload))
}

export const requestLogout = (payload) => {
  return handleResult(getAxios.post(Url.logout, payload))
}

export const login = (payload) => {
  return handleResult(getAxios.put(Url.login, payload))
}

export const createAccount = (payload) => {
  return handleResult(getAxios.post(Url.createAccount, payload))
}

export const getUserInfo = () => {
  return handleResult(getAxios.get(`/users/info`))
}

export const updateAccount = (payload) => {
  return handleResult(getAxios.post(Url.updateAccount, payload))
}

export const deleteAccount = (payload) => {
  return handleResult(getAxios.post(Url.deleteAccount, payload))
}

export const getListRole = (payload) => {
  return handleResult(getAxios.get(handleUrl(Url.getListRole, payload)))
}

export const changePasswordAccount = (payload) => {
  return handleResult(getAxios.post(Url.changePasswordAccount, payload))
}

export const getListAccount = (payload) => {
  return handleResult(getAxios.get(handleUrl(Url.getListAccount, payload)))
}

export const getListSale = (payload) => {
  return handleResult(getAxios.get(handleUrl(Url.getListSale, payload)))
}

export const getListOverView = (payload) => {
  return handleResult(getAxios.get(handleUrl(Url.getListOverView, payload)))
}

export const getListNotification = (payload) => {
  return handleResult(getAxios.get(handleUrl('/user/getlistNoti', payload)))
}

export const readNotification = (payload) => {
  return handleResult(getAxios.post(Url.readNotification, payload))
}
export const blockCustomer = (payload) => {
  return handleResult(getAxios.post(Url.blockCustomer, payload))
}

export const reActiveCustomer = (payload) => {
  return handleResult(getAxios.post(Url.reActiveCustomer, payload))
}

export const callSocket = (payload) => {
  const query = handleUrl(END_POINT_REAL_TIME, payload)
  return handleResult(axios.get(query))
}

export const createBank = (payload) => {
  return handleResult(getAxios.post(Url.createBank, payload))
}

export const updateBank = (payload) => {
  return handleResult(getAxios.post(Url.updateBank, payload))
}

export const deleteBank = (payload) => {
  return handleResult(getAxios.post(Url.deleteBank, payload))
}

export const getListBank = (payload) => {
  return handleResult(getAxios.get(handleUrl(Url.getListBank, payload)))
}

export const requestGetExportCustomer = (payload) => {
  return axios.get(`${process.env.REACT_APP_END_POINT}order/export?order_id=${payload}`, {
    responseType: 'blob',
    headers: { 'Content-Type': null },
  })
}

export const createNotification = (payload) => {
  return handleResult(getAxios.post(Url.createNoti, payload))
}
