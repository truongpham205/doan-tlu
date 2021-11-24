// import { STRING } from 'constants/Constant'

export const toDateString = (dateParameter) => {
  if (!dateParameter) return

  let dateTime = new Date(dateParameter)
  const year = `${dateTime.getFullYear()}`
  const month = `0${dateTime.getMonth() + 1}`.slice(-2)
  const date = `0${dateTime.getDate()}`.slice(-2)
  return `${date}/${month}/${year}`
}

export const getDateForSearch = (dateParameter) => {
  if (!dateParameter) return

  let dateTime = new Date(dateParameter)
  const year = `${dateTime.getFullYear()}`
  const month = `0${dateTime.getMonth() + 1}`.slice(-2)
  const date = `0${dateTime.getDate()}`.slice(-2)
  return `${year}-${month}-${date}`
}

export const formatTime = (date) => {
  if (!date) return
  const dateTime = new Date(date)
  const hours = `0${dateTime.getHours()}`.slice(-2)
  const minutes = `0${dateTime.getMinutes()}`.slice(-2)
  return `${hours}h${minutes}`
}

export const formatDateTime = (date) => {
  let dateString = toDateString(date)
  let timeString = formatTime(date)
  return timeString + ' - ' + dateString
}

export const formatDateForInput = (dateParameter) => {
  if (!dateParameter) return

  let dateTime = new Date(dateParameter)

  const year = `${dateTime.getFullYear()}`
  const month = `0${dateTime.getMonth() + 1}`.slice(-2)
  const date = `0${dateTime.getDate()}`.slice(-2)
  return `${year}-${month}-${date}`
}

export const sortName = (a, b) => {
  const nameA = a.NAME.toUpperCase()
  const nameB = b.NAME.toUpperCase()

  let comparison = 0
  if (nameA > nameB) {
    comparison = 1
  } else if (nameA < nameB) {
    comparison = -1
  }
  return comparison
}

const test = (self, regex, value, fieldName, titleName, response) => {
  if (value === '') {
    self.setState({
      validateError: {
        ...self.state.validateError,
        [fieldName]: 'Vui lòng điền đầy đủ thông tin!',
      },
    })
    return
  }
  // console.log(value, regex, 'regex')
  let result = new RegExp(regex).test(value)
  // console.log(result, 'result')
  if (!result) {
    self.setState({
      validateError: {
        ...self.state.validateError,
        [fieldName]: `${titleName} không hợp lệ!`,
      },
    })
  } else {
    self.setState({
      validateError: {
        ...self.state.validateError,
        [fieldName]: null,
      },
    })
  }
}

export const validateForm = (self, value, fieldName, titleName) => {
  // const { [fieldname]: field } = self.validateError;
  let regex
  switch (fieldName) {
    case 'receiverPhoneAtStore':
    case 'receiverPhone':
    case 'phoneNumber':
    case 'phone_number':
      regex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/
      break
    case 'email':
      regex = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/g
      break
    case 'userName':
      regex = /^[0-9a-zA-Z_]+(([',. -][0-9a-zA-Z_])?[0-9a-zA-Z_]*)*$/g
      break
    case 'fullname':
    case 'title':
    case 'fullnameReceiver':
    case 'receiverNameAtStore':
    case 'storeName':
    case 'transportProviderName':
    case 'bankName':
    case 'bankOwnerName':
    case 'userProxy':
      regex = /^(?=.{1,30}$).*/g
      break

    case 'address':
      regex = /^(?=.{1,100}$).*/g
      break
    case 'bankAccount':
      regex = /^[0-9]{7,14}$/g
      break
    // case STRING.bankOwnerName:
    //     regex = /[\w]{2,}( [\w]{2,})+/i
    //     break;
    case 'weight':
      regex = /^(0|[1-9]\d*)(.\d+)?$/g
      break
    case 'startWeight':
      regex = /^(0|[1-9]\d*)(.\d+)?$/g
      break
    case 'endWeight':
      regex = /^(0|[1-9]\d*)(.\d+)?$/g
      break
    case 'stepWeight':
      regex = /^(0|[1-9]\d*)(.\d+)?$/g
      break
    case 'blockNormal':
      regex = /^(0|[1-9]\d*)(,\d+)?$/g
      break
    case 'blockFast':
      regex = /^(0|[1-9]\d*)(,\d+)?$/g
      break
    case 'minFee':
      regex = /^(0|[1-9]\d*)(,\d+)?$/g
      break
    case 'minFeeFast':
      regex = /^(0|[1-9]\d*)(,\d+)?$/g
      break
    case 'volume':
      regex = /^(0|[1-9]\d*)(,\d+)?$/g
      break
    case 'affordableTransport':
      regex = /^(0|[1-9]\d*)(,\d+)?$/g
      break
    case 'affordableVolume':
      regex = /^(0|[1-9]\d*)(,\d+)?$/g
      break
    case 'licensePlate':
      regex = /[0-9A-Z_]{5,}/g
      break
    case 'dob':
      regex = /^([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)\d{4}$/g
      break
    case 'identify':
      regex = /^[0-9]{9}$|^[0-9]{12}$/g
      break
    case ('estimateTime', 'amount'):
      regex = /^(?:[0-9]*)$/g
      break
    case 'collect':
      regex = /^(?:[0-9]*)$/g
      break
    case ('packRatio', 'maxWeight', 'amount'):
      regex = /^(?:[0-9.]*)$/g
      break
    case 'ratio':
      regex = /^(?:[0-9.]*)$/g
      break
    case 'length':
      regex = /^(?:[0-9.]*)$/g
      break
    case 'start_time':
      regex = /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/g
      break
    case 'end_time':
      regex = /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/g
      break
    case 'money':
    case 'totalMoneyServiceAttach':
    case 'serviceChargeIncluded':
      regex = ''
      break
    case 'clientName':
      regex = /[0-9a-zA-Z_]{4,}\S/g
      break
    case 'receiverName':
      regex = /^(?=.{1,30}$).*/g
      break
    default:
      break
  }
  fieldName += 'Error'
  test(self, regex, value, fieldName, titleName)
}
