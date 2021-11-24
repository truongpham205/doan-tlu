import React, { Component } from 'react'
import ScreenWrapper from 'components/ScreenWrapper'
import { getCustomerDetail } from 'redux/reducers/CustomerSlice'
import { connect } from 'react-redux'
import TableData from 'components/TableData'
import {
  changeProfileGoodsOwnerStatus,
  changeProfileVehicleOwnerStatus,
  changeProfileTeamVehicleOwnerStatus,
  changeProjectOwnerStatus,
  changeStatusUser,
  blockCustomer,
  reActiveCustomer,
  addStaffRole,
  deleteStaffRole,
  getUserDetail,
} from 'constants/Api'
import { notifySuccess, notifyFail } from 'utils/notify'
import { toDateString } from 'utils/helper'
// import handleImageError from 'utils/handleImageError'
import { getUserDetailAction, getListOverView } from 'redux/actions'
import { STRING, STATUS, TYPE_INPUT, CUSTOMERS_STATUS, ROUTER, NUMBER } from 'constants/Constant'
import ModalComponent from 'components/ModalComponent'
import * as StatisticProviderApi from 'network/StatisticProviderApi'
import BaseInfo from './components/BaseInfo'
import HeaderPage from 'components/HeaderPage'
import ConfirmModal from 'components/ConfirmModal'
import * as CustomerApi from 'network/CustomerApi'
import EmptyData from 'components/EmptyData'
import formatMoney from 'utils/formatMoney'
import { Empty, Table, Pagination } from 'antd'

class SettlementProviderDetailScreen extends Component {
  constructor(props) {
    super(props)
    this.state = {
      confirmModal: false,
      providerId: '',
      isError: false,
      approve: false,
      showModal: false,
      isLoading: true,
      showModalSettlementProvider: false,
      tableHeader: [
        {
          header: STRING.numericalOrder,
        },
        {
          header: STRING.orderCode,
        },
        {
          header: STRING.numberPeople,
        },
        {
          header: STRING.checkInOut,
        },
        {
          header: STRING.moneySum,
        },
      ],
      paging: {
        total: 0,
        current: 1,
        pageSize: 0,
      },
      providerDetail: {},
      historyOrderList: [],
    }
  }

  componentDidMount() {
    this.getData()
  }

