import React, { Component } from 'react'
import { Row, Col, FormControl, Button } from 'react-bootstrap'
import {
  STRING,
  STATUS,
  ROUTER,
  NUMBER,
  LABEL_BUTTON_SEARCH,
  LABEL_BUTTON_CLEAR_SEARCH,
  ORDER_STATUS,
  TYPE_INPUT,
  ORDER_STATUS_LIST,
  PAYMENT_STATUS,
  PAYMENT_TYPE,
  PAYMENT_STATUS_LIST,
  ROLE,
  CHAT_STATUS,
} from 'constants/Constant'
import DatePickerCustom from 'components/DatePickerCustom'
import ConfirmModal from 'components/ConfirmModal'
import HeaderPage from 'components/HeaderPage'
import Footer from 'components/Footer'
import { connect } from 'react-redux'
import * as OrderApi from 'network/OrderApi'
import * as FilterApi from 'network/FilterApi'
import * as SaleApi from 'network/SaleApi'
import SelectField from 'components/SelectField'
import ButtonType from 'components/ButtonType'
import PaginationComponent from 'components/PaginationComponent'
import ScreenWrapper from 'components/ScreenWrapper'
import ModalComponent from 'components/ModalComponent'
import 'styles/UserScreen.css'
import './style.css'
import Select from 'react-select'
import { Empty, Table, Pagination } from 'antd'
import { getListAccount } from 'constants/Api'
import { getListOverView } from 'redux/actions'
import { toDateString, getDateForSearch } from 'utils/helper'
import { withRouter, Link } from 'react-router-dom'
import formatMoney from 'utils/formatMoney'
import { notifyFail, notifySuccess } from 'utils/notify'
import socketIOClient from 'socket.io-client'
import { handleOrderStatus, handlePaymentStatus } from 'utils/order'
class OrderBookTourListScreen extends Component {
  constructor(props) {
    super(props)
    const orderStatus = props.location?.state?.status
    this.state = {
      [STRING.checkInDate]: '',
      [STRING.checkOutDate]: '',
      [STRING.bookingDate]: '',
      conFirmModal: false,
      activePage: 1,
      search: '',
      provinceId: '',
      listProvince: [],
      saleId: '',
      saleLeaderId: '',
      listSale: [],
      listSaleLeader: [],
      listOrder: [],
      isLoading: false,
      isError: false,
      status: '',
      checkAll: false,
      orderStatus: '',
      paymentStatus: '',
      paging: {},
      accountInfo: JSON.parse(localStorage.getItem('userInfo')),
      tableHeader: [
        {
          header: STRING.numericalOrder,
        },
        {
          header: STRING.orderCode,
        },
        {
          header: STRING.departmentName,
        },
        {
          header: 'Mã căn hộ',
        },
        {
          header: STRING.area,
        },
        {
          header: STRING.customer,
        },
        {
          header: STRING.numberPeople,
        },
        {
          header: STRING.checkInOut,
        },
        {
          header: STRING.responsibleLead,
        },
        {
          header: STRING.responsibleSale,
        },
        {
          header: STRING.moneySum,
        },
        {
          header: STRING.paymentStatus,
        },
        {
          header: STRING.orderStatus,
        },
        {
          header: STRING.bookingDate,
        },
      ],
      paging: {
        total: 0,
        current: 1,
        pageSize: 0,
      },
    }
  }

  componentDidMount() {
    this.listenSocket()
    if (this.props.location?.state?.status) {
      this.setState(
        {
          ...this.state,
          status: this.props.location?.state.status,
        },
        () => this.getData()
      )
    } else {
      this.getData()
    }
    this.getListProvince()
    this.getListSale()
    const { accountInfo } = this.state
    if (accountInfo.role.id === ROLE.ADMIN) {
      this.getListSaleLeader()
    }
  }

  listenSocket = () => {
    var socket = socketIOClient(process.env.REACT_APP_SOCKET, {
      transports: ['websocket'],
    })
    socket.on('newOder', (data) => {
      if (data?.type == CHAT_STATUS.NEW_ORDER) {
        this.getData()
        this.props.getListOverView()
      }
    })
  }

