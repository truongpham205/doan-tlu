export const checkValidationError = (field) => {
  let check = false
  for (let fieldName in field) {
    if (field[fieldName]) {
      if (Array.isArray(field[fieldName])) continue
      else check = true
    }
  }
  return check
}
export const checkValidationValue = (field) => {
  let check = false
  for (let fieldName in field) {
    if (!field[fieldName]) {
      if (Array.isArray(field[fieldName])) continue
      else check = true
    }
  }
  return check
}