  getData = async () => {
    const { match } = this.props
    const { paging } = this.state
    const id = match.params.id
    try {
      const providerDetailApi = await StatisticProviderApi.getSalaryDetail({ id, page: paging.current || 1 })
      this.setState({
        providerId: id,
        providerDetail: providerDetailApi.data.detail,
        historyOrderList: providerDetailApi.data.listOrder.map((order, index) => {
          let surchargesAmount = 0,
            surchargesPrice = 0,
            amount3 = 0,
            amount4 = 0,
            amount6 = 0,
            amount5 = 0

          if (order.order_transactions?.length) {
            order.order_transactions.forEach((transaction) => {
              if (transaction.df_order_transaction_type_id === 3 && transaction.amount !== null) {
                amount3 += transaction.amount
              }
              if (transaction.df_order_transaction_type_id === 4 && transaction.amount !== null) {
                amount4 += transaction.amount
              }
              if (transaction.df_order_transaction_type_id === 5 && transaction.amount !== null) {
                amount5 += transaction.amount
              }
              if (
                transaction.df_order_transaction_type_id === 6 &&
                transaction.is_epay !== 1 &&
                transaction.status === 2 &&
                transaction.amount !== null
              ) {
                amount6 += transaction.amount
              }
            })
          }

          if (order.order_surcharges) {
            order.order_surcharges.forEach((surcharge) => {
              if (surcharge.amount !== null) surchargesAmount += surcharge.amount
              if (surcharge.price !== null) surchargesPrice += surcharge.price
            })
          }

          const totalPrice = amount3 + surchargesAmount - (amount4 + amount5 + amount6)
          const newProvider = {
            key: index + NUMBER.page_limit * (providerDetailApi.paging.page - 1) + 1,
            code: order.code,
            service_name: order.service_name,
            surchargesAmount: formatMoney(surchargesAmount),
            surchargesPrice: formatMoney(surchargesPrice),
            number_of_people: (order.adult || 0) + (order.children || 0),
            check_in_or_check_out:
              `${toDateString(order?.checkin_at) || '--'} - ${toDateString(order?.checkout_at) || '--'}` || '--',
            price: formatMoney(order.price) || STRING.notUpdate,
            amount3: formatMoney(amount3),
            amount4: formatMoney(amount4),
            amount5: formatMoney(amount5),
            amount6: formatMoney(amount6),
            id: order.id,
            totalPrice: formatMoney(totalPrice),
          }
          return newProvider
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

  deleteSalary = async () => {
    const { providerId } = this.state
    this.setState({
      isLoading: true,
    })
    try {
      await StatisticProviderApi.deleteSalary({ listID: [providerId] })
      this.setState({
        confirmModal: false,
      })
      notifySuccess(STRING.deleteSuccess)
      this.props.history.goBack()
    } catch (error) {
      notifySuccess(STRING.deleteFail)
      this.setState({
        isLoading: false,
      })
    }
  }

  settlementProvider = async () => {
    const { providerId } = this.state
    this.setState({
      isLoading: true,
    })
    try {
      const payload = { id: parseInt(providerId) }
      await StatisticProviderApi.updatePayment(payload)
      this.setState(
        {
          showModalSettlementProvider: false,
        },
        () => this.getData()
      )
      notifySuccess('Quyết toán Provider thành công!')
    } catch (error) {
      this.setState({
        isLoading: false,
      })
      notifyFail(STRING.Fail)
      console.log(error)
    }
  }

  handleInputModal = (fieldName, value) => {
    this.setState({
      [fieldName]: value || '',
    })
  }

  renderHeader = () => {
    return <HeaderPage context={this.props} titleHeader={'Chi tiết quyết toán provider'} />
  }

  renderInfoPersonal = () => {
    const { isLoading, providerDetail } = this.state
    if (!isLoading) {
      return (
        <BaseInfo
          data={providerDetail}
          settlementSale={() =>
            this.setState({
              showModalSettlementProvider: true,
            })
          }
          deleteSale={() =>
            this.setState({
              confirmModal: true,
            })
          }
        />
      )
    }
  }

  handleGetDetail = (value) => {
    // if (value?.service_id == 1) {
    //   this.props.history.push(ROUTER.ORDER_DETAIL_BOOK_TOUR + `/${value.id}`)
    // } else {
    this.props.history.push(ROUTER.ORDER_DETAIL_BOOK_ROOM + `/${value.id}`)
    // }
  }

  renderSaleHistory = () => {
    const { tableHeader, providerDetail, paging, listOrder, isLoading, historyOrderList } = this.state
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
        title: STRING.numberPeople,
        dataIndex: 'number_of_people',
      },
      {
        title: 'Tiền chốt',
        dataIndex: 'amount3',
      },
      {
        title: 'Tiền cọc',
        dataIndex: 'amount4',
      },
      {
        title: 'Tiền nhà cung cấp thu hộ',
        dataIndex: 'amount6',
      },
      {
        title: 'Tiền Đã trả',
        dataIndex: 'amount5',
      },
      {
        title: 'Phát sinh mua',
        dataIndex: 'surchargesAmount',
      },
      {
        title: 'Phát sinh bán',
        dataIndex: 'surchargesPrice',
      },
      {
        title: 'Số tiền phải trả',
        dataIndex: 'totalPrice',
      },
      {
        title: STRING.checkInOut,
        dataIndex: 'check_in_or_check_out',
      },
    ]
    return (
      <div className="table--shadow pt-4  px-3 ">
        <div
          style={{
            boxShadow: 'rgba(0, 0, 0, 0.05) 0px 0px 0px 1px',
          }}
        >
          <Table
            onRow={(record, rowIndex) => {
              return {
                onClick: (event) => {
                  this.handleGetDetail(record)
                }, // click row
              }
            }}
            bordered
            dataSource={historyOrderList || []}
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

    return (
      <div className="box--shadow p-3 row">
        <div className="col-12 col-md-4">
          <h5>{'Lịch sử đơn hàng'}</h5>
        </div>
        <table id="example1" className="table table-bordered table-striped table-responsive-md">
          <TableData tableHeader={tableHeader} />
          {this.renderDataTable()}
        </table>
      </div>
    )
  }

  renderDataTable = () => {
    const { historyOrderList } = this.state
    const calculateTotalPerson = (children, adult) => {
      let newChildren = children ? children : 0
      let newAdult = adult ? adult : 0
      return `${newChildren + newAdult} người`
    }
    return (
      <tbody>
        {historyOrderList.length ? (
          historyOrderList?.map((value, index) => (
            <tr
              onClick={() => {
                // service_id = 1 is tour
                if (value.service_id == 1) {
                  this.props.history.push(ROUTER.ORDER_DETAIL_BOOK_TOUR + `/${value.id}`)
                } else {
                  this.props.history.push(ROUTER.ORDER_DETAIL_BOOK_ROOM + `/${value.id}`)
                }
              }}
              style={{ cursor: 'pointer' }}
            >
              <td>{index + 1}</td>
              <td>{value?.code || '--'}</td>
              <td>{calculateTotalPerson(value?.children, value?.adult) || '--'}</td>
              <td>
                {' '}
                {value?.checkin_at ? toDateString(value?.checkin_at) : STRING.notUpdate}
                {` - `}
                {value?.checkout_at ? toDateString(value?.checkout_at) : STRING.notUpdate}
              </td>

              <td>{formatMoney(value?.price) || '--'}</td>
            </tr>
          ))
        ) : (
          <EmptyData />
        )}
      </tbody>
    )
  }

  render() {
    const { isLoading, isError, confirmModal, showModalSettlementProvider } = this.state

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
          isOpen={showModalSettlementProvider}
          onHide={() =>
            this.setState({
              showModalSettlementProvider: false,
            })
          }
          title={'quyết toán provider'}
          action={this.settlementProvider}
        />

        <div className="row">
          <div className="col-md-3">{this.renderInfoPersonal()}</div>

          {/* /.col */}
          <div className="col-md-9">{this.renderSaleHistory()}</div>
        </div>
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
export default connect(mapStateToProps, mapDispatchToProps)(SettlementProviderDetailScreen)
