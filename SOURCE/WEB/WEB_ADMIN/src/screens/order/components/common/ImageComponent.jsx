import React from 'react'
import PropTypes from 'prop-types'
import { STRING } from 'constants/Constant'
import { Image } from 'antd'

ImageComponent.propTypes = {
  url: PropTypes.string,
}
ImageComponent.defaultProps = {
  url: '',
}

function ImageComponent(props) {
  const { url } = props
  return (
    <>
      {url ? (
        <Image
          src={url}
          style={{ maxWidth: '100%' }}
          placeholder={<Image preview={false} style={{ maxWidth: '100%' }} src={url} />}
        />
      ) : (
        STRING.notUpdate
      )}
    </>
  )
}

export default ImageComponent