  getData = async () => {
    const {
      search,
      status,
      activePage,
      [STRING.checkInDate]: checkInDate,
      [STRING.checkOutDate]: checkOutDate,
      [STRING.bookingDate]: bookingDate,
      provinceId,
      saleId,
      saleLeaderId,
      paging,
      paymentStatus,
    } = this.state

    this.setState({ isLoading: true })

    try {
      const payload = {
        search,
        checkin_at: checkInDate ? getDateForSearch(checkInDate) : '',
        checkout_at: checkOutDate ? getDateForSearch(checkOutDate) : '',
        created_at: bookingDate ? getDateForSearch(bookingDate) : '',
        province_id: provinceId?.value,
        page: paging?.current || 1,
        status,
        sale_id: saleId,
        sale_leader_id: saleLeaderId,
        payment_status: paymentStatus,
        is_tour: 1,
      }
      const listOrderApi = await OrderApi.getListOrderBookRoom(payload)
      this.setState({
        ...this.state,
        listOrder: listOrderApi.data.map((order, index) => {
          // order.isSelected = false
          const newOrder = {}
          newOrder.sale_leader_name = `${order?.sale_leader?.full_name || '--'} (${order?.sale_leader?.phone || '--'})`
          newOrder.sale_name = `${order?.sale?.full_name || '--'} (${order?.sale?.phone || '--'})`
          newOrder.number_of_people = (order.adult || 0) + (order.children || 0)
          newOrder.customer_name = `${order.customer_name} (${order.customer_phone})`
          newOrder.created_at = toDateString(order?.created_at) || '--'
          newOrder.price = formatMoney(order.price) || STRING.notUpdate
          newOrder.payment_status = handlePaymentStatus(order?.payment_status)
          newOrder.status = handleOrderStatus(order?.status)
          newOrder.check_in_or_check_out =
            `${toDateString(order?.checkin_at) || '--'} - ${toDateString(order?.checkout_at) || '--'}` || '--'
          newOrder.key = index + NUMBER.page_limit * (listOrderApi.paging.page - 1) + 1
          newOrder.code = order.code
          newOrder.region_name = order.region_name
          newOrder.service_code = order.service_code
          newOrder.service_name = order.service_name
          newOrder.id = order.id
          return newOrder
        }),
        paging: {
          total: listOrderApi.paging?.count,
          current: listOrderApi.paging?.page,
          pageSize: listOrderApi.paging?.limit,
        },
        isLoading: false,
        isError: false,
        changeOrderStatus: false,
      })
    } catch (error) {
      this.setState({
        ...this.state,
        isLoading: false,
        isError: true,
      })
      console.log(error)
    }
  }

  getListSale = async () => {
    try {
      const listSaleApi = await SaleApi.getListSale()
      this.setState({
        listSale: listSaleApi.data,
      })
    } catch (error) {
      console.log(error)
    }
  }

  getListSaleLeader = async () => {
    try {
      const listLeadSaleApi = await FilterApi.getListLeadSale()
      this.setState({
        ...this.state,
        listSaleLeader: listLeadSaleApi.data,
      })
    } catch (error) {
      console.log(error)
    }
  }

  getListProvince = async () => {
    try {
      const listProvince = await FilterApi.getListProvince()
      let options = listProvince.data.map((province) => ({ value: province.id, label: province.name }))
      this.setState({
        ...this.state,
        listProvince: options,
      })
    } catch (error) {
      console.log(error)
    }
  }

  search = () => {
    const { paging } = this.state
    this.setState(
      {
        isLoading: true,
        paging: {
          ...paging,
          current: 1,
        },
      },
      () => this.getData()
    )
  }

