import React from 'react'
import PropTypes from 'prop-types'
import { Link, Redirect } from 'react-router-dom'
import logo from '../../../assets/logo.png'
import './WrapperAuth.css'

WrapperAuthScreen.propTypes = {}

function WrapperAuthScreen(props) {
  return (
    <div className="d-md-flex">
      <div className="container-fluid">
        <div className="login-bg"></div>
        <div className="contents">
          <div style={{ position: 'absolute', marginTop: 25, paddingLeft: 140 }}>
            <Link to="/">
              <img src={logo} width="350" height="auto" className="logo-content"/>
            </Link>
          </div>
          <div className="container float-right">
            <div className="row align-items-center justify-content-end auth_box">
              <div className="col-md-8 p-0">
                <div className="form-block mx-auto">{props.children}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WrapperAuthScreen
