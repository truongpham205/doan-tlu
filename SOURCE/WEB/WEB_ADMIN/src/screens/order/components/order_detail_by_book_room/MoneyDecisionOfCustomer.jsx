import React from 'react'
import PropTypes from 'prop-types'
import { STRING } from 'constants/Constant'
import { formatDateTime, toDateString } from 'utils/helper'
import { Button, Row, Col } from 'reactstrap'
MoneyDecisionOfCustomer.propTypes = {
  paymentCustomerInfo: PropTypes.object,
  handleShowModal: PropTypes.func,
  handleAllowDeposit: PropTypes.func,
  handleKeepOrderForCustomer: PropTypes.func,
  handleAllowCheckIn: PropTypes.func,
  orderPrice: PropTypes.number,
  paymentStatus: PropTypes.number,
  sumDeposit: PropTypes.number,
  isRequestPayment: PropTypes.number,
}

MoneyDecisionOfCustomer.defaultProps = {
  paymentCustomerInfo: {},
  handleShowModal: null,
  handleAllowDeposit: null,
  handleKeepOrderForCustomer: null,
  handleAllowCheckIn: null,
  orderPrice: 0,
  paymentStatus: 0,
  sumDeposit: 0,
  isRequestPayment: 0,
}

function MoneyDecisionOfCustomer(props) {
  const {
    paymentCustomerInfo,
    handleShowModal,
    handleAllowDeposit,
    orderPrice,
    paymentStatus,
    sumDeposit,
    handleKeepOrderForCustomer,
    handleAllowCheckIn,
    isRequestPayment,
  } = props
  return (
    <Row>
      <h5 className="col-12 pl-0 mb-2">Tiền chốt khách</h5>
      <Col sm="6" className="d-flex align-items-center row">
        <span className="col-sm-6 pl-0 mb-3">
          <h6>Tiền chốt khách</h6>
        </span>
        <span className="col-sm-6 mb-3" style={{ color: 'orange' }}>
          {paymentCustomerInfo?.moneyDecisionCustomer?.moneyDecisionCustomer}
        </span>

        <span className="col-sm-6 pl-0 mb-3">
          <h6>Dùng điểm tích lũy</h6>
        </span>
        <span className="col-sm-6 mb-3" style={{ color: 'orange' }}>
          {paymentCustomerInfo?.moneyDecisionCustomer?.usePoint}
        </span>

        <span className="col-sm-6 pl-0 mb-3">
          <h6>Tổng tiền</h6>
        </span>
        <span className="col-sm-6 mb-3" style={{ color: 'orange' }}>
          {paymentCustomerInfo?.moneyDecisionCustomer?.totalMoney}
        </span>
      </Col>
      <Col sm="6" className="text-right pr-0">
        <Button className="mt-2 mr-0" color="primary" disabled={paymentCustomerInfo?.payOff} onClick={handleShowModal}>
          Cập nhật
        </Button>
        <br />
        {/* <br /> */}
        {!(!+orderPrice || paymentStatus !== 1) && isRequestPayment === 1 && (
          <Button
            className="mt-2 mr-0"
            color="primary"
            disabled={!+orderPrice || paymentStatus !== 1}
            onClick={handleAllowDeposit}
          >
            Cho phép đặt cọc
          </Button>
        )}

        {/* <br /> */}
        {!(sumDeposit < +orderPrice * 0.7 || paymentStatus === 1 || paymentStatus >= 6) && (
          <Button
            className="mt-2 mr-0"
            color="primary"
            disabled={sumDeposit < +orderPrice * 0.7 || paymentStatus === 1 || paymentStatus >= 6}
            onClick={handleKeepOrderForCustomer}
          >
            Giữ nhà cho khách
          </Button>
        )}
        {/* <br /> */}
        {sumDeposit >= +orderPrice && paymentStatus === 6 && (
          <Button
            className="mt-2 mr-0"
            color="primary"
            disabled={!(sumDeposit >= +orderPrice && paymentStatus === 6)}
            onClick={handleAllowCheckIn}
          >
            Có thể check-in
          </Button>
        )}
      </Col>
    </Row>
  )
}

export default MoneyDecisionOfCustomer
