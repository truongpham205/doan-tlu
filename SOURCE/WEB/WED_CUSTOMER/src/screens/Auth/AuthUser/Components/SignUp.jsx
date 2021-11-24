import React, { Component } from 'react'
import { Button, FormControl } from 'react-bootstrap'
import { notifyWarning, notifySuccess } from 'src/utils/notify'
import { ROLE_TYPE, ROUTER, STATUS } from '@constants/Constant'
import * as API from '@constants/Api'
import Loading from 'src/components/Loading'
import swal from 'sweetalert'
import './Login.css'
export default class SignUp extends Component {
  constructor(props) {
    super(props)
    this.state = {
      email: '',
      fullName: '',
      password: '',
      address: '',
      confirmPassword: '',
      hidden: true,
      hiddenConfirm: true,
      isLoading: false,
    }
  }

  async createAccount() {
    this.setState({
      isLoading: true,
    })
    const { fullName, phoneNumber, address, email, password, confirmPassword } = this.state
    const Obj = {
      name: fullName,
      phone: phoneNumber,
      email: email,
      address: address || '',
      username: email || '',
      password: password || '',
      role_id: ROLE_TYPE.APPLICANT,
      gender: null,
      company: null,
      province_id: null,
      district_id: null,
    }
    if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email)) {
      if (password !== confirmPassword) {
        this.setState(
          {
            isLoading: false,
          },
          () =>
            swal({
              title: 'Mật khẩu không trùng khớp, vui lòng kiểm tra lại!',
              icon: 'warning',
            })
        )
        return
      }
      try {
        let res = await API.createUser(Obj)
        if (res.status === STATUS.ACTIVE) {
          this.setState({ isLoading: false }, () =>
            swal({
              title: 'Tạo tài khoản thành công',
              icon: 'success',
            }).then(() => window.location.reload())
          )
        }
      } catch (error) {
        this.setState({
          isLoading: false,
        })
      }
    } else {
      this.setState(
        {
          isLoading: false,
        },
        () =>
          swal({
            title: 'Vui lòng nhập lại email',
            icon: 'warning',
          })
      )
      return
    }
  }

  checkValiDate() {
    const { fullName, email, password, confirmPassword } = this.state
    return !(fullName, email, password, confirmPassword)
  }
  handleChange(fieldName, value) {
    this.setState({
      [fieldName]: value || '',
    })
  }

  showPassword = () => {
    this.setState({ hidden: !this.state.hidden })
  }

  showConfirmPassword = () => {
    this.setState({ hiddenConfirm: !this.state.hiddenConfirm })
  }

  render() {
    const { email, password, hidden, hiddenConfirm, fullName, confirmPassword, isLoading } = this.state
    return (
      <div
        className="py-3"
        style={{ borderTop: '1px solid #eee', borderBottom: '1px solid #eee', justifyContent: 'center' }}
      >
        {isLoading && <Loading />}
        <p style={{ fontSize: '16px', textAlign: 'center' }}>
          <strong>Đăng ký tài khoản</strong>
        </p>
        <FormControl
          className="my-3"
          autoComplete="off"
          type="text"
          placeholder="Họ và tên"
          value={fullName}
          onChange={(e) => this.handleChange('fullName', e.target.value)}
        />
        <FormControl
          className="my-3"
          autoComplete="off"
          type="email"
          placeholder="Email đăng nhập"
          value={email}
          onChange={(e) => this.handleChange('email', e.target.value)}
        />
        <div className="form-group" style={{ textAlign: 'right' }}>
          <FormControl
            autoComplete="off"
            className="my-3"
            type={hidden ? 'password' : 'text'}
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => this.handleChange('password', e.target.value)}
          />
          {hidden ? (
            <i
              class="fas fa-eye-slash"
              style={{
                color: 'gray',
                marginTop: -42,
                marginLeft: -25,
                position: 'absolute',
                cursor: 'pointer',
                zIndex: 1,
              }}
              onClick={this.showPassword}
            />
          ) : (
            <i
              className="fas fa-eye"
              style={{
                color: 'gray',
                marginTop: -42,
                marginLeft: -25,
                position: 'absolute',
                cursor: 'pointer',
                zIndex: 1,
              }}
              onClick={this.showPassword}
            />
          )}
        </div>
        <div className="form-group" style={{ textAlign: 'right' }}>
          <FormControl
            className="my-3"
            autoComplete="off"
            type={hiddenConfirm ? 'password' : 'text'}
            placeholder="Nhập lại mật khẩu"
            value={confirmPassword}
            onChange={(e) => this.handleChange('confirmPassword', e.target.value)}
          />
          {hiddenConfirm ? (
            <i
              class="fas fa-eye-slash"
              style={{
                color: 'gray',
                marginTop: -42,
                marginLeft: -25,
                position: 'absolute',
                cursor: 'pointer',
                zIndex: 1,
              }}
              onClick={this.showConfirmPassword}
            />
          ) : (
            <i
              className="fas fa-eye"
              style={{
                color: 'gray',
                marginTop: -42,
                marginLeft: -25,
                position: 'absolute',
                cursor: 'pointer',
                zIndex: 1,
              }}
              onClick={this.showConfirmPassword}
            />
          )}
        </div>
        <Button
          disabled={this.checkValiDate()}
          className="btn btn-successs"
          style={{ display: 'flex', justifyContent: 'center' }}
          onClick={() => this.createAccount()}
        >
          <a style={{ textDecoration: 'none', color: 'white' }}>Đăng Ký</a>
        </Button>
      </div>
    )
  }
}
