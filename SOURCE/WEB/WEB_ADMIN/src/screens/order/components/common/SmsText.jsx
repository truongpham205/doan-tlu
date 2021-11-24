import { STRING } from 'constants/Constant'
import PropTypes from 'prop-types'
import React from 'react'
import { Col } from 'reactstrap'
import { toDateString } from 'utils/helper'
SmsText.propTypes = {
  title: PropTypes.string,
  content: PropTypes.string,
}
SmsText.defaultProps = {
  content: '',
  title: 'SMS tiền đi',
}
function SmsText(props) {
  const { content, title } = props

  return (
    <Col xs="12" className="row">
      <span className="col-6 col-md-3">{title}</span>
      <span className="col-6 col-md-9">{content || STRING.notUpdate}</span>
    </Col>
  )
}

export default SmsText
