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
PaymentOfProvider.propTypes = {
  index: PropTypes.number,
  decisionOfHomeOwner: PropTypes.object,
  depositOfHomeOwner: PropTypes.object,
  moneyLeftToPayOfHomeOwner: PropTypes.object,
  provider: PropTypes.object,
  paymentCustomerInfo: PropTypes.bool,
  // onUpdateDecisionOfHomeOwner: PropTypes.func,
  // onUpdateDepositOfHomeOwner: PropTypes.func,
  // onUpdateMoneyLeftToPayOfHomeOwner: PropTypes.func,
  onShowModalUpdateOfHomeOwner: PropTypes.func,
  onDeleteProvider: PropTypes.func,
  moneyNotPayForProvider: PropTypes.number || PropTypes.string,
}

PaymentOfProvider.defaultProps = {
  decisionOfHomeOwner: {},
  depositOfHomeOwner: {},
  moneyLeftToPayOfHomeOwner: {},
  provider: {},
  paymentCustomerInfo: false,
  onShowModalUpdateOfHomeOwner: null,
  index: null,
  onDeleteProvider: null,
  moneyNotPayForProvider: '',
}

function PaymentOfProvider(props) {
  const {
    decisionOfHomeOwner,
    depositOfHomeOwner,
    moneyLeftToPayOfHomeOwner,
    // paymentCustomerInfo,
    provider,
    onShowModalUpdateOfHomeOwner,
    index,
    onDeleteProvider,
    onUpdateIsPayment,
    orderIsFinished,
    moneyNotPayForProvider,
  } = props

  const renderTitle = (title) => {
    return (
      <Col sm="6" className="d-flex align-items-center">
        <h5>{title}</h5>
      </Col>
    )
  }

  return (
    <Card
      title={`${STRING.supplierType} ${provider?.provider_type_name}: ${provider?.provider_name}`}
      onDelete={() => onDeleteProvider(index)}
      onUpdate={onUpdateIsPayment}
      provider={provider}
    >
      <Col className="box--shadow p-3">
        <Col className="pl-0">
          <h5>Thanh toán của nhà cung cấp</h5>
        </Col>
        <Row>
          {renderTitle('Chốt chủ nhà')}

          <Col sm="6" className="text-right">
            <Button
              className="mt-2"
              color="primary"
              disabled={orderIsFinished}
              onClick={() => onShowModalUpdateOfHomeOwner('showModalUpdateDecisionOfHomeOwner', index)}
            >
              Cập nhật
            </Button>
          </Col>

          <Col xs="12" className="row">
            <span className="col-6 col-md-3 mb-3">SMS chốt</span>
            <span className="col-6 col-md-9 mb-3">{decisionOfHomeOwner?.sms || STRING.notUpdate}</span>

            <span className="col-6 col-md-3 mb-3">Ảnh SMS chốt</span>
            <span className="col-6 col-md-9 mb-3">
              <ImageComponent url={decisionOfHomeOwner?.sms_image} />
            </span>
          </Col>

          <ConvertMoney money={decisionOfHomeOwner?.amount} title={'Giá nhập'} />
          <ConvertMoney money={decisionOfHomeOwner?.price} title={'Giá bán'} />
        </Row>

        <hr />

        <Row>
          {renderTitle('Cọc chủ nhà')}

          <Col sm="6" className="text-right">
            <Button
              className="mt-2"
              color="primary"
              disabled={orderIsFinished}
              onClick={() => onShowModalUpdateOfHomeOwner('showModalUpdateDepositOfHomeOwner', index)}
            >
              Cập nhật
            </Button>
          </Col>

          <ConvertMoney money={depositOfHomeOwner?.amount} />

          <BankingInfo dateTime={depositOfHomeOwner?.created_at} bankName={depositOfHomeOwner?.bank} />

          <ContentImage
            transferImageUrl={depositOfHomeOwner?.transfer_image}
            smsImageUrl={depositOfHomeOwner?.sms_image}
          />

          <SmsText content={depositOfHomeOwner?.sms} />
        </Row>
        <hr />
        <Row>
          {renderTitle('Tiền còn thanh toán')}

          <Col sm="6" className="text-right">
            <Button
              className="mt-2"
              color="primary"
              disabled={orderIsFinished}
              onClick={() => onShowModalUpdateOfHomeOwner('showModalUpdateMoneyLeftToPayOfHomeOwner', index)}
            >
              Cập nhật
            </Button>
          </Col>

          <ConvertMoney money={moneyNotPayForProvider} />

          <BankingInfo dateTime={moneyLeftToPayOfHomeOwner?.created_at} bankName={moneyLeftToPayOfHomeOwner?.bank} />

          <ContentImage
            transferImageUrl={moneyLeftToPayOfHomeOwner?.transfer_image}
            smsImageUrl={moneyLeftToPayOfHomeOwner?.sms_image}
          />

          <SmsText content={moneyLeftToPayOfHomeOwner?.sms} />
        </Row>
      </Col>
    </Card>
  )
}

export default PaymentOfProvider
