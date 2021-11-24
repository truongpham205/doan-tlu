import Toast from '@src/components/Toast'
import '@styles/App.css'
import 'antd/dist/antd.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import Cookie from 'js-cookie'
import React, { useEffect, useState } from 'react'
import Chat from './Chat'
import AppNavigator from './navigation/AppNavigator'

function App() {
  const isLogin = Cookie.get('SESSION_ID')
  // const [isLogin, setIsLogin] = useState()

  // useEffect(() => {
  //   console.log("okkkkkkkkkkkkk")
  //   setIsLogin(Cookie.get('SESSION_ID'))
  // }, [isLogin])

  return (
    <>
      <Toast />
      <AppNavigator style={{ zIndex: '-1' }} />
      {isLogin && <Chat />}
    </>
  )
}

export default App