  clearSearch = () => {
    if (this.props.location.state) {
      let state = { ...this.props.location.state }
      delete state.status
      this.props.history.replace({ ...this.props.location, state })
    }
    this.setState(
      {
        ...this.state,
        search: '',
        [STRING.checkInDate]: '',
        [STRING.checkOutDate]: '',
        [STRING.bookingDate]: '',
        status: '',
        saleId: '',
        saleLeaderId: '',
        provinceId: '',
        isLoading: true,
      },
      () => this.getData()
    )
  }

  changeOrderStatus = async () => {
    let { check, listOrder, orderStatus } = this.state
    let listOrder_id = []

    check.forEach((item, index) => {
      if (item) {
        listOrder_id.push(listOrder[index].id)
      }
    })

    if (!listOrder_id.length) {
      notifyFail('Vui lòng chọn phần tử để thay đổi trạng thái!')
      return
    }

    this.setState({
      isLoading: true,
    })

    const payload = {
      status: orderStatus ? parseInt(orderStatus) : '',
      id: listOrder_id,
    }

    try {
      // await OrderApi.changeOrderStatus(payload)
      notifySuccess(STRING.Success)
      //call API getListOverView to update change to bagde in sideBar
      this.props.getListOverView()
      this.getData()
    } catch (error) {
      this.setState({
        isLoading: false,
      })
      console.log(error)
      notifyFail(STRING.Fail)
    }
  }

  checkValidateValue = () => {
    const { orderStatus } = this.state
    if (orderStatus) {
      return false
    }
    return true
  }

  handleGetDetail = (id) => {
    this.props.history.push(ROUTER.ORDER_DETAIL_BOOK_TOUR + '/' + id)
  }

  handleInputModal = (fieldName, value) => {
    this.setState({
      ...this.state,
      [fieldName]: value || '',
    })
  }

  handleChange = (fieldName, value) => {
    this.setState({
      ...this.state,
      [fieldName]: value || '',
    })
  }

  handleChangeSelect = (fieldName, value) => {
    const { paging } = this.state
    this.setState(
      {
        ...this.state,
        [fieldName]: value || '',
        isLoading: true,
        paging: {
          ...paging,
          current: 1,
        },
      },
      () => this.getData()
    )
  }

  handleChangePage = (page) => {
    const { paging } = this.state
    this.setState(
      {
        paging: {
          ...paging,
          current: 1,
        },
        isLoading: true,
      },
      () => this.getData()
    )
  }

  handleKeyPress = (e) => {
    if (e.charCode === 13) {
      this.search()
    }
  }

  handleCheckAll = () => {
    const { checkAll, check } = this.state
    let newCheck = [...check]
    newCheck.fill(!checkAll)
    this.setState({
      ...this.state,
      checkAll: !checkAll,
      check: newCheck,
    })
  }

  countNumberOfElementIsChecked = (arrCheck) => {
    return arrCheck.filter((item) => item).length
  }

  renderHeader = () => {
    return (
      <HeaderPage
        titleHeader={STRING.orderBookTour}
        titleButton={STRING.addOrder}
        onClickButton={() => this.props.history.push(ROUTER.ADD_ORDER_BOOK_TOUR)}
      ></HeaderPage>
    )
  }

