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
import { Empty } from 'antd'
import { toDateString } from 'utils/helper'
// import handleImageError from 'utils/handleImageError'
import { getUserDetailAction, getListOverView } from 'redux/actions'
import { STRING, STATUS, TYPE_INPUT, CUSTOMERS_STATUS, ROUTER } from 'constants/Constant'
import ModalComponent from 'components/ModalComponent'
import * as SaleApi from 'network/SaleApi'
import BaseInfo from './components/BaseInfo'
import HeaderPage from 'components/HeaderPage'
import ConfirmModal from 'components/ConfirmModal'
import * as CustomerApi from 'network/CustomerApi'
import EmptyData from 'components/EmptyData'
import formatMoney from 'utils/formatMoney'

class CustomerDetailScreen extends Component {
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
          header: 'Tiền hoa hồng',
        },
        {
          header: 'Phần trăm hoa hồng',
        },
      ],
      saleDetail: {},
      historyOrderList: [],
    }
  }

  componentDidMount() {
    this.getData()
  }

  getData = async () => {
    const { match } = this.props
    const id = match.params.id
    try {
      const saleDetailApi = await SaleApi.getSalaryDetail({ id })
      this.setState({
        saleId: id,
        saleDetail: saleDetailApi.data.detail,
        historyOrderList: saleDetailApi.data.listOrder,
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
    const { saleId } = this.state
    this.setState({
      isLoading: true,
    })
    try {
      await SaleApi.deleteSalary({ listID: [saleId] })
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

  settlementSale = async () => {
    const { saleId } = this.state
    this.setState({
      isLoading: true,
    })
    try {
      const payload = { id: parseInt(saleId) }
      await SaleApi.updatePayment(payload)
      this.setState(
        {
          showModalSettlementSale: false,
        },
        () => this.getData()
      )
      notifySuccess(STRING.settlementSaleSuccess)
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
    return <HeaderPage context={this.props} titleHeader={'Chi tiết quyết toán sale'} />
  }

  renderInfoPersonal = () => {
    const { isLoading, saleDetail } = this.state
    if (!isLoading) {
      return (
        <BaseInfo
          data={saleDetail}
          settlementSale={() =>
            this.setState({
              showModalSettlementSale: true,
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

  renderSaleHistory = () => {
    const { tableHeader, saleDetail } = this.state
    return (
      <div className="box--shadow p-3 row">
        <div className="col-12 col-md-4">
          <h5>{STRING.saleHistory}</h5>
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
              <td>{value?.address || '--'}</td>
              <td>{calculateTotalPerson(value?.children, value?.adult) || '--'}</td>
              <td>
                {' '}
                {value?.checkin_at ? toDateString(value?.checkin_at) : STRING.notUpdate}
                {` - `}
                {value?.checkout_at ? toDateString(value?.checkout_at) : STRING.notUpdate}
              </td>

              <td>{formatMoney(value?.price) || '--'}</td>
              <td>{formatMoney(value?.profit)}</td>
              <td>{`${value?.profit_percent} (%)`}</td>
            </tr>
          ))
        ) : (
          <EmptyData />
        )}
      </tbody>
    )
  }

  render() {
    const { isLoading, isError, confirmModal, showModalSettlementSale } = this.state

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
export default connect(mapStateToProps, mapDispatchToProps)(CustomerDetailScreen)
