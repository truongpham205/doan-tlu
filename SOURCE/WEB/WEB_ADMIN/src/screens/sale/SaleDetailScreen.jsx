import ConfirmModal from 'components/ConfirmModal'
import EmptyData from 'components/EmptyData'
import HeaderPage from 'components/HeaderPage'
import PaginationComponent from 'components/PaginationComponent'
import ScreenWrapper from 'components/ScreenWrapper'
import TableData from 'components/TableData'
import { blockCustomer, reActiveCustomer } from 'constants/Api'
import { CUSTOMERS_STATUS, NUMBER, STRING } from 'constants/Constant'
import * as SaleApi from 'network/SaleApi'
import React, { Component } from 'react'
import formatMoney from 'utils/formatMoney'
// import handleImageError from 'utils/handleImageError'
import { toDateString } from 'utils/helper'
import { notifyFail, notifySuccess } from 'utils/notify'
import { handleOrderStatus } from 'utils/order'
import BaseInfo from './components/BaseInfo'
import './style.css'

class SaleDetailScreen extends Component {
  constructor(props) {
    super(props)
    this.state = {
      confirmModal: false,
      saleId: '',
      isError: false,
      showModal: false,
      isLoading: true,
      showModalDeleteSale: false,

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
      saleDetail: {},
      orderList: [],
      settlementSaleHistory: [],
      notSettlement: '',
      pagingOrder: {},
      pagingSettlement: {},
    }
  }

  componentDidMount() {
    this.getListOrder()
    this.getSettlementSaleHistory()
    this.getData()
  }

  getData = async () => {
    const { match } = this.props
    const id = match.params.id
    try {
      const res = await SaleApi.getSaleDetail({ id })
      this.setState({
        saleId: id,
        saleDetail: res.data,
        isLoading: false,
        isError: false,
      })
    } catch (error) {
      this.setState({
        isLoading: false,
        isError: true,
      })
    }
  }

  getListOrder = async (page) => {
    const { match } = this.props
    const id = match.params.id
    try {
      const res = await SaleApi.getListOrder({
        sale_id: id,
        page,
      })
      this.setState({
        ...this.state,
        orderList: res.data,
        pagingOrder: res.paging,
        isLoading: false,
      })
    } catch (error) {
      this.setState({
        ...this.state,
        isLoading: false,
      })
    }
  }

  getSettlementSaleHistory = async (page) => {
    const { match } = this.props
    const id = match.params.id
    try {
      const res = await SaleApi.getListSalary({
        sale_id: id,
        page,
      })
      this.setState({
        ...this.state,
        settlementSaleHistory: res.data.salaries,
        pagingSettlement: res.paging,
        notSettlement: res.data.unpay,
        isLoading: false,
      })
    } catch (error) {
      this.setState({
        ...this.state,
        isLoading: false,
      })
    }
  }

  deleteSale = async () => {
    const { saleId } = this.state
    this.setState({
      isLoading: true,
    })
    try {
      await SaleApi.deleteSale({ id: [saleId] })
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

  blockSale = async () => {
    const { saleId, saleDetail } = this.state
    this.setState({
      isLoading: true,
    })
    try {
      if (saleDetail.is_active === CUSTOMERS_STATUS.active) {
        const payload = { id: parseInt(saleId), is_active: CUSTOMERS_STATUS.block }
        await blockCustomer(payload)
        this.setState({
          showModalDeleteSale: false,
        })
        notifySuccess(STRING.blockSuccess)
        this.props.history.goBack()
      } else {
        const payload = { id: parseInt(saleId), is_active: CUSTOMERS_STATUS.active }
        await reActiveCustomer(payload)
        this.setState(
          {
            showModalDeleteSale: false,
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
    return <HeaderPage context={this.props} titleHeader={STRING.saleDetail} />
  }

  renderInfoPersonal = () => {
    const { isLoading, saleDetail, notSettlement } = this.state
    if (!isLoading) {
      return (
        <BaseInfo
          data={saleDetail}
          blockSale={() =>
            this.setState({
              showModalDeleteSale: true,
            })
          }
          notSettlement={notSettlement}
          deleteSale={() =>
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

  renderPaginationSettlement = () => {
    const { isLoading, pagingSettlement } = this.state
    if (!isLoading) {
      return (
        <>
          {pagingSettlement?.count > NUMBER.page_limit && (
            <PaginationComponent
              activePage={pagingSettlement.page}
              itemCountPerPage={pagingSettlement.limit}
              totalItemsCount={pagingSettlement.count}
              action={(page) => {
                this.setState({
                  isLoading: true,
                })
                this.getSettlementSaleHistory(page)
              }}
            />
          )}
        </>
      )
    }
  }

  renderTransactionHistory = () => {
    const { tableHeader } = this.state
    return (
      <div className="box--shadow px-3 pt-3 pb-5">
        <h5 className="d-block">{STRING.saleHistory}</h5>
        <table id="example1" className="table table-bordered table-striped table-responsive-sm table-responsive-md">
          <TableData tableHeader={tableHeader} />
          {this.renderTableDataOfTransactionHistory()}
        </table>
        {this.renderPaginationOrder()}
      </div>
    )
  }

  renderSettlementHistory = () => {
    const tableHeader = [
      {
        header: STRING.numericalOrder,
      },

      {
        header: 'Thời gian',
      },
      {
        header: 'Số tiền',
      },

      {
        header: 'Ngày quyết toán',
      },
      {
        header: 'Người quyết toán',
      },
    ]
    return (
      <div className="box--shadow px-3 pt-3 pb-5 mt-3">
        <h5 className="d-block">{STRING.settlementHistory}</h5>
        <table id="example2" className="table table-bordered table-striped table-responsive-sm table-responsive-md">
          <TableData tableHeader={tableHeader} />
          {this.renderTableDataOfSettlementHistory()}
        </table>
        {this.renderPaginationSettlement()}
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

  renderTableDataOfSettlementHistory = () => {
    const { settlementSaleHistory, pagingSettlement } = this.state
    return (
      <tbody>
        {settlementSaleHistory.length ? (
          settlementSaleHistory?.map((value, index) => (
            <tr>
              <td>{index + 1 + NUMBER.page_limit * (pagingSettlement.page - 1)}</td>
              <td className="cursor" onClick={() => this.handleGetDetail(value.id)}>
                {toDateString(value?.start_at) + ' - ' || '--'} <p>{toDateString(value?.end_at) || '--'}</p>
              </td>
              <td>{formatMoney(value?.total_price || 0) || '--'}</td>
              <td>{toDateString(value?.payment_at) || '--'}</td>
              <td>{value?.payment_name || '--'}</td>
            </tr>
          ))
        ) : (
          <EmptyData />
        )}
      </tbody>
    )
  }

  render() {
    const { isLoading, isError, saleDetail, confirmModal, showModalDeleteSale } = this.state

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
          action={this.deleteSale}
        />

        <ConfirmModal
          isOpen={showModalDeleteSale}
          onHide={() =>
            this.setState({
              showModalDeleteSale: false,
            })
          }
          title={saleDetail?.is_active === CUSTOMERS_STATUS.active ? STRING.blockAccount : STRING.openAccount}
          action={this.blockSale}
        />

        <div className="row">
          <div className="col-md-3">{this.renderInfoPersonal()}</div>

          {/* /.col */}
          <div className="col-md-9">
            {this.renderTransactionHistory()}
            {this.renderSettlementHistory()}
          </div>
        </div>
      </ScreenWrapper>
    )
  }
}

export default SaleDetailScreen
