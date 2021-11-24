import { Empty, Pagination, Table } from 'antd'
import ButtonType from 'components/ButtonType'
import HeaderPage from 'components/HeaderPage'
import ModalComponent from 'components/ModalComponent'
import PaginationComponent from 'components/PaginationComponent'
import ScreenWrapper from 'components/ScreenWrapper'
import {
  CHAT_STATUS,
  LABEL_BUTTON_CLEAR_SEARCH,
  LABEL_BUTTON_SEARCH,
  NUMBER,
  ORDER_PROVIDER_LIST,
  ORDER_STATUS_LIST,
  ROUTER,
  STRING,
  TYPE_INPUT,
} from 'constants/Constant'
import * as OrderApi from 'network/OrderApi'
import * as OrderProviderApi from 'network/OrderProviderApi'
import React, { Component } from 'react'
import { Col, FormControl, Row } from 'react-bootstrap'
import socketIOClient from 'socket.io-client'
import 'styles/UserScreen.css'
import formatMoney from 'utils/formatMoney'
import formatNumber from 'utils/formatNumber'
import { toDateString } from 'utils/helper'
import { notifySuccess } from 'utils/notify'
import { handleOrderStatus, handlePaymentStatus } from 'utils/order'

class OrderProviderListScreen extends Component {
  constructor(props) {
    super(props)
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
      accountInfo: JSON.parse(localStorage.getItem('userInfo')),
      overView: {},
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
          header: STRING.area,
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
      this.getOrderOverview()
    }
  }

  listenSocket = () => {
    const providerInfo = JSON.parse(localStorage.getItem('userInfo'))
    var socket = socketIOClient(process.env.REACT_APP_SOCKET, {
      transports: ['websocket'],
    })
    socket.on('newOder', (data) => {
      if (
        data?.type == CHAT_STATUS.NEW_ORDER ||
        (data?.type == CHAT_STATUS.UPDATE_TO_HOMEOWNER && data?.provider_id == providerInfo?.id)
      ) {
        notifySuccess(data?.content)
        this.getData()
      }
    })
  }

  getData = async () => {
    const { search, status, activePage } = this.state
    this.setState({ isLoading: true })
    try {
      const payload = {
        search,
        page: activePage,
        status,
      }
      const listOrderApi = await OrderProviderApi.getListOrder(payload)
      this.setState({
        listOrder: listOrderApi.data.map((order, index) => {
          const newOrder = {}
          newOrder.sale_leader_name = `${order?.sale_leader?.full_name || '--'} (${order?.sale_leader?.phone || '--'})`
          newOrder.sale_name = `${order?.sale?.full_name || '--'} (${order?.sale?.phone || '--'})`
          newOrder.number_of_people = (order.adult || 0) + (order.children || 0)
          newOrder.created_at = toDateString(order?.created_at) || '--'
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
        isLoading: false,
        isError: false,
        paging: listOrderApi.paging,
      })
    } catch (error) {
      this.setState({
        isLoading: false,
        isError: true,
      })
      console.log(error)
    }
  }
  getOrderOverview = async () => {
    try {
      const res = await OrderApi.orderOverview()
      this.setState({
        orderOverview: res.data,
      })
    } catch (error) {
      console.log(error)
    }
  }

  search = () => {
    this.setState(
      {
        isLoading: true,
        activePage: 1,
      },
      () => this.getData()
    )
  }

  clearSearch = () => {
    this.setState(
      {
        search: '',
        status: '',
        isLoading: true,
      },
      () => this.getData()
    )
  }

  checkValidateValue = () => {
    const { orderStatus } = this.state
    if (orderStatus) {
      return false
    }
    return true
  }

  handleGetDetail = (id) => {
    this.props.history.push(ROUTER.ORDER_PROVIDER + '/' + id)
  }

  handleInputModal = (fieldName, value) => {
    this.setState({
      [fieldName]: value || '',
    })
  }

  handleChange = (fieldName, value) => {
    this.setState({
      [fieldName]: value || '',
    })
  }

  handleChangeSelect = (fieldName, value) => {
    this.setState(
      {
        [fieldName]: value || '',
        isLoading: true,
        activePage: 1,
      },
      () => this.getData()
    )
  }

  handleChangePage = (page) => {
    this.setState(
      {
        activePage: page,
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

  renderHeader = () => {
    return <HeaderPage titleHeader={'Đơn hàng'}></HeaderPage>
  }

  renderField = () => {
    const { search, status, accountInfo } = this.state
    return (
      <>
        <Row className="mx-0">
          <Col md={6} lg={4} className="responsive__inputField-md">
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

          <Col md={6} lg={4} className="responsive__inputField-md">
            <FormControl
              as="select"
              aria-describedby="basic-addon1"
              value={status}
              onChange={(e) => this.handleChangeSelect('status', e.target.value)}
            >
              <option value="" defaultValue disabled>
                {STRING.orderStatus}
              </option>
              {ORDER_PROVIDER_LIST?.map((orderStatus, index) => (
                <option value={orderStatus.id} key={index}>
                  {orderStatus.name}
                </option>
              ))}
            </FormControl>
          </Col>
          <Col md={6} lg={4} className="responsive__inputField-md">
            {this.renderButton()}
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
        <Col className="button-wrapper">
          <ButtonType typeButton={LABEL_BUTTON_SEARCH} isOpen={this.search} />
          <ButtonType typeButton={LABEL_BUTTON_CLEAR_SEARCH} style={{ marginRight: 0 }} isOpen={this.clearSearch} />
        </Col>
      </Row>
    )
  }

  renderBody = () => {
    const { orderStatus, changeOrderStatus, paging, orderOverview } = this.state
    const providerInfo = JSON.parse(localStorage.getItem('userInfo'))
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
        <div className="box--shadow px-3 pt-3 pb-2">{this.renderField()}</div>
        <div className="col-12 py-3 row box--shadow mx-auto my-3">
          <h4 className="d-block text-primary pl-4 mb-1" style={{ width: '100%' }}>
            Hồ sơ cá nhân
          </h4>
          <div className=" col-12 col-md-6  px-3 py-2">
            <div className="col-12  row px-2 py-0">
              {/* <div className="col-12">
                <h5>Thông tin nhà cung cấp</h5>
              </div> */}
              <div className="col-5">
                <p>Họ và tên</p>
              </div>
              <div className="col-7">
                <p>
                  <strong>{providerInfo?.provider_info?.provider_name}</strong>
                </p>
              </div>
              <div className="col-5">
                <p>Số điện thoại</p>
              </div>
              <div className="col-7">
                <p>
                  <strong>{providerInfo?.phone}</strong>
                </p>
              </div>

              <div className="col-5">
                <p>{'Email'}</p>
              </div>
              <div className="col-7">
                <p>
                  <strong>{providerInfo.email}</strong>
                </p>
              </div>

              <div className="col-5">
                <p>{STRING.address}</p>
              </div>

              <div className="col-7">
                <strong>{providerInfo?.provider_info?.address}</strong>
              </div>

              {providerInfo?.provider_info?.parent_id !== null ? (
                <>
                  <div className="col-5">
                    <p>{STRING.supplierName}</p>
                  </div>

                  <div className="col-7">
                    <strong>{providerInfo?.provider_name}</strong>
                  </div>
                </>
              ) : (
                ''
              )}
            </div>
          </div>
          <div className=" col-12 col-md-6  px-3 py-2">
            <div className="col-12  row px-2 py-0">
              {/* <div className="col-12">
                <h5>Thống kê nhà cung cấp</h5>
              </div> */}

              <div className="col-5">
                <p>Tổng số đơn hàng</p>
              </div>
              <div className="col-7">
                <p>
                  <strong>{formatNumber(orderOverview?.total_order?.toString())}</strong>
                </p>
              </div>

              <div className="col-5">
                <p>Tổng số đơn đã hoàn thành</p>
              </div>
              <div className="col-7">
                <p>
                  <strong>{formatNumber(orderOverview?.finished?.toString())}</strong>
                </p>
              </div>

              <div className="col-5">
                <p>Tổng số đơn chưa hoàn thành</p>
              </div>
              <div className="col-7">
                <strong>{formatNumber(orderOverview?.not_finish?.toString())}</strong>
              </div>

              <div className="col-5">
                <p>Tổng tiền</p>
              </div>

              <div className="col-7">
                <strong>{formatMoney(orderOverview?.total_price)}</strong>
              </div>
              <div className="col-5">
                <p>Số tiền đã thanh toán </p>
              </div>

              <div className="col-7">
                <strong>{formatMoney(orderOverview?.amount_finished)}</strong>
              </div>
              <div className="col-5">
                <p>Số tiền chưa thanh toán </p>
              </div>

              <div className="col-7">
                <strong>{formatMoney(orderOverview?.remain || 0)}</strong>
              </div>
            </div>
          </div>
        </div>
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
        {/* <div className="pt-4 pb-5 px-3 mt-4 table--shadow"> */}
        {this.renderTable()}
        {/* {this.renderPagination()} */}
        {/* </div> */}
      </div>
    )
  }

  renderTable = () => {
    const { tableHeader, check, listOrder, paging, isLoading } = this.state

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
        title: STRING.area,
        dataIndex: 'region_name',
      },

      {
        title: STRING.numberPeople,
        dataIndex: 'number_of_people',
      },
      {
        title: STRING.checkInOut,
        dataIndex: 'check_in_or_check_out',
      },
      // {
      //   title: STRING.responsibleLead,
      //   dataIndex: 'sale_leader_name',
      // },
      // {
      //   title: STRING.responsibleSale,
      //   dataIndex: 'sale_name',
      // },
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
            bordered
            dataSource={listOrder || []}
            loading={isLoading}
            columns={columns}
            scroll={{ y: 450, x: 992 }}
            pagination={false}
            style={{ cursor: 'pointer' }}
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
    //     <Table striped responsive responsive-xl bordered>
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
              <td className="cursor" onClick={() => this.handleGetDetail(value.id)}>
                {value?.service_name || '--'}
              </td>
              <td className="cursor " onClick={() => this.handleGetDetail(value.id)}>
                {value?.region_name || '--'}
              </td>
              {/* <td className="cursor" onClick={() => this.handleGetDetail(value.id)}>
                {value?.customer_name || '--'} <p>({value.customer_phone || '--'})</p>
              </td> */}
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
              {/* <td className="cursor" onClick={() => this.handleGetDetail(value.id)}>
                {formatMoney(value?.price) || '--'}
              </td> */}
              <td className="cursor " onClick={() => this.handleGetDetail(value.id)}>
                {handlePaymentStatus(value?.payment_status)}
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

export default OrderProviderListScreen
