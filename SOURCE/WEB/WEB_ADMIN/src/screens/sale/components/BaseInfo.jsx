import React from 'react'
import { Checkbox } from 'antd'
import PropTypes from 'prop-types'
import { ROUTER, STRING, CUSTOMERS_STATUS } from 'constants/Constant'
import { useHistory } from 'react-router-dom'
import { Input } from 'reactstrap'
import avatar from 'assets/user.jpg'
import formatMoney from 'utils/formatMoney'

const BaseInfo = ({ data, settlementSale, deleteSale, notSettlement }) => {
  const history = useHistory()
  return (
    <>
      {/* Profile Image */}
      <div className="card card-primary card-outline">
        <div className="card-body box-profile">
          <div className="text-center">
            <img
              className="profile-user-img img-fluid img-circle"
              alt="avatar"
              style={{ height: 98, objectFit: 'cover' }}
              src={data?.avatar ? data.avatar : avatar}
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
            {/* <strong>
              <i className="fas fa-exchange-alt mr-1"></i> {STRING.status}
            </strong>
            <p className="">{data?.is_payment ? 'Đã quyết toán' : 'Chưa quyết toán' || '--'}</p>
            <hr /> */}
            <strong className="text-success">
              <i className="fas fa-chart-line mr-1"></i> {STRING.sales}
            </strong>
            <p className="text-success" style={{ fontWeight: 600 }}>
              {formatMoney(data?.revenue || 0) || '--'}
            </p>
            <hr />

            <strong className="text-danger">
              <i className="far fa-file-alt mr-1" /> Chưa quyết toán
            </strong>
            <p className="text-danger" style={{ fontWeight: 600 }}>
              {formatMoney(notSettlement || 0) || '--'}
            </p>
          </div>
          <div className="timeline-footer mt-3">
            <a
              href
              className="btn btn-primary btn-sm"
              style={{ color: 'white' }}
              onClick={() => history.push(ROUTER.EDIT_SALE + `/${data?.id}`)}
            >
              {STRING.editSale}
            </a>
            <a href className="btn btn-danger btn-sm" onClick={deleteSale}>
              {STRING.deleteSale}
            </a>
          </div>
        </div>
        {/* /.card-body */}
      </div>
    </>
  )
}

BaseInfo.propTypes = {}

export default BaseInfo
