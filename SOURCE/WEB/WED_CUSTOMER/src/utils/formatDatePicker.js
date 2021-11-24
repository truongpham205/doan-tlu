export const formatDateTimeForInput = (dateParameter) => {
  const date = new Date(dateParameter)
  let day = date.getDate()
  let month = date.getMonth() + 1
  let year = date.getFullYear()
  let dateF = JSON.stringify(year + '/' + month + '/' + day)
  return dateF
}
