import react from 'react'
import Resizer from 'react-image-file-resizer'
const handleMultiImg = async (images) => {
  let result = {}
  await Promise.all(
    images?.map(async (image, index) => {
      //check arr has element is null
      if (image !== null && image.hasOwnProperty('originFileObj')) {
        result[index] = await resizeFile(image.originFileObj)
      }
    })
  )
  return result
}

const resizeFile = async (file) => {
  if (file?.size >= 1272864) {
    return new Promise((resolve) => {
      Resizer.imageFileResizer(
        file,
        1000,
        1000,
        file.type.split('/')[1].toUpperCase(),
        90,
        0,
        (uri) => {
          resolve(uri)
        },
        'blob',
        300,
        300
      )
    })
  }

  return new Promise((resolve) => {
    Resizer.imageFileResizer(
      file,
      1000,
      1000,
      file.type.split('/')[1].toUpperCase(),
      100,
      0,
      (uri) => {
        resolve(uri)
      },
      'blob',
      300,
      300
    )
  })
}
export { handleMultiImg, resizeFile }
