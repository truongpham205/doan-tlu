import React, { Component } from 'react'
import ScreenWrapper from 'components/ScreenWrapper'
import { getCustomerDetail } from 'redux/reducers/CustomerSlice'
import { connect } from 'react-redux'
import TableData from 'components/TableData'

import { notifySuccess, notifyFail } from 'utils/notify'
import { Table, Pagination } from 'antd'
import { toDateString } from 'utils/helper'
// import handleImageError from 'utils/handleImageError'
import { getUserDetailAction, getListOverView } from 'redux/actions'
import { STRING, STATUS, TYPE_INPUT, CUSTOMERS_STATUS, ROUTER, NUMBER } from 'constants/Constant'
import ModalComponent from 'components/ModalComponent'
import * as StatisticApi from 'network/StatisticApi'
import BaseInfo from './components/BaseInfo'
import HeaderPage from 'components/HeaderPage'
import ConfirmModal from 'components/ConfirmModal'
import * as CustomerApi from 'network/CustomerApi'
import EmptyData from 'components/EmptyData'
import formatMoney from 'utils/formatMoney'
import PaginationComponent from 'components/PaginationComponent'
import formatNumber from 'utils/formatNumber'

class ProviderSaleDetailScreen extends Component {
  constructor(props) {
    super(props)
    this.state = {
      confirmModal: false,
      saleId: '',
      isError: false,
      approve: false,
      showModal: false,
      isLoading: true,
      showModalSettlementSale: false,
      tableHeader: [
        {
          header: STRING.numericalOrder,
        },
        {
          header: STRING.orderCode,
        },
        {
          header: 'Ngày tạo',
        },
        {
          header: ' Check-in',
        },
        {
          header: 'Check-out',
        },

        {
          header: 'Mã căn',
        },
        {
          header: 'Loại phòng',
        },
        {
          header: 'Số lượng người',
        },
        {
          header: 'Giá nhập',
        },
        {
          header: 'Giá bán',
        },
        {
          header: 'Tiền cọc',
        },
        {
          header: 'Tên căn',
        },
      ],
      providerDetail: {},
      historyOrderList: [],
      paging: {
        current: 1,
        total: 0,
        pageSize: 0,
      },
    }
  }

  componentDidMount() {
    this.getData()
  }

  getData = async (page = 1) => {
    const { match } = this.props
    const id = match.params.id
    try {
      const providerDetailApi = await StatisticApi.getProviderDetailStatistic({ provider_id: id, page })
      this.setState({
        saleId: id,
        providerDetail: providerDetailApi.detail,
        historyOrderList: providerDetailApi.data?.map((order, index) => {
          const newOrder = {}
          let surchargesAmount = 0,
            surchargesPrice = 0
          if (order.order_surcharges?.length) {
            order.order_surcharges.forEach((surcharge) => {
              if (surcharge.amount !== null) {
                surchargesAmount += surcharge.amount
              }
              if (surcharge.price !== null) {
                surchargesPrice += surcharge.price
              }
            })
          }
          newOrder.key = index + NUMBER.page_limit * (providerDetailApi.paging.page - 1) + 1
          newOrder.code = order.code
          newOrder.check_in = toDateString(order?.checkin_at) || '--'
          newOrder.check_out = toDateString(order?.checkout_at) || '--'
          newOrder.payment_provider_at = toDateString(order?.payment_provider_at) || '--'
          newOrder.check_in_and_out_at =
            (toDateString(order?.checkin_at) || '--') + (toDateString(order?.checkout_at) || '--')
          newOrder.service_code = order.service_code
          newOrder.service_name = order.service_name
          newOrder.number_of_people = (order.adult || 0) + (order.children || 0)
          newOrder.created_at = toDateString(order?.created_at) || '--'
          newOrder.service_category_name = order?.service_category_name || '--'
          newOrder.import_price = formatMoney(order?.order_transactions[0]?.amount) || '--'
          newOrder.export_price = formatMoney(order?.order_transactions[0]?.price) || '--'
          newOrder.deposit = formatMoney(order?.order_transactions[1]?.amount) || '--'
          newOrder.surchargesAmount = formatMoney(surchargesAmount) || '--'
          newOrder.surchargesPrice = formatMoney(surchargesPrice) || '--'
          const moneyLeft =
            (order?.order_transactions[0]?.amount || 0) -
            ((order?.order_transactions[1]?.amount || 0) + (order?.order_transactions[2]?.amount || 0))
          newOrder.moneyLeft = order?.payment_provider_at
            ? formatMoney(0)
            : moneyLeft >= 0
            ? formatMoney(moneyLeft)
            : '--'

          return newOrder
        }),
        paging: {
          total: providerDetailApi.paging?.count,
          current: providerDetailApi.paging?.page,
          pageSize: providerDetailApi.paging?.limit,
        },
        isLoading: false,
      })
    } catch (error) {
      this.setState({
        isLoading: false,
        isError: true,
      })
      console.log(error)
    }
  }

