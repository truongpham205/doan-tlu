import React from 'react'
import PropTypes from 'prop-types'
import { STRING } from 'constants/Constant'
import { formatDateTime, toDateString } from 'utils/helper'
import { Button, Row, Col } from 'reactstrap'
import { Empty, Image } from 'antd'
Surcharges.propTypes = {
  paymentCustomerInfo: PropTypes.object,
  handleShowModal: PropTypes.func,
  createSurcharges: PropTypes.func,
  accompaniedService: PropTypes.string,
}

Surcharges.defaultProps = {
  paymentCustomerInfo: {},
  handleShowModal: null,
  createSurcharges: null,
  accompaniedService: '',
}

function Surcharges(props) {
  const { paymentCustomerInfo, accompaniedService, handleShowModal, createSurcharges } = props
  return (
    <Row className="mb-5">
      <Col sm="6" className=" d-flex align-items-center">
        <span className="col-sm-8 pl-0">
          <h6>Tiền phát sinh</h6>
        </span>
        <span className="col-sm-4 pl-0" style={{ color: 'orange' }}>
          {/* {accompaniedService || STRING.notUpdate} */}
        </span>
      </Col>
      <Col sm="6" className="text-right">
        <Button className="mt-2" color="primary" disabled={paymentCustomerInfo?.payOff} onClick={createSurcharges}>
          Tạo phát sinh
        </Button>
        <Button className="mt-2" color="primary" disabled={paymentCustomerInfo?.payOff} onClick={handleShowModal}>
          Cập nhật
        </Button>
      </Col>
      <Col xs="12" className="row">
        <span className="col-6 col-md-3">Tổng phí phát sinh</span>
        <span className="col-6 col-md-9">{accompaniedService || STRING.notUpdate}</span>
      </Col>
    </Row>
  )
}

export default Surcharges
