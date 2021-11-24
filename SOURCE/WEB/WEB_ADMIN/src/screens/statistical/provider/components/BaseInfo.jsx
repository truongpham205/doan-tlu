import React from 'react'
import { Checkbox } from 'antd'
import PropTypes from 'prop-types'
import { ROUTER, STRING, CUSTOMERS_STATUS } from 'constants/Constant'
import { useHistory } from 'react-router-dom'
import { Input } from 'reactstrap'
import avatar from 'assets/user.jpg'
import formatMoney from 'utils/formatMoney'
import formatNumber from 'utils/formatNumber'

const BaseInfo = ({ data }) => {
  return (
    <>
      {/* Profile Image */}
      <div className="card card-primary card-outline table--shadow">
        <div className="card-body box-profile">
          <div className="text-center">
            <img
              className="profile-user-img img-fluid img-circle"
              alt="avatar"
              style={{ height: 98, objectFit: 'cover' }}
              src={data?.provider_info?.profile_image ? data?.provider_info?.profile_image : avatar}
            />
          </div>
          <h3 className="profile-username text-center">{data?.full_name}</h3>
          <p className=" text-center">{data?.phone}</p>
          <div>
            <strong>
              <i className="fas fa-address-card" /> {STRING.fullName}
            </strong>
            <p className="">{data?.full_name || '--'}</p>
            <hr />
            <strong>
              <i className="fas fa-phone-square" /> {STRING.phoneNumber}
            </strong>
            <p className="">{data?.phone || '--'}</p>
            <hr />
            <strong>
              <i className="fas fa-archive" /> Tổng số đơn hàng
            </strong>
            <p className="">{formatNumber(data?.countOrder?.toString()) || '--'}</p>
            <hr />
            <strong>
              <i className="fas fa-money-bill-alt" /> Tổng giá bán
            </strong>
            <p className="">{formatMoney(data?.totalPrice3?.toString()) || '--'}</p>
          </div>
          <hr />
          <div>
            <strong>
              <i className="fas fa-money-bill-alt" /> Tổng giá chốt
            </strong>
            <p className="">{formatMoney(data?.totalAmount3) || '--'}</p>
          </div>
          <hr />
          <strong>
            <i className="fas fa-money-bill-alt" /> Tổng tiền đã trả
          </strong>
          <p className="">{formatMoney(data?.totalAmount5) || '--'}</p>
          <hr />
          <strong>
            <i className="fas fa-money-bill-alt" /> Tổng tiền chưa trả
          </strong>
          <p className="">
            {data?.totalAmount3 - data?.totalAmount5 >= 0
              ? formatMoney(data?.totalAmount3 - data?.totalAmount5)
              : formatMoney(0)}
          </p>
          <hr />
          <div>
            <strong>
              <i className="fas fa-money-bill-alt" /> Tổng cọc
            </strong>
            <p className="">{formatMoney(data?.totalAmount4) || '--'}</p>
          </div>
        </div>
      </div>
    </>
  )
}

BaseInfo.propTypes = {}

export default BaseInfo
