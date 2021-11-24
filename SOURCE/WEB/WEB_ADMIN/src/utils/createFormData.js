import reactotron from 'reactotron-react-js'
export const createFormData = (dataObject) => {
  let formdata = new FormData()
  const keys = Object.keys(dataObject)
  if (keys.length === 0) {
    return null
  }
  keys.forEach((key) => {
    if (Array.isArray(dataObject[key])) {
      if (!dataObject[key].length) {
        formdata.append(key, [])
      }
      for (let index = 0; index < dataObject[key].length; index++) {
        formdata.append(key, dataObject[key][index])
      }
    } else {
      formdata.append(key, dataObject[key])
    }
  })
  return formdata
}
