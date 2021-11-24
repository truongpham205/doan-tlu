import React from 'react'
import PropTypes from 'prop-types'
import { STRING, ORDER_STATUS } from 'constants/Constant'
import { formatDateTime, toDateString } from 'utils/helper'
CustomerInfo.propTypes = {
  customerInfo: PropTypes.object,
  handleShowListCustomer: PropTypes.func,
}

CustomerInfo.defaultProps = {
  customerInfo: {},
  handleShowListCustomer: null,
}

function CustomerInfo(props) {
  const { customerInfo, handleShowListCustomer } = props
  return (
    <div className=" col-12 col-md-6  px-3 py-2">
      <div className="col-12  row px-2 py-0">
        <div className="col-12">
          <h6>{STRING.inforCustomer}</h6>
        </div>

        <div className="col-5">
          <p>{STRING.customer}</p>
        </div>
        <div className="col-7">
          <p>
            <strong>{`${customerInfo?.customerName} ${customerInfo?.phoneNumber}`}</strong>
          </p>
        </div>

        <div className="col-5">
          <p>{'Email'}</p>
        </div>
        <div className="col-7">
          <p>
            <strong>{customerInfo.customerEmail}</strong>
          </p>
        </div>

        <div className="col-5">
          <p>{STRING.numberOfGuests}</p>
        </div>

        <div className="col-7">
          <p>
            <strong>{`${customerInfo?.adult} người lớn, ${customerInfo?.children} trẻ nhỏ`}</strong>
          </p>
          <p onClick={handleShowListCustomer}>
            <span style={{ color: 'blue' }} className="cursor">
              <strong>{`Danh sách khách hàng >>`}</strong>
            </span>
          </p>
        </div>

        <div className="col-5">
          <p>{STRING.time}</p>
        </div>

        <div className="col-7">
          <strong>
            {toDateString(customerInfo?.checkInAt)} - {toDateString(customerInfo?.checkOutAt)}
          </strong>
        </div>

        <div className="col-5">
          <p>{STRING.note}</p>
        </div>

        <div className="col-7">
          <p>
            <strong>{customerInfo?.note || STRING.notUpdate}</strong>
          </p>
        </div>

        {customerInfo.orderStatus === ORDER_STATUS.FINISHED && (
          <>
            <div className="col-5">
              <p>{STRING.evaluate}</p>
            </div>

            <div className="col-7">
              <p>
                <strong>{customerInfo?.orderReviews?.[0]?.note || STRING.notUpdate}</strong>
              </p>
            </div>
          </>
        )}
        {/* {customerInfo.orderStatus >= ORDER_STATUS.CHECK_IN && (
          <>
            <div className="col-5">
              <p>check-in</p>
            </div>

            <div className="col-7">
              <p>
                <strong>
                  {customerInfo?.customerSchedule?.[0]?.created_at
                    ? formatDateTime(customerInfo?.customerSchedule?.[0]?.created_at)
                    : '--'}
                </strong>
              </p>
            </div>
          </>
        )}
        {customerInfo.orderStatus >= ORDER_STATUS.CHECK_OUT && (
          <>
            <div className="col-5">
              <p>check-out</p>
            </div>

            <div className="col-7">
              <p>
                <strong>
                  {customerInfo?.customerSchedule?.[1]?.created_at
                    ? formatDateTime(customerInfo?.customerSchedule?.[1]?.created_at)
                    : '--'}
                </strong>
              </p>
            </div>
          </>
        )} */}
      </div>
    </div>
  )
}

export default CustomerInfo
