export const getImage = (listImage) => {
  for (var image of listImage) {
    if (image.type == 1) {
      return image.path
    }
  }
}
