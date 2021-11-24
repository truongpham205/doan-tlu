import React from 'react'
import { Checkbox } from 'antd'
import PropTypes from 'prop-types'
import { ROUTER, STRING, CUSTOMERS_STATUS } from 'constants/Constant'
import { useHistory } from 'react-router-dom'
import { Input } from 'reactstrap'
import avatar from 'assets/user.jpg'

const BaseInfo = ({ data, blockCustomer, deleteCustomer, isShowHistory }) => {
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
              src={data?.avatar ? data?.avatar : avatar}
            />
          </div>
          <h3 className="profile-username text-center">{data?.full_name}</h3>
          <p className="text-muted text-center">{data?.phone}</p>
          <div>
            <strong>
              <i className="fas fa-address-card" /> {STRING.fullName}
            </strong>
            <p className="text-muted">{data?.full_name || '--'}</p>
            <hr />
            <strong>
              <i className="fas fa-phone-square" /> {STRING.phoneNumber}
            </strong>
            <p className="text-muted">{data?.phone || '--'}</p>
            <hr />
            <strong>
              <i className="fas fa-list-alt mr-1" /> {STRING.email}
            </strong>
            <p className="text-muted">{data?.email || '--'}</p>
            <hr />
            <strong>
              <i className="far fa-file-alt mr-1" /> {STRING.address}
            </strong>
            <p className="text-muted">{data?.customer_info?.address || '--'}</p>
          </div>
          <div className="timeline-footer mt-3">
            <a href className="btn btn-primary btn-sm" onClick={blockCustomer}>
              {data?.is_active === CUSTOMERS_STATUS.active ? STRING.blockAccount : STRING.unlockCustomer}
            </a>
            <a href className="btn btn-danger btn-sm" onClick={deleteCustomer}>
              {STRING.deleteAccount}
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
