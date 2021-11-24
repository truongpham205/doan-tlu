import React, { PureComponent, Component } from 'react'
import { withRouter, Link } from 'react-router-dom'
import { STRING, ROUTER, ROLE, CHAT_STATUS } from 'constants/Constant'
import 'styles/SideBar.css'
import './SideBar.css'
import 'styles/UserScreen.css'
import { login } from 'redux/actions'
import { connect } from 'react-redux'
import logo from 'assets/hcn_Oho.png'
import Cookie from 'js-cookie'
import SideBarItem from './SideBarItem'
import { getUserInfo } from 'constants/Api'
import socketIOClient from 'socket.io-client'
import playSound from 'utils/notification_sound'
import { notifyFail, notifySuccess } from 'utils/notify'
import Fire, { SALE_NAME, SALE_PHONE, SALE_AVATAR, TIME, THREAD_ID } from 'utils/FirebaseConfig'
// import reactotron from 'reactotron-react-js'

class Sidebar extends Component {
  constructor(props) {
    super(props)
    this.state = {
      width: window.innerWidth,
      height: window.innerHeight,
      show: false,
      isLoading: true,
      data: {},
      rem: true,
      userInfo: JSON.parse(localStorage.getItem('userInfo')),
    }
    this.notificationTimeoutRef = React.createRef()
  }

  updateDimensions = () => {
    this.setState({ width: window.innerWidth, height: window.innerHeight })
  }

  componentDidMount() {
    const { userInfo } = this.state
    window.addEventListener('resize', this.updateDimensions)
    if (userInfo?.role_id !== ROLE.PROVIDER) {
      this.listenSocket()
      this.setupBeforeUnloadListener()
    }
  }

  listenSocket = () => {
    const { userInfo } = this.state
    var socket = socketIOClient(process.env.REACT_APP_SOCKET, {
      transports: ['websocket'],
    })
    socket.on('newOder', async (data) => {
      if (data?.type == CHAT_STATUS.CUSTOMER_CHAT) {
        this.receiveNotiToAdmin(data)
        return
      }

      if (userInfo?.role?.id === ROLE.SALE_LEADER && data?.type == CHAT_STATUS.CUSTOMER_CHAT_TO_SALE) {
        this.receiveNotiToSaleLeader(data)
        return
      }

      //when receive newOrder
      if (data?.type == CHAT_STATUS.NEW_ORDER) {
        notifySuccess(data.content)
        playSound()
        const element = document.querySelectorAll('.Toastify')
        element.forEach((el) =>
          el.addEventListener('click', (event) => {
            !this.props.history.location.pathname.includes(ROUTER.ORDER_BOOK_ROOM) &&
              this.props.history.push(ROUTER.ORDER_BOOK_ROOM)
          })
        )
        return
      }
      if (
        data?.type == CHAT_STATUS.DEPOSIT_CUSTOMER ||
        data?.type == CHAT_STATUS.PAYMENT_CUSTOMER ||
        data?.type == CHAT_STATUS.REQUIRED_DEPOSIT
      ) {
        notifySuccess(data.content)
        playSound()
        const element = document.querySelectorAll('.Toastify')
        element.forEach((el) =>
          el.addEventListener('click', (event) => {
            !this.props.history.location.pathname.includes(ROUTER.ORDER_DETAIL_BOOK_ROOM) &&
              this.props.history.push(`${ROUTER.ORDER_DETAIL_BOOK_ROOM}/${data.order_id}`)
          })
        )
        return
      }
      //when saleLeader is assiged
      if (data?.type == CHAT_STATUS.SALE_LEADER_CONFIRMED && data?.sale_id == userInfo?.id) {
        notifySuccess('Bạn được Admin chỉ định!')
        playSound()
      }
    })
  }

  receiveNotiToAdmin = (data) => {
    notifySuccess(data.content)
    playSound()
    if (window.location?.pathname !== ROUTER.CHAT_SYSTEM) {
      if (this.notificationTimeoutRef.current) {
        clearTimeout(this.notificationTimeoutRef.current)
      }

      this.notificationTimeoutRef.current = setTimeout(() => {
        localStorage.setItem('notiToAdmin', 'true')
        const element = document.querySelectorAll('.Toastify')
        element.forEach((el) =>
          el.addEventListener('click', (event) => {
            localStorage.removeItem('notiToAdmin')
            this.props.history.push(ROUTER.CHAT_SYSTEM)
          })
        )
        this.setState({
          rem: !this.state.rem,
        })
      }, 150)
    }
  }

