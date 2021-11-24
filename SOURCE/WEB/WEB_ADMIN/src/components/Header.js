import React, { Component } from 'react'
import { connect } from 'react-redux'
import 'styles/Header.css'
import 'styles/UserScreen.css'
import Cookie from 'js-cookie'
import axios from 'axios'
import { changePasswordAccount, SOCKET_URL, getListNotification, readNotification, requestLogout } from 'constants/Api'
import { withRouter, Link } from 'react-router-dom'
import { validateForm } from 'utils/helper'
import { Spin, Dropdown, Menu } from 'antd'
import { getListOverView } from 'redux/actions'
import { STRING, TYPE_INPUT, ROLE, NOTI_TYPE, ROUTER, CHAT_STATUS } from 'constants/Constant'
import ModalComponent from 'components/ModalComponent'
import ListingWithThumbnail from 'components/NotificationLoader'
import LoadingData from 'components/LoadingData'
import { LoadingOutlined } from '@ant-design/icons'
import { notifyFail, notifySuccess } from 'utils/notify'
import socketIOClient from 'socket.io-client'
class Header extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showModal: false,
      showSpinner: false,
      countBadge: '',
      activePageNotification: 1,
      listNotification: [],
      pagingNotification: {},
      isLoadMore: false,
      modal: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      },
      validateError: {
        oldPasswordError: '',
        newPasswordError: '',
        confirmPasswordError: '',
      },
      userInfo: JSON.parse(localStorage.getItem('userInfo')),
      paging: {
        page: '',
        count: '',
        limit: '',
      },
    }

    this.notificationTimeoutRef = React.createRef()
  }

  componentDidMount() {
    const { userInfo } = this.state
    if (userInfo?.role_id !== ROLE.PROVIDER) {
      this.props.getListOverView()
    }
    this.getListNotificationFunc()
    this.listenNotification()
  }

  getListNotificationFunc = async () => {
    const { paging } = this.state
    try {
      const res = await getListNotification({ page: paging?.page || 1 })
      this.setState({
        listNotification: res?.data,
        countBadge: res?.countUnread,
        paging: res?.paging,
        activePageNotification: paging?.page || 1,
      })
    } catch (error) {
      console.log(error)
    }
  }

  listenNotification = () => {
    const { userInfo } = this.state
    var socket = socketIOClient(process.env.REACT_APP_SOCKET, {
      transports: ['websocket'],
    })
    socket.on('newOder', async (data) => {
      if (data?.type == CHAT_STATUS.CUSTOMER_CHAT) return

      if (this.notificationTimeoutRef.current) {
        clearTimeout(this.notificationTimeoutRef.current)
      }

      // assign ref by setTimeout to await until the last notification then call action to improve performance

      this.notificationTimeoutRef.current = setTimeout(() => {
        if (userInfo?.role_id !== ROLE.PROVIDER) {
          this.props.getListOverView()
        }
        this.getListNotificationFunc()
      }, 500)
    })
  }

  refreshPage() {
    window.location.reload(false)
  }

  changePassword = async () => {
    const { oldPassword, newPassword, confirmPassword } = this.state.modal
    if (newPassword !== confirmPassword) {
      notifyFail('Mật khẩu mới không khớp')
      return
    }

    this.setState({
      ...this.state,
      showSpinner: true,
    })

    try {
      await changePasswordAccount({
        new_pass: newPassword,
        old_pass: oldPassword,
      })

      this.setState({
        modal: {
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
        },
        showSpinner: false,
        showModal: false,
      })

      notifySuccess('Đổi mật khẩu thành công!')
    } catch (error) {
      this.setState({
        showSpinner: false,
      })
      notifyFail('Đổi mật khẩu thất bại!')
    }
  }

  setShowModal = (bool) => {
    this.setState({
      showModal: bool,
    })
  }

  handleInputModal = async (fieldName, value) => {
    await this.setState({
      modal: {
        ...this.state.modal,
        [fieldName]: value || '',
      },
    })
  }

  checkValidateValue = () => {
    const { oldPassword, newPassword, confirmPassword } = this.state.modal
    if (!oldPassword || !newPassword || !confirmPassword) {
      return true
    }
  }

  logout = async () => {
    try {
      await requestLogout()
    } catch (error) {
      console.log(error)
    }
    window.location.href = '/dang-nhap'
    Cookie.remove('SESSION_ID')
    localStorage.clear()
  }
  handleScroll = async (event) => {
    const { activePageNotification, listNotification, countBadge, isLoadMore } = this.state
    try {
      // check if distance end of div about 10px then call API
      if (
        event.target.scrollHeight - Math.round(event.target.scrollTop) - event.target.clientHeight < 10 &&
        countBadge > listNotification.length &&
        !isLoadMore
      ) {
        this.setState({
          ...this.state,
          isLoadMore: true,
        })
        let listNotificationApi = await getListNotification({ page: activePageNotification + 1 })

        setTimeout(() => {
          this.setState({
            ...this.state,
            listNotification: listNotification.concat(listNotificationApi?.data),
            activePageNotification: activePageNotification + 1,
            isLoadMore: false,
          })
        }, 2000)
      }
    } catch (error) {
      this.setState({
        ...this.state,
        isLoadMore: false,
      })
      console.log(error)
    }
  }

  handleBlur = (nameKey, titleName) => {
    validateForm(this, this.state.modal[nameKey], nameKey, titleName)
  }

  handleRouterOnNotification = (notification) => {
    const { userInfo } = this.state
    const metaData = JSON.parse(notification.meta_data)
    if (userInfo?.role_id == ROLE.SALE_LEADER || userInfo?.role_id === ROLE.PROVIDER) {
      return ROUTER.ORDER_DETAIL_BOOK_ROOM + '/' + metaData?.order_id
    }
    switch (metaData?.type_noti) {
      case NOTI_TYPE.ORDER_DETAIL_BOOK_ROOM:
        return ROUTER.ORDER_DETAIL_BOOK_ROOM + '/' + metaData?.order_id

      case NOTI_TYPE.ORDER_DETAIL_BOOK_TOUR:
        return ROUTER.ORDER_DETAIL_BOOK_TOUR + '/' + metaData?.order_id

      case NOTI_TYPE.ORDER_BOOK_ROOM_LIST:
        return ROUTER.ORDER_BOOK_ROOM

      case NOTI_TYPE.ORDER_BOOK_TOUR_LIST:
        return ROUTER.ORDER_BOOK_TOUR
      default:
        return ROUTER.OVERVIEW
    }
  }

  readNotificationFunc = async (id, index) => {
    const { listNotification, countBadge } = this.state
    try {
      await readNotification({
        id: id,
      })
      listNotification[index].is_read = 1
      this.setState({
        ...this.state,
        listNotification: [...listNotification],
        countBadge: countBadge - 1,
      })
    } catch (error) {
      console.log(error)
    }
  }

  // readAllNotification = async () => {
  //   try {
  //     await readAllNotificationWeb()
  //   } catch (error) {
  //     console.log(error)
  //   }
  //   this.getListNotificationFunc()
  // }

  renderModal = () => {
    const { showModal, showSpinner } = this.state
    const { newPassword, oldPassword, confirmPassword } = this.state.modal
    const { newPasswordError, oldPasswordError, confirmPasswordError } = this.state.validateError
    const addField = [
      {
        type: TYPE_INPUT.passWord,
        titleName: STRING.oldPassword,
        value: oldPassword,
        error: oldPasswordError,
        valueName: 'oldPassword',
        errorName: 'oldPasswordError',
      },
      {
        type: TYPE_INPUT.passWord,
        titleName: STRING.newPassword,
        value: newPassword,
        error: newPasswordError,
        valueName: 'newPassword',
        errorName: 'newPasswordError',
      },
      {
        type: TYPE_INPUT.passWord,
        titleName: STRING.confirmPassword,
        value: confirmPassword,
        error: confirmPasswordError,
        valueName: 'confirmPassword',
        errorName: 'confirmPasswordError',
      },
    ]
    return (
      <ModalComponent
        allField={addField}
        image_url=""
        title={STRING.changePassWord}
        checkValidateError={this.state.validateError}
        checkValidateValue={this.checkValidateValue()}
        handleInputModal={this.handleInputModal}
        isOpen={showModal}
        handleBlur={this.handleBlur}
        addUpdate={this.changePassword}
        showSpinner={showSpinner}
        onHide={() =>
          this.setState({
            showModal: false,
            validateError: {
              oldPasswordError: '',
              newPasswordError: '',
              conFirmPasswordError: '',
            },
          })
        }
      />
    )
  }

  render() {
    const { listNotification, countBadge, isLoadMore } = this.state
    const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />
    // const menu = (
    //   <Menu subMenuOpenDelay={0} subMenuCloseDelay={0}>
    //     <Menu.Item
    //       onClick={() => {
    //         this.readAllNotification()
    //         setTimeout(() => {
    //           document.getElementById('notification').classList.remove('show')
    //         }, 150)
    //       }}
    //     >
    //       <span>Đánh dấu tất cả là đã đọc</span>
    //     </Menu.Item>
    //   </Menu>
    // )
    return (
      <>
        {this.renderModal()}
        <nav className="main-header navbar navbar-expand navbar-light me-header">
          {/* Left navbar links */}
          <div className="col-4 col-lg-2">
            <a className="cursor" data-widget="pushmenu" style={{ color: 'rgba(0,0,0,.5)', textDecoration: 'none' }}>
              <i className="fas fa-bars" />
            </a>
          </div>
          <ul className="navbar-nav ml-auto mr-3">
            {/* notification */}
            <li className="nav-item dropdown">
              <span className="nav-link cursor" data-toggle="dropdown">
                <i className="far fa-bell" />
                <span className="badge badge-danger navbar-badge">{countBadge || ''}</span>
              </span>
              <div
                className="dropdown-menu dropdown-menu-lg dropdown-menu-right"
                style={{ minHeight: 400, overflowY: 'auto' }}
                id="notification"
                onScroll={this.handleScroll}
              >
                <div
                  className="row mx-auto py-2"
                  style={{ width: '97%' }}
                  onClick={(e) => {
                    // keep class show when click seeMore
                    if (document.getElementById('notification').classList.value.search('show') === -1) {
                      document.getElementById('notification').classList.add('show')
                    }
                  }}
                >
                  <h6 className="d-flex align-items-center mb-0 pl-0 text-left col-6">
                    <strong>{STRING.notification}</strong>
                  </h6>

                  {/* <Dropdown trigger={['click']} overlay={menu}  placement="bottomRight" arrow>
                    <span className="col-6 pr-0 d-flex align-items-center  justify-content-end cursor">
                      <i className="fas fa-ellipsis-h mr-2"></i>
                    </span>
                  </Dropdown> */}
                </div>
                {/* <h6 className="dropdown-item dropdown-header col-6">{STRING.notification}</h6> */}
                <div className="dropdown-divider" />

                {listNotification.length
                  ? listNotification?.map((item, index) => {
                      if (!item.is_read) {
                        return (
                          <Link
                            to={this.handleRouterOnNotification(item)}
                            className="dropdown-item d-flex row pr-1"
                            key={index}
                            onClick={(e) => {
                              document.getElementById('notification').classList.remove('show')
                              this.readNotificationFunc(item.id, index)
                            }}
                          >
                            <div className="col-1">
                              <i className="fas fa-envelope mr-2" />
                            </div>
                            <div className="col-10 pr-0">
                              <p>
                                <strong>{item.title}</strong>
                              </p>
                              <p className="text-sm">{item.content}</p>
                            </div>
                            <div style={{ flexGrow: 1, position: 'relative' }} className="col-1 ">
                              <i
                                className="fas fa-circle float-right"
                                style={{ fontSize: 10, color: 'blue', position: 'absolute', top: '46%', left: '60%' }}
                              ></i>
                            </div>

                            {/* <span className="float-right text-muted text-sm">3 mins</span> */}
                          </Link>
                        )
                      }
                      return (
                        <Link
                          to={this.handleRouterOnNotification(item)}
                          className="dropdown-item d-flex row pr-1"
                          key={index}
                          onClick={() => {
                            document.getElementById('notification').classList.remove('show')
                          }}
                        >
                          <div className="col-1">
                            <i className="fas fa-envelope mr-2" />
                          </div>
                          <div className="col-11 pr-0">
                            <p>
                              <strong>{item.title}</strong>
                            </p>
                            <p className="text-sm">{item.content}</p>
                          </div>
                          {/* <i className="fas fa-dot-circle" style={{ color: 'blue' }}></i> */}
                          {/* <span className="float-right text-muted text-sm">3 mins</span> */}
                        </Link>
                      )
                    })
                  : ''}

                {isLoadMore && (
                  <div className="py-1" style={{ textAlign: 'center' }}>
                    <Spin indicator={antIcon} />
                  </div>
                )}
                <div className="dropdown-divider" />
                {/* <a href="#" className="dropdown-item dropdown-footer">
                  See All Notifications
                </a> */}
              </div>
            </li>

            {/* account */}
            <li className="nav-item dropdown">
              <div data-toggle="dropdown">
                <a className="nav-link " href="thong-bao">
                  <i className="far fa-user icon--bell" style={{ fontSize: 16 }}></i>
                </a>
              </div>
              <div className="dropdown-menu dropdown-menu-lg dropdown-menu-right m-2" style={{ minWidth: 200 }}>
                <a
                  className="dropdown-item cursor menu-hover"
                  href=""
                  onClick={(e) => {
                    e.preventDefault()
                    this.setShowModal(true)
                  }}
                >
                  <div className="dropdown--admin__item row">
                    <i className="fas fa-key ml-3 mr-2 header--menu__icon" />
                    <p className="me-txt-admin-drop">{STRING.changePassWord}</p>
                  </div>
                </a>
                <div className="dropdown-item cursor menu-hover" onClick={this.logout}>
                  <div className="dropdown--admin__item row">
                    <i className="fas fa-sign-out-alt ml-3 mr-2 header--menu__icon" />
                    <p className="me-txt-admin-drop">{STRING.logOut}</p>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </nav>
      </>
    )
  }
}

const mapStateToProps = (state) => ({
  listOverViewState: state.overViewReducer,
  // getListNotificationState: state.getListNotificationState,
})

const mapDispatchToProps = {
  getListOverView,
  // getListNotification,
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Header))
