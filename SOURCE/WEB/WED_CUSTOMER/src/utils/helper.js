import { STRING } from '@constants/Constant'

export const toDateString = (date) => {
  let start = new Date(date)
  let startDateString = `${start.getDate()}/${
    start.getMonth() + 1 < 10 ? '0' + (start.getMonth() + 1) : start.getMonth() + 1
  }/${start.getFullYear()}`
  return startDateString
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

const test = (self, regrex, value, fieldName, titleName, response) => {
  if (value == '') {
    self.setState({
      validateError: {
        ...self.state.validateError,
        [fieldName]: 'Vui lòng điền đầy đủ thông tin!',
      },
    })
    return
  }
  let result = new RegExp(regrex).test(value)
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
  let regrex
  switch (fieldName) {
    case 'phoneNumber':
      regrex = /((09|03|07|08|05|02|06)+([0-9]{8})\b)/g
      break
    case 'receiverPhone':
      regrex = /((09|03|07|08|05|02|06)+([0-9]{8})\b)/g
      break
    case 'receiverPhoneAtStore':
      regrex = /((09|03|07|08|05|02|06)+([0-9]{8})\b)/g
      break
    case 'email':
      regrex = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/g
      break
    case 'userName':
      // regrex = /[0-9a-zA-Z_]{4,}\S/g
       regrex = /^[0-9a-zA-Z_]+(([',. -][0-9a-zA-Z_])?[0-9a-zA-Z_]*)*$/g
      // regrex = /^(?=.{1,30}$).*/g
      // regrex =  /[a-zA-Z]{10,}\d*/i
      break
    case 'fullname':
      regrex = /^(?=.{1,30}$).*/g
      break
    case 'title':
      regrex = /^(?=.{1,30}$).*/g
      break
    case 'fullnameReceiver':
      regrex = /^(?=.{1,30}$).*/g
      break
    case 'receiverNameAtStore':
      regrex = /^(?=.{1,30}$).*/g
      break
    case 'storeName':
      regrex = /^(?=.{1,30}$).*/g
      break
    case 'transportProviderName':
      regrex = /^(?=.{1,30}$).*/g
      break
    case 'bankName':
      regrex = /^(?=.{1,30}$).*/g
      break
    case 'bankOwnerName':
      regrex = /^(?=.{1,30}$).*/g
      break
    case 'userProxy':
      regrex = /^(?=.{1,30}$).*/g
      break
    case 'address':
      regrex = /^(?=.{1,100}$).*/g
      break
    case 'bankAccount':
      regrex = /^[0-9]{7,14}$/g
      break
    // case STRING.bankOwnerName:
    //     regrex = /[\w]{2,}( [\w]{2,})+/i
    //     break;
    case 'weight':
      regrex = /^(0|[1-9]\d*)(.\d+)?$/g
      break
    case 'startWeight':
      regrex = /^(0|[1-9]\d*)(.\d+)?$/g
      break
    case 'endWeight':
      regrex = /^(0|[1-9]\d*)(.\d+)?$/g
      break
    case 'stepWeight':
      regrex = /^(0|[1-9]\d*)(.\d+)?$/g
      break
    case 'blockNormal':
      regrex = /^(0|[1-9]\d*)(,\d+)?$/g
      break
    case 'blockFast':
      regrex = /^(0|[1-9]\d*)(,\d+)?$/g
      break
    case 'minFee':
      regrex = /^(0|[1-9]\d*)(,\d+)?$/g
      break
    case 'minFeeFast':
      regrex = /^(0|[1-9]\d*)(,\d+)?$/g
      break
    case 'volume':
      regrex = /^(0|[1-9]\d*)(,\d+)?$/g
      break
    case 'affordableTransport':
      regrex = /^(0|[1-9]\d*)(,\d+)?$/g
      break
    case 'affordableVolume':
      regrex = /^(0|[1-9]\d*)(,\d+)?$/g
      break
    case 'licensePlate':
      regrex = /[0-9A-Z_]{5,}/g
      break
    case 'dob':
      regrex = /^([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)\d{4}$/g
      break
    case 'identityCard':
      regrex = /^[0-9]{9}$|^[0-9]{12}$/g
      break
    case ('estimateTime', 'amount'):
      regrex = /^(?:[0-9]*)$/g
      break
    case 'collect':
      regrex = /^(?:[0-9]*)$/g
      break
    case ('packRatio', 'maxWeight', 'amount'):
      regrex = /^(?:[0-9.]*)$/g
      break
    case 'ratio':
      regrex = /^(?:[0-9.]*)$/g
      break
    case 'length':
      regrex = /^(?:[0-9.]*)$/g
      break
    case 'start_time':
      regrex = /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/g
      break
    case 'end_time':
      regrex = /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/g
      break
    case 'money':
      regrex = /^(?!0\.00)\d{1,3}(,\d{3})*(\.\d\d)?$/gm
      break
    case 'clientName':
      regrex = /[0-9a-zA-Z_]{4,}\S/g
      break
    case 'receiverName':
      regrex = /^(?=.{1,30}$).*/g
      break
    case 'receiverPhone':
      regrex = /((09|03|07|08|05|02|06)+([0-9]{8})\b)/g
      break
    default:
      break
  }
  fieldName += 'Error'
  test(self, regrex, value, fieldName, titleName)
}
