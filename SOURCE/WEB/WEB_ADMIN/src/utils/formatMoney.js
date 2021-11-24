const formatMoney = (money, is_zero = false) => {
  if (!money && typeof money !== 'number' && !is_zero) return

  return (
    parseInt(money).toLocaleString('vi', {
      currency: 'VND',
    }) + '(VNĐ)'
  )
}

export default formatMoney
