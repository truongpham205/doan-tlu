const formatPrice = (price) => {
  if (!price) return ''
  return price.toString().split('.').join('')
}
export default formatPrice
