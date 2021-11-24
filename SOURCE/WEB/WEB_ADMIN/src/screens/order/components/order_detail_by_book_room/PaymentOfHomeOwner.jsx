import React from 'react'
import PropTypes from 'prop-types'
import { STRING } from 'constants/Constant'
import Card from 'components/Card'
import { Image } from 'antd'
import { Input, Button, Col, Row, Modal, ModalHeader, ModalBody, ModalFooter, Table } from 'reactstrap'
import formatMoney from 'utils/formatMoney'
import { toDateString } from 'utils/helper'
import ImageComponent from '../common/ImageComponent'
import ContentImage from '../common/ContentImage'
import BankingInfo from '../common/BankingInfo'
import SmsText from '../common/SmsText'
import ConvertMoney from '../common/ConvertMoney'
PaymentOfHomeOwner.propTypes = {
  paymentOwnerInfo: PropTypes.object,
  paymentCustomerInfo: PropTypes.object,
  onUpdateDecisionOfHomeOwner: PropTypes.func,
  onUpdateDepositOfHomeOwner: PropTypes.func,
  onUpdateMoneyLeftToPayOfHomeOwner: PropTypes.func,
  moneyNotPayForProvider: PropTypes.string || PropTypes.number,
  hiddenButton: PropTypes.bool,
}

PaymentOfHomeOwner.defaultProps = {
  paymentOwnerInfo: {},
  paymentCustomerInfo: {},
  onUpdateDecisionOfHomeOwner: null,
  onUpdateDepositOfHomeOwner: null,
  onUpdateMoneyLeftToPayOfHomeOwner: null,
  moneyNotPayForProvider: '',
  hiddenButton: false,
}

function PaymentOfHomeOwner(props) {
  const {
    paymentOwnerInfo,
    paymentCustomerInfo,
    onUpdateDecisionOfHomeOwner,
    onUpdateDepositOfHomeOwner,
    onUpdateMoneyLeftToPayOfHomeOwner,
    moneyNotPayForProvider,
    hiddenButton,
  } = props

  const renderTitle = (title) => {
    return (
      <Col sm="6" className="d-flex align-items-center">
        <h5>{title}</h5>
      </Col>
    )
  }

  return (
    <Col lg="5" className="px-2">
      <Col className="box--shadow p-3">
        <Col className="pl-0">
          <h5>Thanh toán của nhà cung cấp</h5>
        </Col>
        <Row>
          {renderTitle('Chốt chủ nhà')}

          {!hiddenButton && (
            <Col sm="6" className="text-right">
              <Button
                className="mt-2"
                color="primary"
                // disabled={paymentCustomerInfo?.payOff}
                onClick={onUpdateDecisionOfHomeOwner}
              >
                Cập nhật
              </Button>
            </Col>
          )}

          <Col xs="12" className="row">
            <span className="col-6 col-md-3 mb-3">SMS chốt</span>
            <span className="col-6 col-md-9 mb-3">
              {paymentOwnerInfo?.decisionOfHomeOwner?.sms || STRING.notUpdate}
            </span>

            <span className="col-6 col-md-3 mb-3">Ảnh SMS chốt</span>
            <span className="col-6 col-md-9 mb-3">
              <ImageComponent url={paymentOwnerInfo?.decisionOfHomeOwner?.sms_image} />
            </span>
          </Col>

          <ConvertMoney money={paymentOwnerInfo?.decisionOfHomeOwner?.amount} title={'Giá nhập'} />
          {/* <ConvertMoney money={paymentOwnerInfo?.decisionOfHomeOwner?.price} title={'Giá bán'} /> */}
        </Row>

        <hr />

        <Row>
          {renderTitle('Cọc chủ nhà')}

          {!hiddenButton && (
            <Col sm="6" className="text-right">
              <Button
                className="mt-2"
                color="primary"
                // disabled={paymentCustomerInfo?.payOff}
                onClick={onUpdateDepositOfHomeOwner}
              >
                Cập nhật
              </Button>
            </Col>
          )}
          <ConvertMoney money={paymentOwnerInfo?.depositOfHomeOwner?.amount} />

          <BankingInfo
            dateTime={paymentOwnerInfo?.depositOfHomeOwner?.created_at}
            bankName={paymentOwnerInfo?.depositOfHomeOwner?.bank}
          />

          <ContentImage
            transferImageUrl={paymentOwnerInfo?.depositOfHomeOwner?.transfer_image}
            smsImageUrl={paymentOwnerInfo?.depositOfHomeOwner?.sms_image}
            hiddenImageSms={true}
          />

          <SmsText content={paymentOwnerInfo?.depositOfHomeOwner?.sms} />
        </Row>
        <hr />
        <Row>
          {renderTitle('Tiền còn thanh toán')}
          {!hiddenButton && (
            <Col sm="6" className="text-right">
              <Button
                className="mt-2"
                color="primary"
                // disabled={paymentCustomerInfo?.payOff}
                onClick={onUpdateMoneyLeftToPayOfHomeOwner}
              >
                Cập nhật
              </Button>
            </Col>
          )}

          <ConvertMoney money={moneyNotPayForProvider} />

          <BankingInfo
            dateTime={paymentOwnerInfo?.moneyLeftToPayOfHomeOwner?.created_at}
            bankName={paymentOwnerInfo?.moneyLeftToPayOfHomeOwner?.bank}
          />

          <ContentImage
            transferImageUrl={paymentOwnerInfo?.moneyLeftToPayOfHomeOwner?.transfer_image}
            smsImageUrl={paymentOwnerInfo?.moneyLeftToPayOfHomeOwner?.sms_image}
            hiddenImageSms={true}
          />

          <SmsText content={paymentOwnerInfo?.moneyLeftToPayOfHomeOwner?.sms} />
        </Row>
      </Col>
    </Col>
  )
}

export default PaymentOfHomeOwner