  renderField = () => {
    const {
      [STRING.checkInDate]: checkInDate,
      [STRING.checkOutDate]: checkOutDate,
      [STRING.bookingDate]: bookingDate,
      search,
      provinceId,
      status,
      listProvince,
      accountInfo,
      listSale,
      listSaleLeader,
      paymentStatus,
      saleLeaderId,
      saleId,
    } = this.state
    return (
      <>
        <Row className="mx-0">
          <Col md={6} lg={3} className="responsive__inputField">
            <input
              onKeyPress={this.handleKeyPress}
              type="text"
              className="form-control"
              autoComplete="off"
              placeholder="Nhập tên khách hàng, mã đơn, mã căn, tên căn"
              value={search}
              onChange={(e) => this.handleChange('search', e.target.value)}
            />
          </Col>
          <Col md={6} lg={3} className="responsive__inputField mb-2">
            <SelectField
              options={listProvince}
              placeholder={STRING.province}
              selectedOption={provinceId}
              valueName={'provinceId'}
              onSelectChange={this.handleChangeSelect}
            />
          </Col>
          <Col md={6} lg={3} className="responsive__inputField">
            <FormControl
              as="select"
              aria-describedby="basic-addon1"
              value={status}
              onChange={(e) => this.handleChangeSelect('status', e.target.value)}
            >
              <option value="" defaultValue disabled>
                {STRING.orderStatus}
              </option>
              {ORDER_STATUS_LIST?.map((orderStatus, index) => (
                <option value={orderStatus.id} key={index}>
                  {orderStatus.name}
                </option>
              ))}
            </FormControl>
          </Col>
          <Col md={6} lg={3} className="responsive__inputField">
            <FormControl
              as="select"
              aria-describedby="basic-addon1"
              value={paymentStatus}
              onChange={(e) => this.handleChangeSelect('paymentStatus', e.target.value)}
            >
              <option value="" defaultValue>
                {STRING.paymentStatus}
              </option>
              {PAYMENT_STATUS_LIST?.map((paymentStatus, index) => (
                <option value={paymentStatus.id} key={index}>
                  {paymentStatus.name}
                </option>
              ))}
            </FormControl>
          </Col>
          <Col md={6} lg={3} className="responsive__inputField">
            <DatePickerCustom
              className={`date-picker form-control`}
              dateFormat="dd/MM/yyyy"
              placeholderText={STRING.checkInDate}
              handleChange={this.handleChange}
              selected={checkInDate}
              maxDate={new Date(checkOutDate)}
            />
          </Col>
          <Col md={6} lg={3} className="responsive__inputField">
            <DatePickerCustom
              className={`date-picker form-control`}
              dateFormat="dd/MM/yyyy"
              placeholderText={STRING.checkOutDate}
              handleChange={this.handleChange}
              selected={checkOutDate}
              minDate={new Date(checkInDate)}
            />
          </Col>
          {accountInfo.role.id === ROLE.ADMIN ? (
            <Col md={6} lg={3} className="responsive__inputField">
              <FormControl
                as="select"
                aria-describedby="basic-addon1"
                value={saleLeaderId}
                onChange={(e) => this.handleChangeSelect('saleLeaderId', e.target.value)}
              >
                <option value="" defaultValue>
                  {STRING.saleLead}
                </option>
                {listSaleLeader?.map((saleLeader, index) => (
                  <option value={saleLeader.id} key={index}>
                    {saleLeader.full_name}
                  </option>
                ))}
              </FormControl>
            </Col>
          ) : (
            ''
          )}
          <Col md={6} lg={3} className="responsive__inputField">
            <FormControl
              as="select"
              aria-describedby="basic-addon1"
              value={saleId}
              onChange={(e) => this.handleChangeSelect('saleId', e.target.value)}
            >
              <option value="" defaultValue>
                {STRING.sale}
              </option>
              {listSale?.map((sale, index) => (
                <option value={sale.id} key={index}>
                  {sale.full_name}
                </option>
              ))}
            </FormControl>
          </Col>
        </Row>
      </>
    )
  }

  renderPagination = () => {
    const { isLoading, paging } = this.state
    if (!isLoading) {
      return (
        <>
          {paging?.count > NUMBER.page_limit && (
            <PaginationComponent
              activePage={this.state.activePage}
              itemCountPerPage={paging.limit}
              totalItemsCount={paging.count}
              action={this.handleChangePage}
            />
          )}
        </>
      )
    }
  }

  renderButton = () => {
    const { check } = this.state
    return (
      <Row className="px-0">
        <Col className="button-wrapper pr-2">
          <ButtonType typeButton={LABEL_BUTTON_SEARCH} isOpen={this.search} />
          <ButtonType typeButton={LABEL_BUTTON_CLEAR_SEARCH} style={{ marginRight: 6 }} isOpen={this.clearSearch} />
        </Col>
      </Row>
    )
  }

