import React, { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import Cookie from 'js-cookie'

import WrapperAuthScreen from '../components/WrapperAuthScreen'
import Form from '@components/Form'
import { ROUTER } from '@constants/Constant'
import Loading from '@components/Loading'
import Password from 'antd/lib/input/Password'
import swal from 'sweetalert'

import userApi from '@networks/userApi'
import loginApi from '@networks/loginApi'

RegisterScreen.propTypes = {}

function RegisterScreen(props) {
  const { register, errors, handleSubmit, watch } = useForm({
    criteriaMode: 'all',
  })

  const [isLoading, setLoading] = useState(false)

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await userApi.createUser(data)
      setLoading(false)
      swal('Thành công', 'Tài khoản của bạn đã được tạo', 'success', {
        button: {
          text: 'Đăng nhập ngay',
        },
      }).then(() => login(data))
    } catch (err) {
      setLoading(false)
      swal('Thất bại', `${err.msg}`, 'error')
    }
  }

  const login = async (data) => {
    setLoading(true)
    try {
      const res = await loginApi.login({ phone: data.phone, password: data.password })
      Cookie.set('SESSION_ID', res.data.token)
      props.history.push(ROUTER.HOME_PAGE)
      window.location.reload()
      setLoading(false)
    } catch (err) {
      setLoading(false)
      swal('Thất bại', `${err.msg}`, 'error')
    }
  }

  const password = useRef({});
  password.current = watch("password", "");

  const confirmPassword = useRef({});
  confirmPassword.current = watch("confirmPassword", "");

  const renderBody = () => {
    return (
      <>
        <div className="text-center" style={{ marginBottom: '2rem' }}>
          <h3 className="text-uppercase">
            <strong>ĐĂNG KÝ TÀI KHOẢN</strong>
          </h3>
          <p style={{ color: 'black' }}>
            <strong>
              Hãy tạo tài khoản để bạn có thể
              <br />
              hưởng những dịch vụ ưu đãi nhất từ Flamingo
            </strong>
          </p>
        </div>
        <form action="#" method="post" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group first">
            <label htmlFor="full_name">Họ và tên</label>
            <Form
              name="full_name"
              errors={errors}
              register={register}
              validation={{
                required: 'Vui lòng nhập đầy đủ thông tin',
              }}
              placeholder="Họ và tên"
              type="text"
            />
          </div>

          <div className="form-group first">
            <label htmlFor="phone">Số điện thoại</label>
            <Form
              name="phone"
              errors={errors}
              register={register}
              validation={{
                required: 'Vui lòng nhập đủ thông tin',
                pattern: {
                  value: /(84|0[3|5|7|8|9])+([0-9]{8})\b/g,
                  message: 'Số điện thoại không hợp lệ',
                },
              }}
              placeholder="Số điện thoại"
              type="number"
            />
          </div>

          <div className="form-group first">
            <label htmlFor="email">Email</label>
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
              placeholder="Email"
              type="text"
            />
          </div>

          <div className="form-group first">
            <label htmlFor="password">Mật khẩu</label>
            <Form
              name="password"
              errors={errors}
              register={register}
              validation={{
                required: 'Vui lòng nhập đầy đủ thông tin',
                validate: (value) =>
                  value === confirmPassword.current || "Mật khẩu không trùng nhau"
              }}
              placeholder="Mật khẩu"
              type="password"
            />
          </div>

          <div className="form-group first">
            <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
            <Form
              name="confirmPassword"
              errors={errors}
              register={register}
              validation={{
                required: 'Vui lòng nhập đầy đủ thông tin',
                // pattern: {
                //   value: password,
                //   message: '2 mật khẩu không trùng nhau',
                // },
                validate: (value) =>
                  value === password.current || "Mật khẩu không trùng nhau"
              }}
              placeholder="Xác nhận mật khẩu"
              type="password"
            />
          </div>

          <input
            type="submit"
            defaultValue="Log In"
            value="ĐĂNG KÝ"
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
        <div className="btn-back float-left">
          Đã có tài khoản?
          <Link to={ROUTER.LOGIN} className="ml-2" style={{ textDecoration: 'none', color: '#0989f7' }}>
            Đăng nhập
          </Link>
        </div>
      </>
    )
  }

  return (
    <WrapperAuthScreen>
      {isLoading && <Loading />}
      {renderBody()}
    </WrapperAuthScreen>
  )
}

export default RegisterScreen
