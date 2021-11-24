export const getCode = () => {
  const date = Date.now().toString()
  const a = date.substring(9)
  const b = date.substring(7, 11)
  const min = Math.ceil(1000)
  const max = Math.floor(9999)
  const c = (Math.floor(Math.random() * (max - min)) + min).toString()
  return `UTRUCK_${a}_${b}_${c}`
}
