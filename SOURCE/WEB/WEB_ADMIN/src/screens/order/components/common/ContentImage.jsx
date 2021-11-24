import { STRING } from 'constants/Constant'
import PropTypes from 'prop-types'
import React from 'react'
import { Col } from 'reactstrap'
import ImageComponent from './ImageComponent'
ContentImage.propTypes = {
  transferImageUrl: PropTypes.string,
  smsImageUrl: PropTypes.string,
  hiddenImageSms: PropTypes.bool,
}
ContentImage.defaultProps = {
  transferImageUrl: '',
  smsImageUrl: '',
  hiddenImageSms: false,
}
function ContentImage(props) {
  const { transferImageUrl, smsImageUrl, hiddenImageSms } = props
  return (
    <Col xs="12" className="row  mb-3">
      <span className="col-6 col-md-3">{STRING.transferImage}</span>
      <span className="col-6 col-md-3">
        <ImageComponent url={transferImageUrl} />
      </span>
      {!hiddenImageSms && (
        <>
          <span className="col-6 col-md-3">{STRING.smsImage}</span>
          <span className="col-6 col-md-3">
            <ImageComponent url={smsImageUrl} />
          </span>
        </>
      )}
    </Col>
  )
}

export default ContentImage
