import React from 'react'

const ImageUpload = ({
  src,
  sizeClass = 'image-size-lg',
  alt,
  id,
  description,
  acceptType = '.jpg,.jpeg,.png',
  onChange,
  className = 'text-left',
}) => {
  return (
    <div className="mt-3" style={{ textAlign: 'center' }}>
      <label htmlFor={id} className="image-upload-label" style={{ cursor: 'pointer' }}>
        {src ? <img src={src} alt="" className="input-image-upload" /> : <p className="image-upload-icon">+</p>}
      </label>
      <input type="file" id={id} accept={acceptType} style={{ display: 'none' }} onChange={onChange} />
      <br />
    </div>
  )
}

export default ImageUpload