  receiveNotiToSaleLeader = (data) => {
    notifySuccess(data.content)
    playSound()

    if (window.location?.pathname !== ROUTER.CHAT_SUPPORT) {
      if (this.notificationTimeoutRef.current) {
        clearTimeout(this.notificationTimeoutRef.current)
      }

      this.notificationTimeoutRef.current = setTimeout(() => {
        localStorage.setItem('notiToSaleLeader', 'true')
        const element = document.querySelectorAll('.Toastify')
        element.forEach((el) =>
          el.addEventListener('click', (event) => {
            localStorage.removeItem('notiToSaleLeader')
            this.props.history.push(ROUTER.CHAT_SUPPORT)
          })
        )
        this.setState({
          rem: !this.state.rem,
        })
      }, 150)
    }
  }

  doSomethingBeforeUnload = async () => {
    const { userInfo } = this.state
    const currentUser = {
      keyChat: userInfo?.key_chat_admin,
    }
    await Fire.shared.resetFocus(currentUser, () => {})
    // localStorage.clear()
  }

  setupBeforeUnloadListener = () => {
    window.addEventListener('beforeunload', (ev) => {
      ev.preventDefault()
      return this.doSomethingBeforeUnload()
    })
  }

  handleRouter = (path) => {
    const { userInfo } = this.state
    const currentUser = {
      keyChat: userInfo?.key_chat_admin,
    }
    Fire.shared.resetFocus(currentUser, () => {})
    if (path === ROUTER.CHAT_SYSTEM) {
      localStorage.removeItem('notiToAdmin')
    }
    if (path === ROUTER.CHAT_SUPPORT) {
      localStorage.removeItem('notiToSaleLeader')
    }

    this.props.history.push(`${path}`)
  }

