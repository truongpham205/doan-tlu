import React from 'react'
import PropTypes from 'prop-types'
import { STRING } from 'constants/Constant'
import { formatDateTime, toDateString } from 'utils/helper'
import { Button, Row, Col } from 'reactstrap'
import { Empty, Image } from 'antd'
import BankingInfo from '../common/BankingInfo'
import ContentImage from '../common/ContentImage'
import SmsText from '../common/SmsText'
import ConvertMoney from '../common/ConvertMoney'
import formatMoney from 'utils/formatMoney'
DepositOfCustomer.propTypes = {
  paymentCustomerInfo: PropTypes.object,
  handleShowModal: PropTypes.func,
  handleResetPaymentAt: PropTypes.func,
  unBlock: PropTypes.bool,
}

DepositOfCustomer.defaultProps = {
  paymentCustomerInfo: {},
  handleShowModal: null,
  handleResetPaymentAt: null,
  unBlock: false,
}

function DepositOfCustomer(props) {
  const { paymentCustomerInfo, handleShowModal, handleResetPaymentAt, unBlock } = props
  return (
    <Row className="mb-5">
      <Col sm="6" className=" d-flex align-items-center mb-3">
        <span className="col-sm-6 pl-0">
          <h6>Tiền khách cọc</h6>
        </span>

        <span className="col-sm-6" style={{ color: 'orange' }}>
          {formatMoney(paymentCustomerInfo?.depositOfCustomer?.amount || 0)}
          {/* <br />({paymentCustomerInfo?.depositOfCustomer?.descriptionPaymentStatus}) */}
        </span>
      </Col>

      <Col sm="6" className="text-right mb-3">
        <Button
          className="mt-2"
          color="primary"
          disabled={!unBlock || paymentCustomerInfo?.payOff}
          onClick={() => {
            if (unBlock) {
              handleResetPaymentAt()
            }
          }}
        >
          {'Mở cọc lại'}
        </Button>

        <Button className="mt-2" color="primary" disabled={paymentCustomerInfo?.payOff} onClick={handleShowModal}>
          Cập nhật
        </Button>
      </Col>

      {/* <ConvertMoney money={paymentCustomerInfo?.depositOfCustomer?.amount} /> */}

      {/* <BankingInfo
        dateTime={paymentCustomerInfo?.depositOfCustomer?.created_at}
        bankName={paymentCustomerInfo?.depositOfCustomer?.bank}
      />

      <ContentImage
        transferImageUrl={paymentCustomerInfo?.depositOfCustomer?.transfer_image}
        smsImageUrl={paymentCustomerInfo?.depositOfCustomer?.sms_image}
      />

      <SmsText title="SMS tiền về" content={paymentCustomerInfo?.depositOfCustomer?.sms} /> */}
    </Row>
  )
}

export default DepositOfCustomer
