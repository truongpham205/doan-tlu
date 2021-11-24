import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { ROUTER, STATUS, STRING } from '@constants/Constant'
import { Navbar, Nav, Modal, Col, Row, FormControl, Button } from 'react-bootstrap'
// import * as API from '@constants/Api'
import Cookie from 'js-cookie'
import '@styles/NavBar.css'
import logo from '@src/assets/job2.png'
import Loading from 'src/components/Loading'
import swal from 'sweetalert'
import reactotron from 'src/debug/ReactotronConfig'

export default class NavBar extends Component {
  constructor(props) {
    super(props)
    this.state = {
      pathName: true,
      modalChangePass: false,
      openListJob: false,
      listJobApply: [],
      modal: {
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      },
    }
  }
  componentDidMount() {
    let token = Cookie.get('SESSION_ID_APPLICANT')
    token && this.getListApply()
  }

  // async getListApply() {
  //   const res = await API.getListApply({})
  //   this.setState({
  //     listJobApply: res.data,
  //   })
  // }

  // setShow = async () => {}

  // async saveAndChangePass() {
  //   const { currentPassword, newPassword, confirmNewPassword } = this.state.modal
  //   if (newPassword === confirmNewPassword) {
  //     this.setState({
  //       loadingAction: true,
  //     })
  //     try {
  //       const res = await API.changePassword({
  //         oldPassword: currentPassword,
  //         newPassword: newPassword,
  //       })
  //       if (res.status === STATUS.ACTIVE) {
  //         this.setState(
  //           {
  //             modalChangePass: false,
  //             loadingAction: false,
  //           },
  //           () =>
  //             swal({
  //               title: 'Đổi Mật khẩu thành công',
  //               icon: 'success',
  //             })
  //         )
  //       }
  //     } catch (error) {
  //       this.setState({
  //         loadingAction: false,
  //         error: error,
  //       })
  //     }
  //   } else {
  //     swal({
  //       title: 'Vui lòng kiểm tra lại mật khẩu',
  //       icon: 'warning',
  //     })
  //   }
  // }

  logout() {
    Cookie.remove('SESSION_ID_APPLICANT')
    window.location.href = ROUTER.LOGIN_APPLICANT
  }
  checkValueEmpty = () => {
    const { currentPassword, newPassword, confirmNewPassword } = this.state.modal
    if (currentPassword === '' || newPassword === '' || confirmNewPassword === '') {
      return true
    }
    return false
  }

  changePassword = () => {
    const { modalChangePass } = this.state
    return (
      <Modal
        show={modalChangePass}
        onHide={() => this.setState({ modalChangePass: false })}
        dialogClassName="modal-90w"
        centered
      >
        <Modal.Header closeButton>
          <h5>Đổi mật khẩu</h5>
        </Modal.Header>
        <Modal.Body className="custom-body">
          <Row>
            <Col className="modal-field" sm={4}>
              <span>Nhập {STRING.password}</span>
            </Col>
            <Col sm={8}>
              <FormControl
                type="password"
                id="oldPassword"
                maxLength={20}
                onChange={(e) => {
                  this.setState({
                    ...this.state,
                    modal: {
                      ...this.state.modal,
                      currentPassword: e.target.value,
                    },
                  })
                }}
                value={this.state.modal.currentPassword}
              />
            </Col>
          </Row>

          <Row className="my-3">
            <Col className="modal-field" sm={4}>
              <span>Nhập mật khẩu mới</span>
            </Col>
            <Col sm={8}>
              <FormControl
                maxLength={20}
                type="password"
                onChange={(e) => {
                  this.setState({
                    ...this.state,
                    modal: {
                      ...this.state.modal,
                      newPassword: e.target.value,
                    },
                  })
                }}
                value={this.state.modal.newPassword}
              />
            </Col>
          </Row>
          <Row className="my-3">
            <Col className="modal-field" sm={4}>
              <span style={{ justifyContent: 'center' }}>Xác nhận mật khẩu</span>
            </Col>
            <Col sm={8}>
              <FormControl
                maxLength={20}
                type="password"
                onChange={(e) => {
                  this.setState({
                    ...this.state,
                    modal: {
                      ...this.state.modal,
                      confirmNewPassword: e.target.value,
                    },
                  })
                }}
                value={this.state.modal.confirmNewPassword}
              />
            </Col>
          </Row>
          <Row sm={4} style={{ justifyContent: 'center', marginLeft: 30 }}>
            <Button variant="success" onClick={() => this.saveAndChangePass()} disabled={this.checkValueEmpty()}>
              Lưu
            </Button>
          </Row>
        </Modal.Body>
      </Modal>
    )
  }