  renderHeader = () => {
    return <HeaderPage context={this.props} titleHeader={'Chi tiết provider'} />
  }

  renderInfoPersonal = () => {
    const { isLoading, providerDetail } = this.state
    if (!isLoading) {
      return <BaseInfo data={providerDetail} />
    }
  }

  renderSaleHistory = () => {
    const { tableHeader, providerDetail, historyOrderList, paging, isLoading } = this.state
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
        title: 'Tên căn',
        dataIndex: 'service_name',
      },

      {
        title: 'Ngày Check-in - check-out',
        dataIndex: 'check_in_and_out_at',
      },
      // {
      //   title: 'Ngày Check-out',
      //   dataIndex: 'check_out',
      // },
      {
        title: 'Ngày tạo',
        dataIndex: 'created_at',
      },
      {
        title: 'Ngày quyết toán',
        dataIndex: 'payment_provider_at',
      },
      // {
      //   title: 'Mã căn',
      //   dataIndex: 'service_code',
      // },
      // {
      //   title: 'Loại phòng',
      //   dataIndex: 'service_category_name',
      // },
      // {
      //   title: 'Số lượng người',
      //   dataIndex: 'number_of_people',
      // },
      {
        title: 'Giá nhập',
        dataIndex: 'import_price',
      },
      {
        title: 'Phát sinh mua',
        dataIndex: 'surchargesAmount',
      },
      {
        title: 'phát sinh bán',
        dataIndex: 'surchargesPrice',
      },
      {
        title: 'Giá bán',
        dataIndex: 'import_price',
        // dataIndex: 'export_price',
      },
      {
        title: 'Tiền cọc',
        dataIndex: 'deposit',
      },
      {
        title: 'Tiền còn',
        dataIndex: 'moneyLeft',
      },
    ]
    return (
      <div className="table--shadow pt-4  px-3 mt-4">
        <div className="col-12 col-md-4">
          <h5>{'Thống kê đơn hàng'}</h5>
        </div>

        <div
          style={{
            boxShadow: 'rgba(0, 0, 0, 0.05) 0px 0px 0px 1px',
          }}
        >
          <Table
            bordered
            dataSource={historyOrderList || []}
            columns={columns}
            isLoading={isLoading}
            scroll={{ y: 450, x: 768 }}
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
                    isLoading: true,
                    paging: {
                      ...paging,
                      current: page,
                    },
                  },
                  () => this.getData(page)
                )
              }}
            />
          )}
        </div>
      </div>
    )
  }
  renderPagination = () => {
    const { isLoading, paging } = this.state
    if (!isLoading) {
      return (
        <>
          {paging?.count > NUMBER.page_limit && (
            <PaginationComponent
              activePage={paging.page}
              itemCountPerPage={paging.limit}
              totalItemsCount={paging.count}
              action={this.getData}
            />
          )}
        </>
      )
    }
  }

  renderDataTable = () => {
    const { historyOrderList, paging } = this.state
    const calculateTotalPerson = (children, adult) => {
      let newChildren = children ? children : 0
      let newAdult = adult ? adult : 0
      return `${newChildren + newAdult} người`
    }
    return (
      <tbody>
        {historyOrderList.length ? (
          historyOrderList?.map((value, index) => (
            <tr>
              <td>{index + NUMBER.page_limit * (paging?.page - 1) + 1}</td>
              <td>{value?.code || '--'}</td>
              <td>{value?.created_at ? toDateString(value?.created_at) : STRING.notUpdate}</td>
              <td>{value?.created_at ? toDateString(value?.created_at) : STRING.notUpdate}</td>
              <td>{value?.created_at ? toDateString(value?.created_at) : STRING.notUpdate}</td>
              <td>{value?.service_code || '--'}</td>
              <td>{value?.service_category_name || '--'}</td>
              <td>{calculateTotalPerson(value?.children, value?.adult) || '--'}</td>
              <td>{formatMoney(value?.order_transactions[0]?.amount) || '--'}</td>
              <td>{formatMoney(value?.order_transactions[0]?.price) || '--'}</td>
              <td>{formatMoney(value?.order_transactions[1]?.amount) || '--'}</td>
              <td>{value?.service_name || '--'}</td>
            </tr>
          ))
        ) : (
          <EmptyData />
        )}
      </tbody>
    )
  }

  render() {
    const { isLoading, isError, confirmModal, showModalSettlementSale, providerDetail } = this.state

    return (
      <ScreenWrapper
        titleHeader="Chi tiết"
        isLoading={isLoading}
        context={this.props}
        isError={isError}
        detail={true}
        action={() => this.props.history.goBack()}
        renderHeader={this.renderHeader}
      >
        <ConfirmModal
          isOpen={confirmModal}
          onHide={() =>
            this.setState({
              confirmModal: false,
            })
          }
          title={STRING.delete}
          action={this.deleteSalary}
        />

        <ConfirmModal
          isOpen={showModalSettlementSale}
          onHide={() =>
            this.setState({
              showModalSettlementSale: false,
            })
          }
          title={STRING.settlementSale.toLowerCase()}
          action={this.settlementSale}
        />

        <div className="row px-2">
          <div className="col-12 py-3 row box--shadow mx-auto my-3">
            <h4 className="d-block text-primary pl-4 mb-1" style={{ width: '100%' }}>
              Hồ sơ provider
            </h4>
            <div className=" col-12 col-md-6  px-3 py-2">
              <div className="col-12  row px-2 py-0">
                <div className="col-5">
                  <p>Họ và tên</p>
                </div>
                <div className="col-7">
                  <p>
                    <strong>{providerDetail?.full_name || '--'}</strong>
                  </p>
                </div>
                <div className="col-5">
                  <p>Số điện thoại</p>
                </div>
                <div className="col-7">
                  <p>
                    <strong>{providerDetail?.phone || '--'}</strong>
                  </p>
                </div>

                <div className="col-5">
                  <p>Tổng số đơn hàng</p>
                </div>
                <div className="col-7">
                  <p>
                    <strong>{formatNumber(providerDetail?.countOrder?.toString())}</strong>
                  </p>
                </div>
              </div>
            </div>
            <div className=" col-12 col-md-6  px-3 py-2">
              <div className="col-12  row px-2 py-0">
                <div className="col-5">
                  <p>Tổng giá bán</p>
                </div>
                <div className="col-7">
                  <p>
                    <strong>{formatMoney(providerDetail?.totalPrice3?.toString()) || '--'}</strong>
                  </p>
                </div>

                <div className="col-5">
                  <p>Tổng giá chốt</p>
                </div>
                <div className="col-7">
                  <p>
                    <strong>{formatMoney(providerDetail?.totalAmount3) || '--'}</strong>
                  </p>
                </div>

                <div className="col-5">
                  <p>Tổng tiền đã trả</p>
                </div>
                <div className="col-7">
                  <strong>{formatMoney(providerDetail?.totalAmount5) || '--'}</strong>
                </div>

                <div className="col-5">
                  <p>Tổng tiền chưa trả</p>
                </div>
                <div className="col-7">
                  <strong>
                    {providerDetail?.totalAmount3 - providerDetail?.totalAmount5 >= 0
                      ? formatMoney(providerDetail?.totalAmount3 - providerDetail?.totalAmount5)
                      : formatMoney(0)}
                  </strong>
                </div>
              </div>
            </div>
          </div>
          {/* <div className="col-md-3">{this.renderInfoPersonal()}</div> */}
        </div>
        {this.renderSaleHistory()}
      </ScreenWrapper>
    )
  }
}

const mapStateToProps = (state) => ({
  userDetailSate: state.userDetailReducer,
})

const mapDispatchToProps = {
  getListOverView,
}
export default connect(mapStateToProps, mapDispatchToProps)(ProviderSaleDetailScreen)
