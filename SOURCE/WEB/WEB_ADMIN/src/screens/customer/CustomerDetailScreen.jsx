import ConfirmModal from 'components/ConfirmModal'
import EmptyData from 'components/EmptyData'
import HeaderPage from 'components/HeaderPage'
import ScreenWrapper from 'components/ScreenWrapper'
import TableData from 'components/TableData'
import { blockCustomer, reActiveCustomer } from 'constants/Api'
import { CUSTOMERS_STATUS, STRING, NUMBER } from 'constants/Constant'
import * as CustomerApi from 'network/CustomerApi'
import React, { Component } from 'react'
import { connect } from 'react-redux'
// import handleImageError from 'utils/handleImageError'
import { getListOverView } from 'redux/actions'
import formatMoney from 'utils/formatMoney'
import { toDateString } from 'utils/helper'
import { notifyFail, notifySuccess } from 'utils/notify'
import { handleOrderStatus } from 'utils/order'
import BaseInfo from './components/BaseInfo'
import PaginationComponent from 'components/PaginationComponent'
import './style.css'
import formatNumber from 'utils/formatNumber'

class CustomerDetailScreen extends Component {
  constructor(props) {
    super(props)
    this.state = {
      confirmModal: false,
      userId: '',
      isError: false,
      approve: false,
      showModal: false,
      isLoading: true,
      showModalBlockCustomer: false,
      tableHeader: [
        {
          header: STRING.numericalOrder,
        },
        {
          header: STRING.orderCode,
        },
        {
          header: STRING.address,
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
        {
          header: STRING.status,
        },
        {
          header: STRING.createDate,
        },
      ],
      customerDetail: {},
      pagingOrder: {},
      pagingAccumulation: {},
      orderList: [],
      accumulationList: [],
    }
  }

  componentDidMount() {
    this.getData()
    this.getListOrder()
    this.getAccumulation()
  }

  getData = async () => {
    const { match } = this.props
    const id = match.params.id
    const userDetailApi = await CustomerApi.getCustomerDetail({ id })
    this.setState({
      userId: id,
      customerDetail: userDetailApi.data,
      isLoading: false,
    })
  }

  getListOrder = async (page) => {
    const { match } = this.props
    const id = match.params.id
    try {
      const res = await CustomerApi.getListOrder({
        customer_id: id,
        page,
      })
      this.setState({
        orderList: res.data,
        pagingOrder: res.paging,
        isLoading: false,
      })
    } catch (error) {
      this.setState({
        isLoading: false,
      })
    }
  }

  getAccumulation = async (page) => {
    const { match } = this.props
    const id = match.params.id
    try {
      const res = await CustomerApi.getListAccumulation({
        customer_id: id,
        page,
      })
      this.setState({
        accumulationList: res.data,
        pagingAccumulation: res.paging,
        isLoading: false,
      })
    } catch (error) {
      this.setState({
        isLoading: false,
      })
    }
  }

  deleteCustomer = async () => {
    const { userId } = this.state
    this.setState({
      isLoading: true,
    })
    try {
      await CustomerApi.changeStatusCustomer({ id: [userId] })
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

  blockCustomer = async () => {
    const { userId, customerDetail } = this.state
    this.setState({
      isLoading: true,
    })
    try {
      if (customerDetail.is_active === CUSTOMERS_STATUS.active) {
        const payload = { id: parseInt(userId), is_active: CUSTOMERS_STATUS.block }
        await blockCustomer(payload)
        this.setState({
          showModalBlockCustomer: false,
        })
        notifySuccess(STRING.blockSuccess)
        this.props.history.goBack()
      } else {
        const payload = { id: parseInt(userId), is_active: CUSTOMERS_STATUS.active }
        await reActiveCustomer(payload)
        this.setState(
          {
            showModalBlockCustomer: false,
          },
          () => this.getData()
        )
        notifySuccess(STRING.unlockSuccess)
      }
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
    return <HeaderPage context={this.props} titleHeader={STRING.customerDetail} />
  }

  renderInfoPersonal = () => {
    const { isLoading, customerDetail } = this.state
    if (!isLoading) {
      return (
        <BaseInfo
          data={customerDetail}
          blockCustomer={() =>
            this.setState({
              showModalBlockCustomer: true,
            })
          }
          deleteCustomer={() =>
            this.setState({
              confirmModal: true,
            })
          }
        />
      )
    }
  }

  renderPaginationOrder = () => {
    const { isLoading, pagingOrder } = this.state
    if (!isLoading) {
      return (
        <>
          {pagingOrder?.count > NUMBER.page_limit && (
            <PaginationComponent
              activePage={pagingOrder.page}
              itemCountPerPage={pagingOrder.limit}
              totalItemsCount={pagingOrder.count}
              action={(page) => {
                this.setState({
                  isLoading: true,
                })
                this.getListOrder(page)
              }}
            />
          )}
        </>
      )
    }
  }

  renderPaginationAccumulation = () => {
    const { isLoading, pagingAccumulation } = this.state
    if (!isLoading) {
      return (
        <>
          {pagingAccumulation?.count > NUMBER.page_limit && (
            <PaginationComponent
              activePage={pagingAccumulation.page}
              itemCountPerPage={pagingAccumulation.limit}
              totalItemsCount={pagingAccumulation.count}
              action={(page) => {
                this.setState({
                  isLoading: true,
                })
                this.getListAccumulation(page)
              }}
            />
          )}
        </>
      )
    }
  }

  renderTransactionHistory = () => {
    const { tableHeader, orderList } = this.state

    return (
      <div className="box--shadow  px-3 pt-3 pb-5 mt-1">
        <h5 className="d-block">{STRING.transactionHistory}</h5>
        <table id="example1" className={`table table-bordered table-striped table-responsive-md `}>
          <TableData tableHeader={tableHeader} />
          {this.renderTableDataOfTransactionHistory()}
        </table>
        {this.renderPaginationOrder()}
      </div>
    )
  }

  renderAccumulationHistory = () => {
    const { accumulationList } = this.state
    const tableHeader = [
      {
        header: STRING.numericalOrder,
      },

      {
        header: STRING.content,
      },
      {
        header: STRING.score,
      },
      {
        header: STRING.createDate,
      },
    ]
    return (
      <div className="box--shadow p-3 mt-3">
        <h5 className="d-block">{STRING.accumulationHistory}</h5>
        <table id="example2" className="table table-bordered table-striped table-responsive-md">
          <TableData tableHeader={tableHeader} />
          {this.renderTableDataOfAccumulationHistory()}
        </table>
        {this.renderPaginationAccumulation()}
      </div>
    )
  }

  renderTableDataOfTransactionHistory = () => {
    const { orderList, pagingOrder } = this.state
    return (
      <tbody>
        {orderList.length ? (
          orderList?.map((value, index) => (
            <tr>
              <td>{index + 1 + NUMBER.page_limit * (pagingOrder.page - 1)}</td>
              <td>{value?.code || '--'}</td>
              <td>{value?.service_name || '--'}</td>
              <td>
                {value?.adult + ' người lớn' || '--'} <p>{value?.children + ' trẻ nhỏ' || ''}</p>
              </td>
              <td>
                {toDateString(value?.checkin_at) + ' - ' || '--'} <p>{toDateString(value?.checkout_at) || '--'}</p>
              </td>
              <td>{formatMoney(value?.price || 0) || '--'}</td>
              <td>{handleOrderStatus(value?.status) || '--'}</td>
              <td>{toDateString(value?.created_at) || '--'}</td>
            </tr>
          ))
        ) : (
          <EmptyData />
        )}
      </tbody>
    )
  }

  renderTableDataOfAccumulationHistory = () => {
    const { accumulationList, pagingAccumulation } = this.state
    return (
      <tbody>
        {accumulationList.length ? (
          accumulationList?.map((value, index) => (
            <tr>
              <td>{index + 1 + NUMBER.page_limit * (pagingAccumulation.page - 1)}</td>
              <td>{value.content + 1}</td>
              <td>{formatNumber(value.point?.toString() || '0') || '--'}</td>
              <td>{toDateString(value?.created_at) || '--'}</td>
            </tr>
          ))
        ) : (
          <EmptyData />
        )}
      </tbody>
    )
  }

  render() {
    const { isLoading, isError, customerDetail, confirmModal, showModalBlockCustomer } = this.state

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
          action={this.deleteCustomer}
        />

        <ConfirmModal
          isOpen={showModalBlockCustomer}
          onHide={() =>
            this.setState({
              showModalBlockCustomer: false,
            })
          }
          title={customerDetail?.is_active === CUSTOMERS_STATUS.active ? STRING.blockAccount : STRING.openAccount}
          action={this.blockCustomer}
        />

        <div className="row">
          <div className="col-md-3">{this.renderInfoPersonal()}</div>

          {/* /.col */}
          <div className="col-md-9">
            {this.renderTransactionHistory()}
            {this.renderAccumulationHistory()}
          </div>
        </div>
      </ScreenWrapper>
    )
  }
}

const mapStateToProps = (state) => ({})

const mapDispatchToProps = {
  getListOverView,
}
export default connect(mapStateToProps, mapDispatchToProps)(CustomerDetailScreen)