  renderListJobApply() {
    const { listJobApply, openListJob } = this.state
    reactotron.log('1', listJobApply)
    return (
      <Modal
        show={openListJob}
        onHide={() => this.setState({ openListJob: false })}
        dialogClassName="modal-90w"
        centered
        aria-labelledby="example-custom-modal-styling-title"
        size="lg"
      >
        <Modal.Header closeButton>
          <h5>Danh sách công việc đã apply</h5>
        </Modal.Header>
        <Modal.Body className="custom-body">
          {listJobApply?.map((item, index) => (
            <>
              <div className="search-result">
                <div className="result-job-hover pb-4">
                  <div className="row job">
                    <div className="col-sm-2" style={{ textAlign: 'center' }}>
                      <a className="company-logo col-avatar">
                        <img
                          src={item?.job?.company?.company_image || ''}
                          alt="logo"
                          style={{ objectFit: 'contain' }}
                        />
                      </a>
                    </div>
                    <div className="col-sm-9 mx-3 mt-2">
                      <h4 className="job-title">
                        <a>
                          <span style={{ fontWeight: 500 }} className="transform-job-title">
                            {item?.job?.name}
                          </span>
                        </a>
                      </h4>
                      <div className="row-company">
                        <a>{item?.job?.company?.name || '--'}</a>
                      </div>
                      <div className="row text-gray" id="row-result-info-job">
                        <div className="salary col-sm-4 col-xs-6">
                          Lương:
                          <span className="text-highlight">
                            {item?.job?.min_salary && item.job.max_salary
                              ? item?.job?.min_salary + ' - ' + item?.job?.max_salary + 'triệu'
                              : item?.job?.min_salary && !item?.job?.max_salary
                              ? ' Từ ' + item?.job?.min_salary
                              : !item?.job?.min_salary && item.job.max_salary
                              ? ' Đến ' + item?.job?.max_salary
                              : ' Thỏa thuận'}
                          </span>
                        </div>
                        <div className="col-sm-4 col-xs-6 text_ellipsis">
                          <span className="address">Địa chỉ: {item?.job?.company?.address || '--'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <hr className="m-0 p-0" />
            </>
          ))}
        </Modal.Body>
      </Modal>
    )
  }

  render() {
    const { loadingAction, user_info } = this.state
    const pathName = window.location.pathname
    return (
      <>
        {loadingAction && <Loading />}
        {this.changePassword()}
        {this.renderListJobApply()}
        <div className="container mr-0 p-0">
          <Navbar collapseOnSelect expand="lg" className="my-0 py-0">
            <Navbar.Brand href={ROUTER.SEARCH_JOB}>
              <div className="row">
                <img src={logo} alt="logo" width="50" height="45" />
                <Nav.Link>
                  <h5 className="pt-1">Job Share</h5>
                </Nav.Link>
              </div>
            </Navbar.Brand>
            <Navbar.Toggle
              aria-controls="responsive-navbar-nav-login"
              style={{ border: 'none', backgroundColor: '#21303F' }}
            />
            <Navbar.Collapse id="responsive-navbar-nav" className="my-0 py-0">
              <Nav className="mr-auto"></Nav>
              <Nav>
                {/* <Nav.Link
                  href={ROUTER.FAST_JOB}
                  className={pathName.search(ROUTER.FAST_JOB) !== -1 ? 'active-applicant' : ''}
                >
                  <a className="nav-text-login" style={{ fontWeight: 600 }}>
                    Có việc siêu tốc
                  </a>
                </Nav.Link> */}
                <Nav.Link
                  href={ROUTER.SEARCH_JOB}
                  className={pathName.search(ROUTER.SEARCH_JOB) !== -1 ? 'active-applicant' : ''}
                >
                  <a className="nav-text-login" style={{ fontWeight: 600 }}>
                    Tìm việc làm
                  </a>
                </Nav.Link>
                {Cookie.get('SESSION_ID_APPLICANT') && (
                  <Nav.Link
                    href={ROUTER.MANAGER_CV}
                    className={pathName.search(ROUTER.MANAGER_CV) !== -1 ? 'active-applicant' : ''}
                  >
                    <a className="nav-text-login" style={{ fontWeight: 600 }}>
                      Quản lý CV
                    </a>
                  </Nav.Link>
                )}
                <Nav.Link
                  href={ROUTER.COMPANY_SHOW}
                  className={pathName.search(ROUTER.COMPANY_SHOW) !== -1 ? 'active-applicant' : ''}
                >
                  <a className="nav-text-login" style={{ fontWeight: 600 }}>
                    Công ty
                  </a>
                </Nav.Link>
                {Cookie.get('SESSION_ID_APPLICANT') ? (
                  <Nav.Link href="" className="dropdown">
                    <a className="nav-text-login" data-toggle="dropdown" style={{ fontWeight: 600 }}>
                      <i className="far fa-user mr-1" />
                      {this.props.user_info || 'Tài khoản'}
                    </a>
                    <div className="dropdown-menu dropdown-menu-right">
                      <a
                        className="dropdown-item cursor drop--menu__hover"
                        onClick={() =>
                          this.setState(
                            {
                              openListJob: true,
                            },
                            () => this.getListApply()
                          )
                        }
                      >
                        <p className="menu--item__text my-1">Việc làm đã apply</p>
                      </a>
                      <a
                        className="dropdown-item cursor drop--menu__hover"
                        onClick={() =>
                          this.setState({
                            modalChangePass: true,
                          })
                        }
                      >
                        <p className="menu--item__text my-1">Đổi mật khẩu</p>
                      </a>
                      <a className="dropdown-item cursor drop--menu__hover" onClick={this.logout}>
                        <p className="menu--item__text my-1">Đăng xuất</p>
                      </a>
                    </div>
                  </Nav.Link>
                ) : (
                  <Nav.Link
                    href={ROUTER.LOGIN_APPLICANT}
                    className={pathName.search(ROUTER.LOGIN_APPLICANT) !== -1 ? 'active-applicant' : ''}
                  >
                    <a className="nav-text-login" style={{ fontWeight: 600 }}>
                      Đăng nhập
                    </a>
                  </Nav.Link>
                )}
              </Nav>
              <a href={ROUTER.RECRUITMENT} className="navbar-header__end ml-3" style={{ textDecoration: 'none' }}>
                <div style={{ cursor: 'pointer' }}>
                  <div className="col pt-2">
                    <strong style={{ textTransform: 'uppercase' }}>Nhà tuyển dụng</strong>
                    <p>Tìm ứng viên ngay</p>
                  </div>
                </div>
              </a>
            </Navbar.Collapse>
          </Navbar>
        </div>
      </>
    )
  }
}
