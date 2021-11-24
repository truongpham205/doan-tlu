import Loading from '@components/Loading'
import { CHAT_STATUS, ROUTER, SOCKET_URL } from '@constants/Constant'
import { Badge, Button, Container } from '@material-ui/core'
import NotificationsIcon from '@material-ui/icons/Notifications'
import userApi from '@networks/userApi'
import { notifySuccess } from '@utils/notify'
import { soundPlay } from '@utils/SoundNotify'
import { Avatar, DatePicker, Dropdown, Menu } from 'antd'
import Cookie from 'js-cookie'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { Link, useHistory, useLocation, useParams } from 'react-router-dom'
import { io } from 'socket.io-client'
import swal from 'sweetalert'
import logo_mobile from '../../../assets/logo-tab.png'
import logo from '../../../assets/logo.png'
import MenuItems from '../../../components/MenuItems'
import ModalSignout from '../../../components/ModalSignout'
import NavBarMobile from '../../NavBarMobile'
import './Header.css'
import { getNotificationIsntRead } from '../../../utils/getNotificationIsntRead'

const { RangePicker } = DatePicker

function Header(props) {
  const isLogin = Cookie.get('SESSION_ID')
  const [isLoading, setLoading] = useState(false)
  const [userInfo, setUserInfo] = useState({})
  const [openModalSingout, setOpenModalSignout] = useState(false)
  const [listUserNotif, setListUserNotif] = useState()
  let location = useLocation()
  let history = useHistory()

  const getListUserNotif = async () => {
    try {
      const res = await userApi.getListNotif()
      setListUserNotif(res.data)
    } catch (err) {
      swal('Thất bại', `${err.msg}`, 'error')
    }
  }

  useEffect(() => {
    if (isLogin) {
      getUserInfo()
      getListUserNotif()
      var socket = io(SOCKET_URL, {
        transports: ['websocket'],
      })
      socket.on('newOder', (value) => {
        const user = JSON.parse(localStorage.getItem('user'))
        if (value.type != CHAT_STATUS.CUSTOMER_CHAT && value.key_chat == user.key_chat) {
          getListUserNotif()
          value.type != CHAT_STATUS.SALE_LEADER_CONFIRMED && soundPlay(require('@assets/sound/notification.mp3'))
          notifySuccess(value.content)
          // notification(value.content)
        } else if (value.type == CHAT_STATUS.SALE_LEADER_CONFIRMED && value.user_id == user.id) {
          getListUserNotif()
          soundPlay(require('@assets/sound/notification.mp3'))
          notifySuccess(value.content)
        } else if (value.type == CHAT_STATUS.ORDER_PRICE && value.user_id == user.id) {
          location.pathname?.search(ROUTER.BOOKING_DETAIL) !== -1 && window.location.reload()
          getListUserNotif()
          soundPlay(require('@assets/sound/notification.mp3'))
          notifySuccess(value.content)
        } else if (value.type == CHAT_STATUS.CHECK_IN_OR_CHECK_OUT && value.user_id == user.id) {
          getListUserNotif()
          location.pathname?.search(ROUTER.BOOKING_DETAIL) !== -1 && window.location.reload()
          soundPlay(require('@assets/sound/notification.mp3'))
          notifySuccess(value.content)
        } else if (value.type == CHAT_STATUS.KEEP_ORDER && value.user_id == user.id) {
          getListUserNotif()
          location.pathname?.search(ROUTER.BOOKING_DETAIL) !== -1 && window.location.reload()
          soundPlay(require('@assets/sound/notification.mp3'))
          // notifySuccess(value.content)
        } else if (value.type == CHAT_STATUS.CAN_CHECK_IN && value.user_id == user.id) {
          getListUserNotif()
          soundPlay(require('@assets/sound/notification.mp3'))
          location.pathname?.search(ROUTER.BOOKING_DETAIL) !== -1 && window.location.reload()
          notifySuccess(value.content)
        } else if (value.type == CHAT_STATUS.CAN_DESPOSIT && value.user_id == user.id) {
          getListUserNotif()
          soundPlay(require('@assets/sound/notification.mp3'))
          location.pathname?.search(ROUTER.BOOKING_DETAIL) !== -1 && window.location.reload()
          notifySuccess(value.content)
        } else if (value.type == CHAT_STATUS.UPDATE_PRICE && value.user_id == user.id) {
          getListUserNotif()
          location.pathname?.search(ROUTER.BOOKING_DETAIL) !== -1 && window.location.reload()
        }
      })
    }
  }, [location])

  const handleCloseModalSingout = () => {
    setOpenModalSignout(false)
  }

  const handleOpenModalSingout = () => {
    setOpenModalSignout(true)
  }

  const getUserInfo = async () => {
    try {
      const res = await userApi.userInfo()
      setUserInfo(res.data)
    } catch (err) {
      swal('Thất bại', `${err.msg}`, 'error')
    }
  }

  const readNoti = async (noti) => {
    try {
      const res = await userApi.updateIsRead({ id: noti.id })
      if (noti.content.search('có thể thanh toán') !== -1) {
        Cookie.set('orderHightlight', JSON.parse(noti.meta_data).order_id)
      }
      window.location.href = `${ROUTER.BOOKING_DETAIL}/${JSON.parse(noti.meta_data).order_id}`
    } catch (err) {
      swal('Thất bại', `${err.msg}`, 'error') 
    }
  }

  const menu = (
    <Menu className="menu-avatar">
      <Menu.Item className="menu-item-avatar" onClick={() => history.push(ROUTER.USER_INFO)}>
        Quản lý hồ sơ cá nhân
      </Menu.Item>
      <Menu.Item className="menu-item-avatar" onClick={() => history.push(ROUTER.BOOKING_LIST)}>
        Danh sách đặt phòng
      </Menu.Item>
      <Menu.Item className="menu-item-avatar" onClick={() => history.push(ROUTER.FAVOURITE_LIST)}>
        Danh sách yêu thích
      </Menu.Item>
      <Menu.Item className="menu-item-logout" onClick={handleOpenModalSingout}>
        Đăng xuất
      </Menu.Item>
    </Menu>
  )

  const listNotif = (
    <Menu className="menu-notif">
      {listUserNotif?.length > 0 ? (
        listUserNotif?.map((value, key) => (
          <Menu.Item
            key={key}
            className="menu-item-notif"
            style={value.is_read === 1 && { color: 'gray' }}
            onClick={() => readNoti(value)}
          >
            <div>
              <Avatar src={require('@assets/logo-tab.png')} size={40} style={{ objectFit: 'cover' }} />
            </div>
            <div>
              <div style={{ fontWeight: 500 }}>{value?.title || 'Thông báo'}</div>
              <div>{value?.content || ''}</div>
              <div style={value.is_read === 0 ? { fontSize: '0.7rem', color: '#2979ff' } : { fontSize: '0.7rem' }}>
                {moment(value?.created_at).format('hh:mm DD/MM/YYYY')}
              </div>
            </div>
            {value.is_read === 0 && (
              <div style={{ float: 'right', width: '100%' }}>
                <i className="fas fa-circle" style={{ fontSize: '12px', color: '#2979ff', float: 'right' }}></i>
              </div>
            )}
          </Menu.Item>
        ))
      ) : (
        <p>Không có thông báo</p>
      )}
    </Menu>
  )

  return (
    <>
      {location.pathname !== ROUTER.LOGIN &&
        location.pathname !== ROUTER.REGISTER &&
        location.pathname !== ROUTER.FORGOT_PASSWORD && (
          <>
            {isLoading && <Loading />}
            <div className="header-container">
              <ModalSignout
                openModalSingout={openModalSingout}
                handleCloseModalSingout={handleCloseModalSingout}
                handleOpenModalSingout={handleOpenModalSingout}
              />
              <Container maxWidth="lg">
                <div
                  className="header-item row"
                  style={{
                    alignItems: 'center',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Button className="logo-destop" onClick={() => history.push(ROUTER.HOME_PAGE)}>
                    <img src={logo} height="auto" alt="logo" style={{ width: 180, cursor: 'pointer' }} />
                  </Button>
                  <Button>
                    <img
                      src={logo_mobile}
                      height="auto"
                      alt="logo"
                      style={{ width: 60 }}
                      className="logo-mobile"
                      onClick={() => history.push(ROUTER.HOME_PAGE)}
                    />
                  </Button>

                  <div
                    className="row pl-5 pr-4 search-and-login"
                    style={{ display: 'flex', justifyContent: 'flex-end' }}
                  >
                    {isLogin && (
                      <>
                        <div className="bell-icon-desk">
                          <Dropdown overlay={listNotif} placement="bottomRight" arrow>
                            <Badge
                              badgeContent={getNotificationIsntRead(listUserNotif)?.length || 0}
                              color="error"
                              className="mr-3"
                              style={{ cursor: 'pointer' }}
                            >
                              <NotificationsIcon />
                            </Badge>
                          </Dropdown>
                        </div>

                        <div className="bell-icon-mobile">
                          <MenuItems listUserNotif={listUserNotif} readNoti={(id) => readNoti(id)} />
                        </div>
                      </>
                    )}
                    <div className="icon-menu-mobile">
                      <NavBarMobile userInfo={userInfo} handle={handleOpenModalSingout} />
                    </div>
                    <input type="checkbox" hidden className="nav-input" id="nav-mobile-input" />
                    <label for="nav-mobile-input" className="nav-overlay"></label>
                    <nav class="nav-mobile">
                      <div class="nav-list">
                        <div className="nav-header">
                          <img
                            src={logo}
                            height="auto"
                            alt="logo"
                            style={{ maxWidth: '50%' }}
                            onClick={() => history.push(ROUTER.HOME_PAGE)}
                          />
                          <label for="nav-mobile-input">
                            <i className="fas fa-times fa-2x nav-button-close"></i>
                          </label>
                        </div>
                        <div onClick={() => history.push(ROUTER.REGISTER)} className="tab_bar_mobile">
                          <label for="nav-mobile-input">Đăng ký</label>
                        </div>

                        <div onClick={() => history.push(ROUTER.LOGIN)} className="tab_bar_mobile">
                          <label for="nav-mobile-input">Đăng nhập</label>
                        </div>
                      </div>
                    </nav>
                    <div className="user-header">
                      {!isLogin ? (
                        <div>
                          <Link to={ROUTER.REGISTER}>
                            <span className="btn-register">Đăng ký</span>
                          </Link>
                          <Link to={ROUTER.LOGIN}>
                            <span className="header-item_text_login btn-sigin">Đăng nhập</span>
                          </Link>
                        </div>
                      ) : (
                        <ul className="navbar-nav ml-auto">
                          <li className="nav-item dropdown">
                            <p
                              className="me-txt-menu d-flex m-0"
                              style={{ cursor: 'pointer', alignItems: 'center' }}
                              // onClick={() => history.push(ROUTER.USER_INFO)}
                            >
                              <Dropdown overlay={menu} placement="bottomRight" arrow>
                                {userInfo?.customer_info?.profile_image ? (
                                  <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <h6 style={{ margin: 0, marginRight: 5 }}>{userInfo?.full_name}</h6>
                                    <Avatar src={userInfo?.customer_info?.profile_image} size={40} />
                                  </div>
                                ) : (
                                  <Avatar
                                    src={require('@assets/logo-tab.png')}
                                    size={40}
                                    style={{ objectFit: 'cover' }}
                                  />
                                )}
                              </Dropdown>
                            </p>
                          </li>
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              </Container>
            </div>
            {/* </div> */}
          </>
        )}
    </>
  )
}

export default Header
