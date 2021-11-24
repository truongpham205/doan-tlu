import { STRING } from 'constants/Constant'
import PropTypes from 'prop-types'
import React from 'react'
import { Col } from 'reactstrap'
import formatMoney from 'utils/formatMoney'
ConvertMoney.propTypes = {
  money: PropTypes.number,
  title: PropTypes.string,
}
ConvertMoney.defaultProps = {
  money: null,
  title: 'Số tiền',
}
function ConvertMoney(props) {
  const { money, title } = props

  const convertToMoney = (money) => {
    if (typeof money === 'string') return STRING.notUpdate
    return formatMoney(money)
  }

  return (
    <Col xs="12" className="row mb-3">
      <span className="col-6 col-md-3">{title}</span>
      <span className="col-6 col-md-9">{convertToMoney(money)}</span>
    </Col>
  )
}

export default ConvertMoney
