const formatNumber = (n) => {
  if (!n) return
  return n.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

export default formatNumber