  renderBody = () => {
    const { orderStatus, changeOrderStatus, paging } = this.state

    const allField = [
      {
        type: TYPE_INPUT.select,
        titleName: STRING.status,
        valueName: 'orderStatus',
        value: orderStatus,
        list: ORDER_STATUS_LIST,
      },
    ]

    return (
      <div>
        <div className="box--shadow px-3 pt-3 pb-2">
          {this.renderField()}
          {this.renderButton()}
        </div>

        <ConfirmModal
          isOpen={this.state.conFirmModal}
          onHide={() =>
            this.setState({
              ...this.state,
              conFirmModal: false,
            })
          }
          title="xóa"
          action={() => alert('hello world!!!')}
        />
        <ModalComponent
          allField={allField}
          title={STRING.orderStatus}
          checkValidateValue={this.checkValidateValue()}
          handleInputModal={this.handleInputModal}
          isOpen={changeOrderStatus}
          addUpdate={this.changeOrderStatus}
          onHide={() =>
            this.setState({
              ...this.state,
              changeOrderStatus: false,
              orderStatus: '',
            })
          }
        />
        {/* <div className="mt-2 mx-1">
          <span>
            Kết quả lọc: <span style={{ fontWeight: 600 }}> {paging?.count || '--'}</span>
          </span>
        </div> */}
        {/* <div className="pt-4 pb-5 px-3 mt-4 table--shadow wrapper-order__list"> */}
        {this.renderTable()}
        {/* {this.renderPagination()}
        </div> */}
      </div>
    )
  }

  renderTable = () => {
    const { tableHeader, check, listOrder, isLoading, paging } = this.state
    const columns = [
      {
        title: STRING.numericalOrder,
        dataIndex: 'key',
      },
      {
        title: STRING.orderCode,
        dataIndex: 'code',
      },
      {
        title: STRING.departmentName,
        dataIndex: 'service_name',
      },
      {
        title: 'Mã căn hộ',
        dataIndex: 'service_code',
      },
      {
        title: STRING.area,
        dataIndex: 'region_name',
      },
      {
        title: STRING.customer,
        dataIndex: 'customer_name',
      },
      {
        title: STRING.numberPeople,
        dataIndex: 'number_of_people',
      },
      {
        title: STRING.checkInOut,
        dataIndex: 'check_in_or_check_out',
      },
      {
        title: STRING.responsibleLead,
        dataIndex: 'sale_leader_name',
      },
      {
        title: STRING.responsibleSale,
        dataIndex: 'sale_name',
      },
      {
        title: STRING.moneySum,
        dataIndex: 'price',
      },
      {
        title: STRING.paymentStatus,
        dataIndex: 'payment_status',
      },
      {
        title: STRING.orderStatus,
        dataIndex: 'status',
      },
      {
        title: STRING.bookingDate,
        dataIndex: 'created_at',
      },
    ]
    return (
      <div className="table--shadow pt-4  px-3 mt-4">
        <div
          style={{
            boxShadow: 'rgba(0, 0, 0, 0.05) 0px 0px 0px 1px',
          }}
        >
          <Table
            onRow={(record, rowIndex) => {
              return {
                onClick: (event) => {
                  this.handleGetDetail(record.id)
                }, // click row
              }
            }}
            style={{ cursor: 'pointer' }}
            bordered
            dataSource={listOrder || []}
            loading={isLoading}
            columns={columns}
            scroll={{ y: 450, x: 992 }}
            pagination={false}
          />
        </div>
        <div className="py-3">
          {paging.total > NUMBER.page_limit && (
            <Pagination
              defaultCurrent={paging.current || 1}
              total={paging.total}
              defaultPageSize={paging.pageSize}
              responsive={true}
              onChange={(page) => {
                this.setState(
                  {
                    paging: {
                      ...paging,
                      current: page,
                    },
                  },
                  () => this.getData()
                )
              }}
            />
          )}
        </div>
      </div>
    )
    // return (
    //   <>
    //     <Table striped responsive responsive-xl bordered style={{ transform: 'rotateX(180deg)' }}>
    //       <tr>
    //         {tableHeader?.map((item, index) =>
    //           item.header === 'checkbox' ? (
    //             <th>
    //               <input key={index} type="checkbox" className="cursor mt-3" checked={check.every(Boolean)} />
    //             </th>
    //           ) : (
    //             <th key={index}>{item.header}</th>
    //           )
    //         )}
    //       </tr>
    //       {this.renderTableData()}
    //     </Table>
    //   </>
    // )
  }

