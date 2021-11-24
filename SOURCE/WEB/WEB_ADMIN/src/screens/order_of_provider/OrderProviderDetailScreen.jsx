import { Checkbox, Image } from 'antd'
import ConfirmModal from 'components/ConfirmModal'
import EmptyData from 'components/EmptyData'
import HeaderPage from 'components/HeaderPage'
import ModalComponent from 'components/ModalComponent'
import ScreenWrapper from 'components/ScreenWrapper'
import TableData from 'components/TableData'
import { callSocket, getListBank, createNotification } from 'constants/Api'
import {
  CHAT_STATUS,
  ORDER_STATUS,
  ORDER_STATUS_LIST,
  PAYMENT_STATUS_LIST,
  ROLE,
  STRING,
  PAYMENT_STATUS,
  NOTI_TYPE,
} from 'constants/Constant'
import * as OrderProviderApi from 'network/OrderProviderApi'
import * as SaleApi from 'network/SaleApi'
import React from 'react'
import { connect } from 'react-redux'
import { Button, Col, Row } from 'reactstrap'
import { getListOverView } from 'redux/actions'
import socketIOClient from 'socket.io-client'
import { createFormData } from 'utils/createFormData'
import formatMoney from 'utils/formatMoney'
import { formatDateForInput, formatDateTime, toDateString } from 'utils/helper'
import { notifyFail, notifySuccess } from 'utils/notify'
import { handleOrderStatus, handlePaymentStatus } from 'utils/order'
import { resizeFile } from 'utils/resize/resizeFile'
import CustomerList from '../order/components/common/CustomerList'
import CustomerInfo from '../order/components/order_detail_by_book_room/CustomerInfo'
import PaymentOfHomeOwner from '../order/components/order_detail_by_book_room/PaymentOfHomeOwner'
import ScheduleInfo from '../order/components/order_detail_by_book_room/ScheduleInfo'
import './style.css'
const initialModal = {
  money: '',
  price: '',
  bank: {},
  transferImage: '',
  transferImageUrl: '',
  transferSmsUrl: '',
  transferSms: '',
  transferDate: '',
  smsText: '',
  status: '',
  note: '',
}
class OrderProviderDetailScreen extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      customerInfo: {},
      schedulingInfo: {},
      paymentCustomerInfo: {},
      paymentOwnerInfo: {},
      showListCustomer: false,
      listCustomer: [],
      isError: false,
      isLoading: true,
      paymentStatus: '',
      isChecked: false,
      orderId: '',
      orderStatus: '',
      endPaymentAt: '',
      data: {},
      isCheckIn: false,
      isCheckOut: false,
      moneyNotPayForProvider: '',
      orderTransaction: {},
      orderPrice: '',
      orderSurcharges: '',
      tableHeader: [
        {
          header: '',
        },
        {
          header: STRING.numericalOrder,
        },
        {
          header: STRING.amountMoney,
        },
        {
          header: STRING.pileDate,
        },
        {
          header: STRING.transferImage,
        },
        {
          header: STRING.smsMoneyBack,
        },
        {
          header: STRING.smsImageMoneyBack,
        },
        {
          header: 'Trạng thái',
        },
      ],
    }
    this.bankRef = React.createRef()
  }

  componentDidMount() {
    this.listenSocket()
    this.getData()
  }

  listenSocket = () => {
    const providerInfo = JSON.parse(localStorage.getItem('userInfo'))
    var socket = socketIOClient(process.env.REACT_APP_SOCKET, {
      transports: ['websocket'],
    })
    socket.on('newOder', (data) => {
      if (data?.type == CHAT_STATUS.UPDATE_TO_HOMEOWNER && data?.provider_id == providerInfo.id) {
        notifySuccess(data?.content)
        this.getData()
      }
    })
  }

  getData = async () => {
    const payload = {
      order_id: this.props.match.params.id,
    }
    try {
      const orderDetailApi = await OrderProviderApi.getOrderDetail(payload)

      this.setState({
        ...this.state,
        orderId: payload.order_id,
        listCustomer: orderDetailApi.data?.order_customers,
        accompaniedService: formatMoney(parseInt(orderDetailApi.data?.accompanied_service) || 0),
        orderStatus: orderDetailApi.data?.status,
        data: orderDetailApi.data,
        orderPrice: orderDetailApi.data.price,
        customerInfo: {
          customerName: orderDetailApi.data?.customer_name,
          phoneNumber: orderDetailApi.data?.customer_phone,
          address: orderDetailApi.data?.customer_address,
          checkInAt: orderDetailApi.data?.checkin_at,
          checkOutAt: orderDetailApi.data?.checkout_at,
          note: orderDetailApi.data?.note,
          customerList: orderDetailApi.data?.order_customers,
          adult: orderDetailApi.data?.adult,
          children: orderDetailApi.data?.children,
          leadSale: orderDetailApi.data?.sale_leader,
          orderReviews: orderDetailApi.data.order_reviews,
          orderStatus: orderDetailApi.data.status,
          customerId: orderDetailApi.data.customer?.id,
          customerEmail: orderDetailApi.data.customer?.email,
          customerSchedule: orderDetailApi.data.order_histories,
        },
        schedulingInfo: {
          serviceType: STRING.bookRoom,
          roomTypeName: orderDetailApi.data?.service_category_name,
          regionName: orderDetailApi.data?.region_name,
          roomName: orderDetailApi.data?.service_name,
          leadSale: orderDetailApi.data?.sale_leader?.full_name || STRING.notUpdate,
          leadSalePhone: orderDetailApi.data?.sale_leader?.phone || STRING.notUpdate,
          sale: orderDetailApi.data?.sale?.full_name || STRING.notUpdate,
          salePhone: orderDetailApi.data?.sale?.phone || STRING.notUpdate,
          providerName: orderDetailApi.data?.service?.provider?.provider_info?.provider_name || STRING.notUpdate,
          providerPhone: orderDetailApi.data?.service?.provider?.provider_phone || STRING.notUpdate,
          isTour: false,
          orderCode: orderDetailApi.data.code,
          orderStatus: handleOrderStatus(orderDetailApi.data?.status),
          paymentStatus: handlePaymentStatus(orderDetailApi.data?.payment_status),
        },
        paymentOwnerInfo: {
          decisionOfHomeOwner: orderDetailApi.data?.transaction[2]?.order_transactions?.[0] || {},

          depositOfHomeOwner: orderDetailApi.data?.transaction[3]?.order_transactions?.[0] || {},

          moneyLeftToPayOfHomeOwner: orderDetailApi.data?.transaction[4]?.order_transactions?.[0] || {},
        },
        paymentCustomerInfo: {
          payOff: orderDetailApi.data?.payment_status === ORDER_STATUS.FINISHED,
          moneyDecisionCustomer: {
            moneyDecisionCustomer: formatMoney(orderDetailApi?.data?.price) || STRING.notUpdate,
            usePoint: formatMoney(orderDetailApi?.data?.use_point) || STRING.notUpdate,
            totalMoney: formatMoney(orderDetailApi?.data?.price - orderDetailApi?.data?.use_point),
          },
          depositOfCustomer: this.getDepositOfCustomer(orderDetailApi),
          moneyLeftToPayOfCustomer: this.getMoneyLeftToPayOfCustomer(orderDetailApi),
          moneyIncurred: orderDetailApi.data?.transaction[5]?.order_transactions.length ? {} : {},
        },
        customerSchedule: orderDetailApi.data.order_histories,
        orderTransaction: orderDetailApi.data?.transaction,
        orderSurcharges: orderDetailApi.data.order_surcharges,
        isError: false,
        isLoading: false,
      })
    } catch (error) {
      console.log(error, 'error')
      this.setState({
        isError: true,
        isLoading: false,
      })
    }
  }
  calculateMoneyLeftToPayOfCustomer = (response) => {
    //phí phát sinh
    const accompanied_service = +response?.data?.accompanied_service || 0
    //phí trả tại chỗ nhà cung cấp
    const service_charge_include = +response?.data?.service_charge_included || 0
    //đặt cọc
    const dispose = +response?.data?.dispose || 0
    //Tích điểm
    const usePoint = +response?.data?.use_point || 0
    //giá trị đơn hàng
    const price = +response?.data?.price || 0
    const totalMoneyLeftToPay = price + accompanied_service
    const totalMoneyPaid = dispose + service_charge_include
    const amountMoneyLeftToPay = totalMoneyLeftToPay - totalMoneyPaid - usePoint

    return amountMoneyLeftToPay
  }
  getDepositOfCustomer = (response) => {
    let depositOfCustomer = { descriptionPaymentStatus: '' }
    if (response.data?.transaction[0]?.order_transactions.length) {
      depositOfCustomer = { ...response.data?.transaction[0]?.order_transactions?.[0] }
      depositOfCustomer.descriptionPaymentStatus = STRING.partialPile

      depositOfCustomer.paymentHistoryList = response.data?.transaction[0]?.order_transactions?.map((payment) => {
        payment.isSelected = false
        return payment
      })
    } else {
      depositOfCustomer = { ...response.data?.transaction[1]?.order_transactions?.[0] }
      depositOfCustomer.descriptionPaymentStatus = STRING.payOff
      depositOfCustomer.paymentHistoryList = response.data?.transaction[1]?.order_transactions?.map((payment) => {
        payment.isSelected = false
        return payment
      })
    }

    depositOfCustomer.status = handlePaymentStatus(depositOfCustomer.status)
    return depositOfCustomer
  }

  getMoneyLeftToPayOfCustomer = (response) => {
    if (!response.data?.transaction[5]?.order_transactions.length) return {}
    let moneyLeftToPayOfCustomer = { ...response.data?.transaction[5]?.order_transactions[0] }
    moneyLeftToPayOfCustomer.paymentHistoryList = response.data?.transaction[5]?.order_transactions?.map((payment) => {
      payment.isSelected = false
      return payment
    })
    moneyLeftToPayOfCustomer.status = handlePaymentStatus(moneyLeftToPayOfCustomer.status)
    moneyLeftToPayOfCustomer.amountMoney = this.calculateMoneyLeftToPayOfCustomer(response)

    return moneyLeftToPayOfCustomer
  }

  changeOrderStatus = async () => {
    const { orderId, isCheckIn, isCheckOut, customerInfo } = this.state
    let msgFail = ''
    let isSuccess = false
    let msgNoti = ''
    try {
      this.setState({
        isLoading: true,
      })
      let payload
      let msgSuccess = ''
      if (isCheckIn) {
        payload = {
          order_id: orderId,
          status: ORDER_STATUS.CHECK_IN,
        }
        msgSuccess = 'Check in thành công!'
        msgFail = 'Check in thất bại!'
        msgNoti = 'Đơn hàng của bạn đã được check-in!'
      }
      if (isCheckOut) {
        payload = {
          order_id: orderId,
          status: ORDER_STATUS.CHECK_OUT,
        }
        msgSuccess = 'Check out thành công!'
        msgFail = 'Check out thất bại!'
        msgNoti = 'Đơn hàng của bạn đã được check-out!'
      }

      await OrderProviderApi.updateStatus(payload)
      notifySuccess(msgSuccess)
      isSuccess = true
      this.setState(
        {
          isLoading: false,
          isCheckIn: false,
          isCheckOut: false,
        },
        () => this.getData()
      )
    } catch (error) {
      this.setState({
        isLoading: false,
        isCheckIn: false,
        isCheckOut: false,
      })
      notifyFail(msgFail)
      console.error(error)
    }
    if (isSuccess) {
      try {
        const payload = {
          type: CHAT_STATUS.CHECK_IN_OR_CHECK_OUT,
          content: msgNoti,
          user_id: +customerInfo?.customerId,
        }

        callSocket(payload)
          .then(() => {})
          .catch((error) => {})

        await createNotification({
          order_id: orderId,
          type: 2,
          content: msgNoti,
          metaData: {
            order_id: orderId,
            type_noti: NOTI_TYPE.ORDER_DETAIL_BOOK_ROOM,
          },
          type_noti: CHAT_STATUS.CHECK_IN_OR_CHECK_OUT,
        })
      } catch (error) {
        console.log(error)
      }
    }
  }

  renderHeader = () => {
    const { data, listCustomer } = this.state
    const STATUS_SHOW_CHECKIN = [ORDER_STATUS.SALE_CONFIRMED, ORDER_STATUS.CHECK_OUT]

    const showCheckIn =
      (STATUS_SHOW_CHECKIN.includes(data.status) && data.payment_status == PAYMENT_STATUS.CAN_CHECK_IN) ||
      data.enable_checkin == 1

    const showCheckOut =
      data.status == ORDER_STATUS.CHECK_IN &&
      data.payment_status == PAYMENT_STATUS.SUCCESS_ALL &&
      data.enable_checkout == 1

    return (
      <HeaderPage context={this.props} titleHeader={STRING.orderDetail}>
        {showCheckIn && (
          <Button
            className="mr-0 mb-0"
            color="primary"
            disabled={!listCustomer.length}
            onClick={() =>
              this.setState({
                isCheckIn: true,
              })
            }
          >
            Check-in
          </Button>
        )}
        {showCheckOut && (
          <Button
            className="mr-0 mb-0"
            color="primary"
            onClick={() =>
              this.setState({
                isCheckOut: true,
              })
            }
          >
            Check-out
          </Button>
        )}
      </HeaderPage>
    )
  }

  renderCustomerInfo = () => {
    const { customerInfo } = this.state
    return (
      <CustomerInfo
        customerInfo={customerInfo}
        handleShowListCustomer={() =>
          this.setState({
            showListCustomer: true,
          })
        }
      />
    )
  }

  renderSchedulingInformation = () => {
    const { schedulingInfo, paymentCustomerInfo } = this.state
    return (
      <ScheduleInfo
        isProvider={true}
        hiddenBtn={true}
        schedulingInfo={schedulingInfo}
        paymentCustomerInfo={paymentCustomerInfo}
        handleShowModal={() => {
          this.setState({
            showModalUpdateOrderPrice: true,
          })
        }}
      />
    )
  }

  paymentInfo = () => {
    return (
      <Row>
        {this.paymentOfCustomer()}
        {/* {this.paymentOfSupplier()} */}
      </Row>
    )
  }

  paymentOfCustomer = () => {
    const tableHeader = [
      {
        header: 'Ngày check-in',
      },
      {
        header: 'Ngày check-out',
      },
      {
        header: 'Giá bán',
      },
      {
        header: 'Phát sinh bán',
      },
      {
        header: 'Tiền Oho đã cọc',
      },
      {
        header: 'Oho cần thanh toán',
      },
      {
        header: 'Tự thu',
      },
      {
        header: 'Oho đã thanh toán',
      },
    ]
    return (
      <Col sm="12" className="px-2 mb-3">
        <Col className="box--shadow p-3">
          <Row className="mb-3">
            <h5 className="text-primary">Thông tin thanh toán</h5>
          </Row>
          <table className="table table-bordered table-striped table-responsive-sm">
            <TableData tableHeader={tableHeader} />
            {this.renderTableData()}
          </table>
        </Col>
      </Col>
    )
  }

  paymentOfSupplier = () => {
    const { paymentOwnerInfo, paymentCustomerInfo, moneyNotPayForProvider } = this.state
    return (
      <PaymentOfHomeOwner
        moneyNotPayForProvider={moneyNotPayForProvider}
        paymentOwnerInfo={paymentOwnerInfo}
        paymentCustomerInfo={paymentCustomerInfo}
        hiddenButton={true}
      />
    )
  }

  renderTableData = () => {
    const { customerSchedule, orderTransaction, orderPrice, orderSurcharges, payment_provider_at } = this.state
    // const moneyLeft =
    //   (orderTransaction?.[2]?.order_transactions?.[0]?.amount || 0) -
    //   ((orderTransaction?.[3]?.order_transactions?.[0]?.amount || 0) +
    //     (orderTransaction?.[4]?.order_transactions?.[0]?.amount || 0))
    // (tự thu)
    // let paidPayment = 0
    let surcharge = 0,
      moneySelf = 0,
      moneyLeft = 0
    if (orderSurcharges?.length) {
      orderSurcharges.forEach((item) => {
        if (item.amount !== null) {
          surcharge += item.amount
        }
      })
    }

    if (orderTransaction?.[5]?.order_transactions?.length) {
      orderTransaction[5].order_transactions.forEach((e) => {
        if (e?.is_epay !== 1 && e?.status === 2 && e?.amount !== null) {
          moneySelf += e?.amount
        }
        // if (e.amount !== null) sumPayment += e?.amount
      })
    }

    let sumPaymentLast = 0
    if (orderTransaction?.[4]?.order_transactions && orderTransaction?.[3]?.order_transactions) {
      const arr = [...orderTransaction[4].order_transactions, ...orderTransaction[3].order_transactions]
      arr.forEach((e) => {
        sumPaymentLast += e?.amount
        // if (e.amount !== null) sumPayment += e?.amount
      })
    }

    const ohoMoneyNeedPaid =
      orderTransaction?.[2]?.order_transactions?.[0]?.amount + surcharge - (sumPaymentLast + moneySelf)

    return (
      <tbody>
        <tr>
          {/* <td>{index + 1}</td> */}
          {/* <td>{customerSchedule?.[0]?.value?.status === ORDER_STATUS.CHECK_IN ? 'Check-in' : 'Check-out'}</td> */}
          <td>{customerSchedule?.[0]?.created_at ? toDateString(customerSchedule?.[0]?.created_at) : '--'}</td>
          <td>{customerSchedule?.[1]?.created_at ? toDateString(customerSchedule?.[1]?.created_at) : '--'}</td>
          <td>
            {orderTransaction?.[2]?.order_transactions?.[0]?.amount
              ? formatMoney(orderTransaction?.[2]?.order_transactions?.[0]?.amount)
              : '--'}
          </td>
          <td>{formatMoney(surcharge || 0)}</td>

          <td>
            {orderTransaction?.[3]?.order_transactions?.[0]?.amount
              ? formatMoney(orderTransaction?.[3]?.order_transactions?.[0]?.amount)
              : '--'}
          </td>
          <td>{payment_provider_at ? formatMoney(0) : ohoMoneyNeedPaid >= 0 ? formatMoney(ohoMoneyNeedPaid) : '--'}</td>
          <td>{orderTransaction?.[5]?.order_transactions?.length ? formatMoney(moneySelf || 0) : '--'}</td>
          {/* <td>{sumPaymentLast ? formatMoney(sumPaymentLast) : '--'}</td> */}
          <td>
            {payment_provider_at
              ? formatMoney((orderTransaction?.[2]?.order_transactions?.[0]?.amount || 0) + (surcharge || 0))
              : sumPaymentLast
              ? formatMoney(sumPaymentLast)
              : '--'}
          </td>
        </tr>
        {/* || (
        <EmptyData />) */}
      </tbody>
    )
  }

  renderConfirmModal = () => {
    const { isCheckIn, isCheckOut } = this.state
    return (
      <ConfirmModal
        isOpen={isCheckIn || isCheckOut}
        onHide={() =>
          this.setState({
            isCheckIn: false,
            isCheckOut: false,
          })
        }
        title={isCheckIn ? ' check-in' : ' check-out'}
        action={this.changeOrderStatus}
      />
    )
  }

  renderModalCustomerList = () => {
    const { showListCustomer, listCustomer } = this.state
    return (
      <CustomerList
        listCustomer={listCustomer}
        visible={showListCustomer}
        onHideModal={() =>
          this.setState({
            showListCustomer: false,
          })
        }
      />
    )
  }

  renderModal = () => {
    return (
      <>
        {this.renderModalCustomerList()}
        {this.renderConfirmModal()}
      </>
    )
  }

  render() {
    const { isLoading, isError } = this.state
    return (
      <ScreenWrapper
        detail={true}
        context={this.props}
        isError={isError}
        isLoading={isLoading}
        titleHeader={STRING.orderDetail}
        renderHeader={this.renderHeader}
      >
        <Row className="mb-4 p-2">
          <div className="col-12 py-3 row box--shadow mx-auto">
            <h5 className="d-block text-primary pl-4 mb-1" style={{ width: '100%' }}>
              {STRING.schedulingInformation}
            </h5>
            {this.renderCustomerInfo()}
            {this.renderSchedulingInformation()}
          </div>
        </Row>
        {this.renderModal()}
        {this.paymentInfo()}
      </ScreenWrapper>
    )
  }
}

const mapDispatchToProps = {}

export default connect(null, mapDispatchToProps)(OrderProviderDetailScreen)
