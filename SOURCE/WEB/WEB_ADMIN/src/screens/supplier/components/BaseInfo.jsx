import React from 'react'
import { Checkbox } from 'antd'
import PropTypes from 'prop-types'
import { ROUTER, STRING, CUSTOMERS_STATUS } from 'constants/Constant'
import { useHistory } from 'react-router-dom'
import { Input } from 'reactstrap'

const BaseInfo = ({
  data,
  blockCustomer,
  deleteCustomer,
  isShowHistory,
  // handleShowModal,
  // handleAddStaffRole,
  // checkboxForStore,
  // checkboxForStaff,
  handleCheckBoxChange,
}) => {
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
              src={data?.avatar ? data?.avatar : '../../dist/img/user4-128x128.jpg'}
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
            <p className="text-muted">{data?.address || '--'}</p>

            {/* {!data?.store_name && data?.status === CUSTOMERS_STATUS.active ? (
              <>
                <strong className="mr-2">
                  <i className="fas fa-plus"></i> {STRING.addStoreRole}
                </strong>
                <Checkbox
                  checked={checkboxForStore}
                  onChange={(e) => handleCheckBoxChange('checkboxForStore', !checkboxForStore)}
                ></Checkbox>
              </>
            ) : ( */}

            {data?.status === CUSTOMERS_STATUS.active && (
              <>
                <strong className="mr-2">
                  <i className="fas fa-user-tag"></i> {STRING.staffRole}
                </strong>
                <Checkbox
                  checked={data?.staff_code}
                  onChange={(e) => handleCheckBoxChange('checkboxForStaff')}
                ></Checkbox>
              </>
            )}
            <hr />

            {data?.status === CUSTOMERS_STATUS.active && (
              <>
                <strong className="mr-2">
                  <i className="fas fa-store"></i> {STRING.storeRole}
                </strong>
                <Checkbox
                  checked={data?.store_name}
                  onChange={(e) => handleCheckBoxChange('checkboxForStore')}
                ></Checkbox>
              </>
            )}
            {/* <hr /> */}

            {/* {!data?.staff_code && data?.status === CUSTOMERS_STATUS.active ? (
              <>
                <strong className="mr-2">
                  <i className="fas fa-plus"></i> {STRING.addStaffRole}
                </strong>
                <Checkbox
                  checked={checkboxForStaff}
                  onChange={(e) => handleCheckBoxChange('checkboxForStaff', !checkboxForStaff)}
                ></Checkbox>
              </>
            ) : (
              data?.status === CUSTOMERS_STATUS.active && (
                <>
                  <strong className="mr-2">
                  <i className="fas fa-store"></i> {STRING.deleteStaffRole}
                  </strong>
                  <Checkbox
                    checked={checkboxForStaff}
                    onChange={(e) => handleCheckBoxChange('checkboxForStaff', !checkboxForStaff)}
                  ></Checkbox>
                </>
              )
            )} */}

            {/* {!data?.store_name && data?.status === CUSTOMERS_STATUS.active ? (
              <a href className="btn btn-info btn-sm" style={{ width: 132.25 }} onClick={handleShowModal}>
                {STRING.addStoreRole}
              </a>
            ) : (
              data?.status === CUSTOMERS_STATUS.active && (
                <a href className="btn btn-danger btn-sm" style={{ width: 132.25 }} onClick={handleShowModal}>
                  {STRING.deleteStoreRole}
                </a>
              )
            )}

            {!data?.staff_code && data?.status === CUSTOMERS_STATUS.active ? (
              <a href className="btn btn-info btn-sm" style={{ width: 132.25 }} onClick={handleAddStaffRole}>
                {STRING.staffRole}
              </a>
            ) : (
              data?.status === CUSTOMERS_STATUS.active && (
                <a href className="btn btn-danger btn-sm" style={{ width: 132.25 }} onClick={handleAddStaffRole}>
                  {STRING.deleteStaffRole}
                </a>
              )
            )} */}

            {isShowHistory && (
              <>
                <hr />
                <a
                  href={true}
                  style={{ color: 'blue' }}
                  onClick={() => history.push(ROUTER.PROFILE_HISTORY + '/' + data?.id)}
                >
                  {STRING.profileHistory} {'>>'}
                </a>
              </>
            )}
          </div>
          <div className="timeline-footer mt-3">
            <a href={true} className="btn btn-primary btn-sm" onClick={blockCustomer}>
              {data?.status === CUSTOMERS_STATUS.active ? STRING.blockAccount : STRING.unlockCustomer}
            </a>
            <a href={true} className="btn btn-danger btn-sm" onClick={deleteCustomer}>
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
