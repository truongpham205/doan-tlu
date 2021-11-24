import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import Cookie from 'js-cookie'
import { useDispatch, useSelector } from 'react-redux'

// import WrapperAuthScreen from '../components/WrapperAuthScreen'
import WrapperAuthScreen from '../components/WrapperAuthScreen'
import { ROUTER } from '@constants/Constant'
import Form from '@components/Form'
import loginApi from '@networks/loginApi'
import Loading from '@components/Loading'
import swal from 'sweetalert'
// import { login } from '../../../redux/actions/user'

LoginScreen.propTypes = {}

function LoginScreen(props) {
  const { register, errors, handleSubmit } = useForm({
    criteriaMode: 'all',
  })
  const [isLoading, setLoading] = useState(false)
  // const dispatch = useDispatch()
  // const userState = useSelector((state) => state.userState);

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const res = await loginApi.login(data)
      // dispatch(login(data))
      if (res.data.role?.id == 4) {
        localStorage.setItem('user', JSON.stringify(res.data))
        Cookie.set('SESSION_ID', res.data.token)
        props.history.push(ROUTER.HOME_PAGE)
        // window.location.reload()
      } else {
        swal('Thất bại', 'Sai tài khoản mật khẩu', 'error')
      }
      setLoading(false)
    } catch (err) {
      setLoading(false)
      swal('Thất bại', `${err.msg}`, 'error')
    }
  }

  const renderBody = () => {
    return (
      <>
        <div className="text-center">
          <h3 className="text-uppercase">
            <strong>ĐĂNG NHẬP</strong>
          </h3>
          <p style={{ color: 'black' }}>
            <strong>Đăng nhập để có trải nghiệm tốt nhất</strong>
          </p>
        </div>
        <form action="#" method="post" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group first">
            <label htmlFor="username">Tài khoản</label>
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
              placeholder="Tài khoản"
              type="number"
            />
          </div>
          <div className="form-group last mb-3">
            <label htmlFor="password">Mật khẩu</label>
            <Form
              name="password"
              errors={errors}
              register={register}
              validation={{
                required: 'Vui lòng nhập đủ thông tin',
              }}
              placeholder="Mật khẩu"
              type="password"
            />
          </div>
          <div className="d-sm-flex mb-4 align-items-center">
            <label className="control control--checkbox mb-3 mb-sm-0">
              <span className="caption">Ghi nhớ đăng nhập</span>
              <input type="checkbox" defaultChecked="checked" />
              <div className="control__indicator" />
            </label>
          </div>
          <input
            type="submit"
            defaultValue="Log In"
            value="ĐĂNG NHẬP"
            className="btn btn-block"
            style={{
              borderRadius: '20px',
              backgroundColor: '#0abe35',
              color: 'white',
              fontWeight: '500',
              padding: '0.65rem 0',
            }}
          />
          <h6 className="pt-3 pb-2 text-center">
            Quên mật khẩu?{' '}
            <Link
              to={ROUTER.FORGOT_PASSWORD}
              style={{ textDecoration: 'none', color: '#0989f7', padding: '0.65rem 0' }}
            >
              Nhấn vào đây
            </Link>
          </h6>
          <h6 className="text-center">
            Chưa có tài khoản?{' '}
            <Link to={ROUTER.REGISTER} style={{ textDecoration: 'none', color: '#0989f7' }}>
              Đăng ký
            </Link>
          </h6>
        </form>
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

export default LoginScreen