  render() {
    const { userInfo } = this.state
    let listItem = []
    if (userInfo?.role_id === ROLE.PROVIDER) {
      listItem = [
        {
          subMenu: [],
          route: ROUTER.ORDER_PROVIDER,
          name: 'Đơn hàng',
          icon: 'nav-icon fas fa-shopping-cart',
          getAccess: true,
        },
        {
          subMenu: [],
          route: ROUTER.ACCOUNT_PROVIDER,
          name: 'Tài khoản',
          icon: 'nav-icon fas fa-user-circle',
          getAccess: userInfo?.provider_info.parent_id === null,
        },
      ]
    } else {
      let isLoadingAction = this.props.overViewState.isLoading
      let overViewState
      if (!isLoadingAction) {
        overViewState = this.props.overViewState.data?.data
      }
      listItem = [
        {
          subMenu: [],
          route: ROUTER.OVERVIEW,
          name: STRING.overView,
          icon: 'nav-icon fas fa-tachometer-alt',
          getAccess: true,
        },
        {
          subMenu: [],
          route: ROUTER.USER,
          name: STRING.customer,
          icon: 'nav-icon fas fa-copy',
          getAccess: true,
        },
        {
          subMenu: [],
          route: ROUTER.SUPPLIER,
          name: STRING.supplier,
          icon: 'nav-icon fas fa-user-tag',
          getAccess: true,
        },

        {
          subMenu: [],
          route: ROUTER.SALE,
          name: STRING.sale,
          icon: 'nav-icon fas fa-copy',
          getAccess: true,
        },
        {
          subMenu: [],
          route: ROUTER.SUPPLIER_TYPE,
          name: STRING.supplierTypeFull,
          icon: 'nav-icon fas fa-home',
          getAccess: true,
        },
        {
          subMenu: [
            {
              route: ROUTER.ORDER_BOOK_ROOM,
              name: 'Đơn đặt phòng',
              icon: 'nav-icon fas fa-warehouse me-sub-menu-item',
              getAccess: true,
              badge: overViewState?.not_assigned,
            },
            {
              route: ROUTER.ORDER_BOOK_TOUR,
              name: 'Đơn đặt tour',
              icon: 'nav-icon fas fa-truck me-sub-menu-item',
              getAccess: true,
              badge: overViewState?.not_assigned_tour,
            },
          ],
          name: STRING.order,
          mainIcon: 'nav-icon fas fa-shopping-cart',
          icon: 'fas fa-caret-down right',
          getAccess: true,
          badge: (overViewState?.not_assigned || 0) + (overViewState?.not_assigned_tour || 0),
        },

        {
          subMenu: [],
          route: ROUTER.ROOM_TYPE,
          name: STRING.roomType,
          icon: 'nav-icon fas fa-copy',
          getAccess: true,
        },
        {
          subMenu: [],
          route: ROUTER.ROOM,
          name: STRING.room,
          icon: 'nav-icon fas fa-bed',
          getAccess: true,
        },
        {
          subMenu: [],
          route: ROUTER.TOUR,
          name: STRING.tour,
          icon: 'nav-icon fas fa-copy',
          getAccess: true,
        },
        {
          subMenu: [],
          route: ROUTER.ACCUMULATION_HISTORY,
          name: STRING.accumulationHistory,
          icon: 'nav-icon fas fa-history',
          getAccess: true,
        },
        {
          subMenu: [
            {
              route: ROUTER.SETTLEMENT_SALE,
              name: STRING.settlementSale,
              icon: 'nav-icon fas fa-copy',
              getAccess: userInfo?.role_id === ROLE.ADMIN,
            },
            {
              route: ROUTER.SETTLEMENT_PROVIDER,
              name: 'Quyết toán Provider',
              icon: 'nav-icon fas fa-copy',
              getAccess: userInfo?.role_id === ROLE.ADMIN,
            },
          ],
          name: 'Quyết toán',
          mainIcon: 'nav-icon fas fa-money-check-alt',
          icon: 'fas fa-caret-down right',
          getAccess: true,
        },

        {
          subMenu: [
            {
              route: ROUTER.PROVIDER_LIST,
              name: STRING.providerList,
              icon: 'nav-icon fas fa-truck me-sub-menu-item',
              getAccess: true,
            },
          ],
          name: STRING.statistical,
          mainIcon: 'nav-icon fas fa-money-check-alt',
          icon: 'fas fa-caret-down right',
          getAccess: true,
        },

        {
          subMenu: [],
          route: ROUTER.NEWS,
          name: STRING.news,
          icon: 'nav-icon fas fa-newspaper',
          getAccess: true,
        },
        {
          subMenu: [],
          route: ROUTER.BANK_CONFIG,
          name: 'Cấu hình ngân hàng',
          icon: 'fas  nav-icon fa-university',
          getAccess: userInfo?.role_id === ROLE.ADMIN,
        },
        {
          subMenu: [],
          route: ROUTER.CONFIG,
          name: STRING.config,
          icon: 'fas nav-icon fa-sliders-h',
          getAccess: userInfo?.role_id === ROLE.ADMIN,
        },
        {
          subMenu: [],
          route: ROUTER.CHAT_SUPPORT,
          name: STRING.chatSupport,
          icon: 'nav-icon fab fa-facebook-messenger',
          getAccess: true,
          badge: localStorage.getItem('notiToSaleLeader'),
          isChat: true,
        },
        {
          subMenu: [],
          route: ROUTER.CHAT_SYSTEM,
          name: STRING.chatSystem,
          icon: 'nav-icon fab fa-facebook-messenger',
          getAccess: true,
          badge: localStorage.getItem('notiToAdmin'),
          isChat: true,
        },
        {
          subMenu: [],
          route: ROUTER.ACCOUNT,
          name: STRING.account,
          icon: 'nav-icon fas fa-user-circle',
          getAccess: userInfo?.role_id === ROLE.ADMIN,
        },
      ]
    }

    const { isLoading, data } = this.state
    const pathName = window.location.pathname
    return (
      <aside className="main-sidebar sidebar-dark-primary elevation-4 me-sidebar">
        <a className="brand-link" href="#">
          <img
            src={logo}
            className="brand-image"
            data-auto-collapse-size="768"
            alt="img_logo"
            style={{ opacity: '1' }}
          />
          <span className="brand-text font-weight-light" style={{ visibility: 'hidden', opacity: 0 }}>
            ồ hố
          </span>
          <i className="nav-icon fas fa-bars me-delete" data-widget={this.state.width < 990 && 'pushmenu'}></i>
        </a>

        <div className="sidebar">
          <nav className="mt-2 float-left" style={{ width: '100%' }}>
            <ul
              className="nav nav-pills nav-sidebar flex-column mb-5"
              data-widget="treeview"
              role="menu"
              data-accordion="false"
            >
              <SideBarItem
                listRouter={listItem}
                pathName={pathName}
                width={this.state.width}
                action={this.handleRouter}
              />
            </ul>
          </nav>
        </div>
      </aside>
    )
  }
}

const mapStateToProps = (state) => ({
  loginState: state.loginReducer,
  chatState: state.chatReducer,
  overViewState: state.overViewReducer,
})

const mapDispatchToProps = {
  login,
}
export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Sidebar))
