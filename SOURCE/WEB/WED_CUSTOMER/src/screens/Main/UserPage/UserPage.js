import Loading from '@components/Loading'
import { ROUTER } from '@constants/Constant'
import { Container } from '@material-ui/core'
import serviceApi from '@networks/serviceApi'
import userApi from '@networks/userApi'
import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import swal from 'sweetalert'
import './UserPage.css'
import BookingRoom from './UserPageComponent/BookingRoom'
import FavoritesList from './UserPageComponent/FavoritesList'
import UserInfo from './UserPageComponent/UserInfo'
import Cookie from 'js-cookie'
import Chat from '../../../Chat'

const UserPage = (props) => {
  const [tabActive, setTabActive] = useState('profileManager')
  const [isLoading, setLoading] = useState(false)
  const [userInfo, setUserInfo] = useState({})
  const [listService, setListService] = useState([])
  const location = useLocation()
  const isLogin = Cookie.get('SESSION_ID')

  const listServiceLiked = async () => {
    try {
      const res = await serviceApi.listServiceLiked()
      setListService(res.data)
    } catch (err) {
      swal('Thất bại', `${err.msg}`, 'error')
    }
  }

  const getUserInfo = async () => {
    try {
      const res = await userApi.userInfo()
      setUserInfo(res.data)
    } catch (err) {
      swal('Thất bại', `${err.msg}`, 'error')
    }
  }

  useEffect(() => {
    window.scrollTo(0, 0)
    getUserInfo()
    listServiceLiked()
    switch (location.pathname) {
      case ROUTER.USER_INFO:
        setTabActive('profileManager')
        break
      case ROUTER.BOOKING_LIST:
        setTabActive('bookingRoom')
        break
      case ROUTER.FAVOURITE_LIST:
        setTabActive('favoritesList')
        break
    }
  }, [location.pathname])

  return (
    <>
      <div className="container-fluid">
        {isLoading && <Loading />}
        <div className="container-header" style={{ marginBottom: 130 }}>
          <Container maxWidth="lg">
            <div>
              {tabActive === 'profileManager' && <UserInfo />}
              {tabActive === 'bookingRoom' && <BookingRoom userInfo={userInfo} />}
              {tabActive === 'favoritesList' && <FavoritesList listService={listService} />}
            </div>
          </Container>
        </div>
      </div>
      {isLogin && <Chat />}
    </>
  )
}

export default UserPage
