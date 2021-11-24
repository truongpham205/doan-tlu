import React from 'react'
import PropTypes from 'prop-types'
import { useForm } from 'react-hook-form'

import WrapperAuthScreen from '../components/WrapperAuthScreen'
import Form from '@components/Form'

ForgotPasswordScreen.propTypes = {}

function ForgotPasswordScreen(props) {
  const { register, errors, handleSubmit } = useForm({
    criteriaMode: 'all',
  })
  const onSubmit = (data) => console.log(data)

  const renderBody = () => {
    return (
      <>
        <div className="text-center" style={{ marginBottom: '2rem' }}>
          <h3 className="text-uppercase">
            <strong>Quên mật khẩu</strong>
          </h3>
          <p style={{ color: 'black' }}>
            <strong>
              Nhập lại địa chỉ email bạn đã đăng ký.
              <br />
              Hệ thống sẽ gửi link cho bạn để cập nhật mật khẩu mới
            </strong>
          </p>
        </div>
        <form action="#" method="post" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group first">
            <label htmlFor="username">Email</label>
            <Form
              name="email"
              errors={errors}
              register={register}
              validation={{
                required: 'Vui lòng nhập đủ thông tin',
                pattern: {
                  value: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
                  message: 'Email không hợp lệ',
                },
              }}
              placeholder="your-email@gmail.com"
              type="text"
            />
          </div>
          <input
            type="submit"
            defaultValue="Log In"
            value="XÁC NHẬN"
            className="btn btn-block my-4"
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
        <div className="btn-back float-left" onClick={() => props.history.goBack()} style={{ cursor: 'pointer' }}>
          <i className="fas fa-arrow-left mr-1"></i>Trở lại
        </div>
      </>
    )
  }

  return <WrapperAuthScreen>{renderBody()}</WrapperAuthScreen>
}

export default ForgotPasswordScreen
