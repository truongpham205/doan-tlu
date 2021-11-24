export const createFormData = (dataObject) => {
  let formdata = new FormData()
  const keys = Object.keys(dataObject)
  if (keys.length === 0) {
    return null
  }
  keys.forEach((key) => {
    formdata.append(key, dataObject[key])
  })

  return formdata
}
