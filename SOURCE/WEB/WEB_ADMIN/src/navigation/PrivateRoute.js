import React from 'react'
import { Route, Redirect } from 'react-router-dom'
import Cookie from 'js-cookie'
import { getUserInfo } from 'constants/Api'
import { ROUTER } from 'constants/Constant'

export default class PrivateRoute extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      verified: true,
      data: [],
      isLoading: true,
    }
  }

  render() {
    const { path, Component, exact } = this.props
    let token = Cookie.get('SESSION_ID')

    return (
      <Route
        path={path}
        exact={exact}
        render={(props) => (token ? <Component {...props} /> : <Redirect to={ROUTER.LOGIN} />)}
      />
    )
  }
}