  renderTableData = () => {
    const { listOrder, check } = this.state
    return (
      <tbody>
        {listOrder?.length ? (
          listOrder?.map((value, index) => (
            <tr key={index}>
              <td onClick={() => this.handleGetDetail(value.id)}>
                {index + NUMBER.page_limit * (this.state.activePage - 1) + 1}
              </td>
              <td className="cursor" onClick={() => this.handleGetDetail(value.id)}>
                {value?.code || '--'}
              </td>
              <td className="cursor" style={{ whiteSpace: 'nowrap' }} onClick={() => this.handleGetDetail(value.id)}>
                {value?.service_name || '--'}
              </td>
              <td className="cursor" onClick={() => this.handleGetDetail(value.id)}>
                {value?.service_code || '--'}
              </td>
              <td className="cursor " onClick={() => this.handleGetDetail(value.id)}>
                {value?.region_name || '--'}
              </td>
              <td className="cursor" onClick={() => this.handleGetDetail(value.id)}>
                {value?.customer_name || '--'} <p>({value.customer_phone || '--'})</p>
              </td>
              <td className="cursor" onClick={() => this.handleGetDetail(value.id)}>
                {(value?.adult || 0) + ' người lớn' || '--'} <p>{(value?.children || 0) + ' trẻ nhỏ' || ''}</p>
              </td>
              <td className="cursor" onClick={() => this.handleGetDetail(value.id)}>
                {toDateString(value?.checkin_at) + ' - ' || '--'} <p>{toDateString(value?.checkout_at) || '--'}</p>
              </td>
              <td className="cursor" onClick={() => this.handleGetDetail(value.id)}>
                {value?.sale_leader?.full_name || '--'}
                {value?.sale?.full_name ? (
                  <>
                    <p>({value?.sale_leader?.phone || '--'})</p>
                  </>
                ) : (
                  ''
                )}
              </td>
              <td className="cursor" onClick={() => this.handleGetDetail(value.id)}>
                {value?.sale?.full_name || '--'}
                {value?.sale?.full_name ? (
                  <>
                    <p>({value?.sale?.phone || '--'})</p>
                  </>
                ) : (
                  ''
                )}
              </td>
              <td className="cursor" onClick={() => this.handleGetDetail(value.id)}>
                {formatMoney(value?.price) || '--'}
              </td>
              <td className="cursor " onClick={() => this.handleGetDetail(value.id)}>
                {handleOrderStatus(value?.payment_status)}
              </td>
              <td className="cursor px-1" onClick={() => this.handleGetDetail(value.id)}>
                {handleOrderStatus(value?.status)}
              </td>
              <td className="cursor" onClick={() => this.handleGetDetail(value.id)}>
                {toDateString(value?.created_at) || '--'}
              </td>
            </tr>
          ))
        ) : (
          <tr className="text-center">
            <td className="p-2" colSpan={16}>
              <Empty description={<span>{STRING.emptyData}</span>} />
            </td>
          </tr>
        )}
      </tbody>
    )
  }

  render() {
    const { isLoading, isError, check } = this.state
    return (
      <>
        <ScreenWrapper
          isLoading={isLoading}
          titleHeader={STRING.order}
          isError={isError}
          renderHeader={this.renderHeader}
        >
          {this.renderBody()}
        </ScreenWrapper>
      </>
    )
  }
}
const mapDispatchToProps = {
  getListOverView,
}

export default withRouter(connect(null, mapDispatchToProps)(OrderBookTourListScreen))
