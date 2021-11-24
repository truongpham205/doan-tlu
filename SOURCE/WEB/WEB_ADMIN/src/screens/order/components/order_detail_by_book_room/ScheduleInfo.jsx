import React from 'react'
import PropTypes from 'prop-types'
import { STRING, ROLE } from 'constants/Constant'
import { formatDateTime, toDateString } from 'utils/helper'
import { Input, Button } from 'reactstrap'
ScheduleInfo.propTypes = {
  schedulingInfo: PropTypes.object,
  paymentCustomerInfo: PropTypes.object,
  handleShowModal: PropTypes.func,
  hiddenBtn: PropTypes.bool,
  isProvider: PropTypes.bool,
  payment_provider_at: PropTypes.string,
}

ScheduleInfo.defaultProps = {
  schedulingInfo: {},
  paymentCustomerInfo: {},
  handleShowModal: null,
  hiddenBtn: false,
  isProvider: false,
  payment_provider_at: '',
}

function ScheduleInfo(props) {
  const { schedulingInfo, handleShowModal, paymentCustomerInfo, hiddenBtn, payment_provider_at, isProvider } = props
  return (
    <div className="col-12 col-md-6 px-3">
      <div className="col-12  row px-2 py-0">
        <div className="col-12 pr-0 row d-flex justify-content-between">
          <h6 className="col-md-6" style={{ verticalAlign: 'middle' }}>
            Thông tin đặt lịch
          </h6>
          {!hiddenBtn && (
            <Button
              className="mt-0 mr-0"
              color="primary"
              disabled={paymentCustomerInfo?.payOff}
              onClick={handleShowModal}
            >
              Cập nhật
            </Button>
          )}
        </div>

        <div className="col-5">
          <p>{STRING.serviceType}</p>
        </div>
        <div className="col-7">
          <p>
            <strong>{schedulingInfo?.serviceType}</strong>
          </p>
        </div>

        <div className="col-5">
          <p>{STRING.roomType}</p>
        </div>
        <div className="col-7">
          <p>
            <strong>{schedulingInfo?.roomTypeName}</strong>
          </p>
        </div>

        <div className="col-5">
          <p>{STRING.area}</p>
        </div>

        <div className="col-7">
          <p>
            <strong>{schedulingInfo?.regionName}</strong>
          </p>
        </div>

        <div className="col-5">
          <p>Tên dịch vụ</p>
        </div>

        <div className="col-7">
          <p>
            <strong>{`${schedulingInfo?.roomName}`}</strong>
          </p>
        </div>

        <div className="col-5">
          <p>{'Mã đơn hàng'}</p>
        </div>

        <div className="col-7">
          <p>
            <strong>{schedulingInfo?.orderCode || '--'}</strong>
          </p>
        </div>
        <div className="col-5">
          <p>{'Trạng thái đơn hàng'}</p>
        </div>

        <div className="col-7">
          <p>
            <strong>{schedulingInfo?.orderStatus || '--'}</strong>
          </p>
        </div>

        <div className="col-5">
          <p>{'Trạng thái thanh toán'}</p>
        </div>

        <div className="col-7">
          <p>
            <strong>{schedulingInfo?.paymentStatus || '--'}</strong>
          </p>
        </div>

        <div className="col-5">
          <p>{'Ngày quyết toán'}</p>
        </div>

        <div className="col-7">
          <p>
            <strong>{payment_provider_at ? toDateString(payment_provider_at) : 'Chưa quyết toán'}</strong>
          </p>
        </div>

        {!schedulingInfo?.isTour && JSON.parse(localStorage.getItem('userInfo'))?.role_id !== ROLE.PROVIDER && (
          <>
            <div className="col-5">
              <p>{STRING.supplier}</p>
            </div>

            <div className="col-7">
              <p>
                <strong>{`${schedulingInfo?.providerName} (${schedulingInfo?.providerPhone})`}</strong>
              </p>
            </div>
          </>
        )}

        {!isProvider && (
          <>
            <div className="col-5">
              <p>{STRING.inCharge}</p>
            </div>

            <div className="col-7">
              <p>
                <strong>{`Lead sale: ${schedulingInfo?.leadSale} (${schedulingInfo?.leadSalePhone})`}</strong>
              </p>
              <p>
                <strong>{`Sale: ${schedulingInfo?.sale} (${schedulingInfo?.salePhone})`}</strong>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ScheduleInfo
