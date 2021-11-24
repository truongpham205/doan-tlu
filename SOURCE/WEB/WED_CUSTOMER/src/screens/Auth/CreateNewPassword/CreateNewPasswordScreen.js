import React from 'react'
import PropTypes from 'prop-types'
import WrapperAuthScreen from '../components/WrapperAuthScreen'
CreateNewPasswordScreen.propTypes = {}

function CreateNewPasswordScreen(props) {
  const renderBody = () => {
    return (
      <>
        <div className="text-center mb-5">
          <h3 className="text-uppercase">
            <strong>Tạo mật khẩu mới</strong>
          </h3>
          {/* <p style={{ color: 'black' }}>
            <strong>
              Nhập lại địa chỉ email bạn đã đăng ký.
              <br />
              Hệ thống sẽ gửi link cho bạn để cập nhật mật khẩu mới
            </strong>
          </p> */}
        </div>
        <form action="#" method="post">
          <div className="form-group first">
            <label htmlFor="username">Mật khẩu</label>
            <input type="password" className="form-control" placeholder="Mật khẩu" id="password" />
          </div>

          <div className="form-group second mb-3">
            <label htmlFor="username">Xác nhận mật khẩu</label>
            <input type="password" className="form-control" placeholder="Xác nhận mật khẩu" id="confirmPassword" />
          </div>
          <input
            type="submit"
            defaultValue="Log In"
            value="XÁC NHẬN"
            className="btn btn-block mb-4 mt-5"
            style={{
              borderRadius: '20px',
              backgroundColor: '#0abe35',
              color: 'white',
              fontWeight: '500',
              padding: '0.65rem 0',
              margin: '2rem 0',
            }}
          />
        </form>
      </>
    )
  }

  return <WrapperAuthScreen>{renderBody()}</WrapperAuthScreen>
}

export default CreateNewPasswordScreen
