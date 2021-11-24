import React, { Component } from 'react'
import { FormControl, FormText } from 'react-bootstrap'
import { Link, Redirect } from 'react-router-dom'
import { notifyWarning } from 'src/utils/notify'
import { MESSAGE, ROUTER, ROLE_TYPE } from '@constants/Constant'
import Cookie from 'js-cookie'
import Loading from 'src/components/Loading'
import * as API from '@constants/Api'
import './Login.css'

export default class Login extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loadingAction: false,
      username: '',
      password: '',
      hidden: true,
    }
  }
  login = async () => {
    const { username, password } = this.state
    this.setState({
      loadingAction: true,
    })
    if (!username || !password) {
      notifyWarning(MESSAGE.empty)
      this.setState({
        loadingAction: false,
      })
      return
    }
    try {
      const res = await API.Login({
        username: username,
        password: password,
        role_id: ROLE_TYPE.APPLICANT,
      })

      this.setState({
        loadingAction: false,
      })
      Cookie.set('SESSION_ID_APPLICANT', res.data.token, {
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 1 month
      })
      window.location.href = ROUTER.HOME_PAGE
    } catch (err) {
      console.log(err)
      this.setState({
        loadingAction: false,
      })
    }
  }

  handleChange(fieldName, value) {
    this.setState({
      [fieldName]: value || '',
    })
  }

  handleKeyPress = (e) => {
    if (e.charCode === 13) {
      this.login()
    }
  }
  showPassword = () => {
    this.setState({ hidden: !this.state.hidden })
  }
  render() {
    const { username, password, loadingAction, hidden } = this.state
    const token = Cookie.get('SESSION_ID_APPLICANT')
    if (token) {
      return <Redirect to={ROUTER.APPLICANT} />
    }
    return (
      <>
        {loadingAction && <Loading />}
        <div className="pt-3" style={{ borderTop: '1px solid #eee', borderBottom: '1px solid #eee' }}>
          <p style={{ fontSize: '16px', textAlign: 'center' }}>
            <strong>Đăng nhập</strong>
          </p>
          <FormControl
            onKeyPress={this.handleKeyPress}
            autoComplete="off"
            className="my-3"
            type="text"
            placeholder="Email"
            value={username}
            onChange={(e) => this.handleChange('username', e.target.value)}
          />
          <div className="form-group" style={{ textAlign: 'right' }}>
            <FormControl
              onKeyPress={this.handleKeyPress}
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
          <div className="btn btn-successs" style={{ display: 'flex', justifyContent: 'center' }} onClick={this.login}>
            <a style={{ textDecoration: 'none', color: 'white' }}>Đăng nhập</a>
          </div>
          <p className="text-center p-2 forgotPass">
            <a className="forgotPass" style={{ color: 'black', textDecoration: 'none', cursor: 'pointer' }}>
              Quên mật khẩu
            </a>
          </p>
        </div>
      </>
    )
  }
}
