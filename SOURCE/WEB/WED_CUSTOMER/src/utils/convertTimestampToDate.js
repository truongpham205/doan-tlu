import moment from 'moment'

const convertTimestampToDate = (value) => {
  const date = new Date(value).toString()
  const dateFormat = moment(date).format('hh:mm-DD/MM')
  return dateFormat
}

export default convertTimestampToDate
