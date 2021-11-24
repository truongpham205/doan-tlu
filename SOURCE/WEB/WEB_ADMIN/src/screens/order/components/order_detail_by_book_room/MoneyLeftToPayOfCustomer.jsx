import React from 'react'
import PropTypes from 'prop-types'
import { STRING } from 'constants/Constant'
import { formatDateTime, toDateString } from 'utils/helper'
import { Button, Row, Col } from 'reactstrap'
import { Empty, Image } from 'antd'
import formatMoney from 'utils/formatMoney'
import formatPrice from 'utils/formatPrice'
MoneyLeftToPayOfCustomer.propTypes = {
  paymentCustomerInfo: PropTypes.object,
  handleShowModal: PropTypes.func,
  createPayment: PropTypes.func,
  moneyNotPayOfCustomer: PropTypes.string,
}

MoneyLeftToPayOfCustomer.defaultProps = {
  paymentCustomerInfo: {},
  handleShowModal: null,
  createPayment: null,
  moneyNotPayOfCustomer: '',
}

function MoneyLeftToPayOfCustomer(props) {
  const { paymentCustomerInfo, handleShowModal, createPayment, moneyNotPayOfCustomer } = props
  return (
    <Row className="mb-5">
      <Col sm="6" className=" d-flex align-items-center">
        <span className="col-sm-8 pl-0">
          <h6>Tiền KH còn phải thanh toán</h6>
        </span>
        <span className="col-sm-4 pl-0" style={{ color: 'orange' }}>
          {/* {paymentCustomerInfo?.moneyLeftToPayOfCustomer?.status} */}
        </span>
      </Col>
      <Col sm="6" className="text-right">
        <Button className="mt-2" color="primary" disabled={paymentCustomerInfo?.payOff} onClick={createPayment}>
          Tạo thanh toán
        </Button>
        <Button className="mt-2" color="primary" disabled={paymentCustomerInfo?.payOff} onClick={handleShowModal}>
          Cập nhật
        </Button>
      </Col>

      <Col xs="12" className="row">
        <span className="col-6 col-md-3">Tổng tiền còn lại</span>
        <span className="col-6 col-md-9">{formatMoney(formatPrice(moneyNotPayOfCustomer)) || STRING.notUpdate}</span>
      </Col>
    </Row>
  )
}

export default MoneyLeftToPayOfCustomer
