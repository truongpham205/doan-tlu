import { STRING } from 'constants/Constant'
import PropTypes from 'prop-types'
import React from 'react'
import { Col } from 'reactstrap'
import { toDateString } from 'utils/helper'
BankingInfo.propTypes = {
  dateTime: PropTypes.string,
  bankName: PropTypes.string,
}
BankingInfo.defaultProps = {
  dateTime: '',
  bankName: '',
}
function BankingInfo(props) {
  const { dateTime, bankName } = props

  const convertToDateTime = (dateTime) => {
    if (dateTime) return toDateString(dateTime)
    return STRING.notUpdate
  }

  return (
    <Col xs="12" className="row mb-3">
      <span className="col-6 col-md-3">{STRING.transferDate}</span>
      <span className="col-6 col-md-3">{convertToDateTime(dateTime)}</span>
      {/* <span className="col-6 col-md-3">{STRING.bank}</span>
      <span className="col-6 col-md-3">{bankName || STRING.notUpdate}</span> */}
    </Col>
  )
}

export default BankingInfo
