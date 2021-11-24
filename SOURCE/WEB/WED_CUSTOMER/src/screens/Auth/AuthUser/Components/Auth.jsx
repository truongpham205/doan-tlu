import React, { Component } from 'react'
import Login from './Login'
import SignUp from './SignUp'

export default class Auth extends Component {
  constructor(props) {
    super(props)
    this.state = {
      check: true,
    }
  }

  render() {
    const { check } = this.state
    return (
      <>
        <div className="my-3 py-3">
          {check ? (
            <>
              <Login />
              <div
                className="btn btn-dangerr"
                style={{ display: 'flex', justifyContent: 'center' }}
                onClick={() => this.setState({ check: false })}
              >
                <a style={{ color: 'white' }}>
                  <strong>Đăng kí tài khoản mới</strong>
                </a>
              </div>
            </>
          ) : (
            <SignUp />
          )}
        </div>
      </>
    )
  }
}
