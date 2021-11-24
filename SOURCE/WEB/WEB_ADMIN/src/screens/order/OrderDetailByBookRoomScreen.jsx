import { Checkbox, Image } from 'antd'
import ConfirmModal from 'components/ConfirmModal'
import EmptyData from 'components/EmptyData'
import HeaderPage from 'components/HeaderPage'
import ModalComponent from 'components/ModalComponent'
import ScreenWrapper from 'components/ScreenWrapper'
import TableData from 'components/TableData'
import { callSocket, getListBank, createNotification } from 'constants/Api'
import {
  ACCEPT_TYPE,
  CHAT_STATUS,
  NOTI_TYPE,
  ORDER_STATUS,
  ORDER_STATUS_LIST,
  PAYMENT_STATUS_LIST,
  ROLE,
  STRING,
  TRANSACTION_STATUS,
  TYPE_INPUT,
  PAYMENT_STATUS,
} from 'constants/Constant'
import * as FilterApi from 'network/FilterApi'
import * as OrderApi from 'network/OrderApi'
import * as SaleApi from 'network/SaleApi'
import React from 'react'
import { connect } from 'react-redux'
import { Button, Col, Row } from 'reactstrap'
import { getListOverView } from 'redux/actions'
import socketIOClient from 'socket.io-client'
import { createFormData } from 'utils/createFormData'
import formatMoney from 'utils/formatMoney'
import formatNumber from 'utils/formatNumber'
import formatPrice from 'utils/formatPrice'
import { formatDateForInput, formatDateTime, toDateString, validateForm } from 'utils/helper'
import playSound from 'utils/notification_sound'
import { notifyFail, notifySuccess } from 'utils/notify'
import { handleOrderStatus, handlePaymentStatus } from 'utils/order'
import { resizeFile } from 'utils/resize/resizeFile'
import { object } from 'yup/lib/locale'
import CustomerList from './components/common/CustomerList'
import CustomerInfo from './components/order_detail_by_book_room/CustomerInfo'
import DepositOfCustomer from './components/order_detail_by_book_room/DepositOfCustomer'
import MoneyDecisionOfCustomer from './components/order_detail_by_book_room/MoneyDecisionOfCustomer'
import MoneyLeftToPayOfCustomer from './components/order_detail_by_book_room/MoneyLeftToPayOfCustomer'
import PaymentOfHomeOwner from './components/order_detail_by_book_room/PaymentOfHomeOwner'
import ScheduleInfo from './components/order_detail_by_book_room/ScheduleInfo'
import Surcharges from './components/order_detail_by_book_room/Surcharges'
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
class OrderDetailByTourScreen extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      customerInfo: {},
      schedulingInfo: {},
      paymentCustomerInfo: {},
      paymentOwnerInfo: {},
      showModalSwitchSale: false,
      assignSaleModal: false,
      saleId: '',
      listLeadSale: [],
      listSale: [],
      updateDepositOfCustomer: false,
      updatePaymentOfCustomer: false,
      createPaymentOfCustomer: false,
      showModalUpdateDecisionOfHomeOwner: false,
      showModalUpdateDepositOfHomeOwner: false,
      showModalKeepOrderForCustomer: false,
      showModalAllowCheckIn: false,
      showModalUpdateMoneyLeftToPayOfHomeOwner: false,
      showModalUpdateOrderPrice: false,
      showModalAllowDeposit: false,
      showListCustomer: false,
      listCustomer: [],
      listSurcharges: [],
      confirmModalPayOff: false,
      showModalUpdateSurcharges: false,
      createSurcharges: false,
      confirmModalResetPayment: false,
      sumDeposit: '',
      accompaniedService: '',
      modal: initialModal,
      validateError: {
        moneyError: '',
        priceError: '',
        bankError: '',
        smsTextError: '',
      },
      modalSurcharges: {
        id: null,
        price: '',
        note: '',
        amount: '',
      },
      modalSwitchSale: {
        leadSaleId: '',
        saleId: '',
      },
      modalOrderPrice: {
        price: '',
        child: '',
        adult: '',
      },
      isError: false,
      isLoading: true,
      transportStatus: '',
      paymentStatus: '',
      showModalInfoTransport: false,
      transportStatusList: ORDER_STATUS_LIST,
      paymentStatusList: PAYMENT_STATUS_LIST,
      showModalInfoPayment: false,
      moneyNotPayOfCustomer: '',
      moneyNotPayForProvider: '',
      isChecked: false,
      orderId: '',
      orderStatus: '',
      endPaymentAt: '',
      orderPrice: '',
      listOptionBank: [],
      idDeposit: '',
      isRequestPayment: '',
      payment_provider_at: '',
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
          header: 'note',
        },
        {
          header: 'Trạng thái',
        },
      ],
    }
    this.bankRef = React.createRef()
    this.moneyRef = React.createRef()
  }

  componentDidMount() {
    this.getListSale()
    // only admin can call getListLeadSale
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    if (userInfo?.role.id === ROLE.ADMIN) {
      this.getListLeadSale()
    }
    this.listenSocket()
    this.getData()
  }

  getListBankConfig = async (searchBank) => {
    try {
      const res = await getListBank(searchBank)
      this.setState({
        listOptionBank: res.data.map((item) => this.getTemplateItemAutocomplete(item)),
      })
    } catch (error) {
      console.log(error)
    }
  }

  getTemplateItemAutocomplete = (item) => {
    if (typeof item !== 'object') return {}
    return {
      value: `${item?.name} (${item?.account} - ${item?.seri_number})`,
      label: `${item?.name} (${item?.account} - ${item?.seri_number})`,
      account: item?.account,
      seri_number: item?.seri_number,
      code: item?.id,
      name: item?.name,
    }
  }

  onSearch = (searchText) => {
    if (!searchText) {
      clearTimeout(this.bankRef.current)
      this.setState({
        listOptionBank: [],
      })
      return
    }

    if (this.bankRef.current) {
      clearTimeout(this.bankRef.current)
    }

    this.bankRef.current = setTimeout(() => {
      if (searchText) {
        this.getListBankConfig(searchText)
      }
    }, 300)
  }

  onSelect = (data, option) => {
    this.setState({
      modal: {
        ...this.state.modal,
        bank: option,
      },
    })
  }

  onChange = (data) => {
    this.setState({
      modal: {
        ...this.state.modal,
        bank: {
          value: data,
        },
      },
    })
  }

  listenSocket = () => {
    var socket = socketIOClient(process.env.REACT_APP_SOCKET, {
      transports: ['websocket'],
    })

    socket.on('newOder', (data) => {
      if (
        (data?.type == CHAT_STATUS.DEPOSIT_CUSTOMER || data?.type == CHAT_STATUS.PAYMENT_CUSTOMER) &&
        data?.order_id == this.props.match.params.id
      ) {
        // notifySuccess(data.content)
        // playSound()
        this.getData()
      }
    })
  }

  listenLocationChange = () => {
    // const { orderId } = this.state
    // if (orderId !== this.props.match.params.id) {
    //   this.getData()
    // }
  }

  getData = async () => {
    const payload = {
      order_id: this.props.match.params.id,
    }
    try {
      const orderDetailApi = await OrderApi.getOrderBookRoomDetail(payload)
      let sumDeposit = 0
      const arr = [
        ...orderDetailApi.data.transaction[0].order_transactions,
        ...orderDetailApi.data.transaction[1].order_transactions,
      ]
      arr.forEach((item) => {
        if (item.status === 2) {
          sumDeposit += item.amount
        }
      })

      this.setState({
        ...this.state,
        orderId: this.props.match.params.id,
        isRequestPayment: orderDetailApi.data?.is_request_payment,
        payment_provider_at: orderDetailApi.data?.payment_provider_at,
        listCustomer: orderDetailApi.data?.order_customers,
        paymentStatus: orderDetailApi.data?.payment_status,
        accompaniedService: formatMoney(parseInt(orderDetailApi.data?.accompanied_service) || 0),
        moneyNotPayForProvider: orderDetailApi.data?.payment_provider_at
          ? this.calculateMoneyNotPayForProvider(orderDetailApi.data)
          : 0,
        orderStatus: orderDetailApi.data?.status,
        orderPrice: +orderDetailApi?.data?.price - +orderDetailApi?.data?.use_point || 0,
        listSurcharges: orderDetailApi.data?.order_surcharges.map((surcharges) => {
          surcharges.isSelected = false
          return surcharges
        }),
        moneyNotPayOfCustomer: formatNumber(this.calculateMoneyLeftToPayOfCustomer(orderDetailApi)?.toString() || '0'),
        modalOrderPrice: {
          price: orderDetailApi?.data.price ? formatNumber(orderDetailApi?.data.price?.toString()) : '',
          child: orderDetailApi?.data.children,
          adult: orderDetailApi?.data.adult,
        },
        modal: {
          ...this.state.modal,
          payOff: !orderDetailApi.data?.transaction[0]?.order_transactions.length,
        },
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
          providerId: orderDetailApi.data?.provider_id,
          providerPhone: orderDetailApi.data?.service?.provider?.provider_phone || STRING.notUpdate,
          isTour: false,
          orderCode: orderDetailApi.data?.code,
          orderStatus: handleOrderStatus(orderDetailApi.data?.status),
          paymentStatus: handlePaymentStatus(orderDetailApi.data?.payment_status),
        },
        //check if deposit is not update then we take endPaymentAt to calculator unblock for user
        endPaymentAt: orderDetailApi?.data?.end_payment_at,
        paymentCustomerInfo: {
          payOff: orderDetailApi.data?.payment_status === ORDER_STATUS.FINISHED,
          moneyDecisionCustomer: {
            moneyDecisionCustomer: formatMoney(orderDetailApi?.data?.price) || STRING.notUpdate,
            usePoint: formatMoney(orderDetailApi?.data?.use_point) || STRING.notUpdate,
            totalMoney: formatMoney(orderDetailApi?.data?.price - orderDetailApi?.data?.use_point),
          },
          depositOfCustomer: this.getDepositOfCustomer(JSON.parse(JSON.stringify(orderDetailApi))),
          moneyLeftToPayOfCustomer: this.getMoneyLeftToPayOfCustomer(orderDetailApi),
          moneyIncurred: orderDetailApi.data?.transaction[5]?.order_transactions.length ? {} : {},
        },
        paymentOwnerInfo: {
          decisionOfHomeOwner: orderDetailApi.data?.transaction[2]?.order_transactions?.[0] || {},

          depositOfHomeOwner: orderDetailApi.data?.transaction[3]?.order_transactions?.[0] || {},

          moneyLeftToPayOfHomeOwner: orderDetailApi.data?.transaction[4]?.order_transactions?.[0] || {},
        },
        sumDeposit: sumDeposit,
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

  getDepositOfCustomer = (response) => {
    let depositOfCustomer = { descriptionPaymentStatus: '' }
    // if (response.data?.transaction[0]?.order_transactions.length) {
    // depositOfCustomer = { ...response.data?.transaction[0]?.order_transactions?.[0] }
    // depositOfCustomer.descriptionPaymentStatus = STRING.partialPile

    // depositOfCustomer.paymentHistoryList =
    //   response.data?.transaction[0]?.order_transactions?.map((payment) => {
    //     payment.isSelected = false
    //     return payment
    //   }) || []
    // } else {
    // depositOfCustomer = { ...response.data?.transaction[1]?.order_transactions?.[0] }
    depositOfCustomer.descriptionPaymentStatus = STRING.payOff
    depositOfCustomer.amount = 0

    depositOfCustomer.paymentHistoryList = [
      ...(response.data?.transaction[0]?.order_transactions?.map((payment) => {
        payment.isSelected = false
        return payment
      }) || []),
      ...(response.data?.transaction[1]?.order_transactions?.map((payment) => {
        payment.isSelected = false
        return payment
      }) || []),
    ]

    if (depositOfCustomer.paymentHistoryList?.length) {
      depositOfCustomer.paymentHistoryList.forEach((deposit) => {
        if (deposit.status === 2 && deposit.amount !== null) {
          depositOfCustomer.amount += deposit.amount
        }
      })
    }
    // }

    depositOfCustomer.status = handlePaymentStatus(depositOfCustomer.status)
    return depositOfCustomer
  }

  handleAllowDeposit = async () => {
    const { orderId, customerInfo } = this.state
    this.setState({
      isLoading: true,
    })
    let isSuccess = false
    try {
      await OrderApi.changePaymentStatus({
        order_id: +orderId,
        payment_status: 5,
      })
      notifySuccess('Cho phép đặt cọc thành công!')
      this.setState(
        {
          showModalAllowDeposit: false,
        },
        () => this.getData()
      )
      isSuccess = true
    } catch (error) {
      this.setState({
        isLoading: false,
      })
      notifyFail('Cho phép đặt cọc thất bại!')
      console.log(error)
    }
    if (isSuccess) {
      try {
        const payload = {
          type: CHAT_STATUS.ALLOW_DEPOSIT,
          content: 'Đơn hàng của bạn có thể đặt cọc!',
          user_id: +customerInfo?.customerId,
        }
        callSocket(payload)
          .then(() => {})
          .catch((error) => {})
        await createNotification({
          order_id: orderId,
          type: 2,
          content: 'Đơn hàng của bạn có thể đặt cọc!',
          metaData: {
            order_id: orderId,
            user_id: +customerInfo?.customerId,
            type_noti: NOTI_TYPE.ORDER_DETAIL_BOOK_ROOM,
          },
          type_noti: CHAT_STATUS.ALLOW_DEPOSIT,
        })
      } catch (error) {
        console.log(error)
      }
    }
  }

  handleKeepOrder = async () => {
    const { orderId, customerInfo } = this.state
    let isSuccess = false
    this.setState({
      isLoading: true,
    })
    try {
      await OrderApi.changePaymentStatus({
        order_id: +orderId,
        payment_status: 6,
      })
      notifySuccess('Giữ chỗ cho khách thành công!')
      this.setState(
        {
          showModalKeepOrderForCustomer: false,
        },
        () => this.getData()
      )
      isSuccess = true
    } catch (error) {
      this.setState({
        isLoading: false,
      })
      notifyFail('Giữ chỗ cho khách thất bại!')
      console.log(error)
    }
    if (isSuccess) {
      const payload = {
        type: CHAT_STATUS.KEEP_ORDER,
        content: '',
        user_id: +customerInfo?.customerId,
      }
      await callSocket(payload)
    }
  }

  handleAllowCheckIn = async () => {
    const { orderId, customerInfo } = this.state
    let isSuccess = false
    this.setState({
      isLoading: true,
    })
    try {
      await OrderApi.changePaymentStatus({
        order_id: +orderId,
        payment_status: 7,
      })
      notifySuccess('Cho phép check-in thành công!')
      this.setState(
        {
          showModalAllowCheckIn: false,
        },
        () => this.getData()
      )
      isSuccess = true
    } catch (error) {
      this.setState({
        isLoading: false,
      })
      notifyFail('Cho phép check-in thất bại!')
      console.log(error)
    }
    if (isSuccess) {
      const payload = {
        type: CHAT_STATUS.CAN_CHECK_IN,
        content: 'Chúng tôi đã nhận đủ tiền của bạn!',
        user_id: +customerInfo?.customerId,
      }
      callSocket(payload)
        .then(() => {})
        .catch((error) => {})
      await createNotification({
        order_id: orderId,
        type: 2,
        content: 'Chúng tôi đã nhận đủ tiền của bạn!',
        metaData: {
          order_id: orderId,
        },
        type_noti: CHAT_STATUS.CAN_CHECK_IN,
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

  calculateMoneyNotPayForProvider = (response) => {
    let money = 0
    if (response?.order_surcharges?.length) {
      response.order_surcharges.forEach((surcharge) => {
        money += surcharge.amount
      })
    }
    let selfCollectedAmount = 0
    if (response?.transaction[5].order_transactions?.length) {
      response.transaction[5].order_transactions.forEach((item) => {
        if (item?.status === 2 && item?.is_epay === 0) {
          selfCollectedAmount += item?.amount
        }
      })
    }

    const moneyLeftToPay =
      (response?.transaction[2].order_transactions?.[0]?.amount || 0) +
      money -
      ((response?.transaction[3].order_transactions?.[0]?.amount || 0) + selfCollectedAmount)

    return moneyLeftToPay
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

  getListLeadSale = async () => {
    try {
      const listLeadSaleApi = await FilterApi.getListLeadSale()
      this.setState({
        ...this.state,
        listLeadSale: listLeadSaleApi.data,
      })
    } catch (error) {
      console.log(error)
    }
  }

  getListSale = async () => {
    try {
      const listSaleApi = await SaleApi.getListSale()
      this.setState({
        ...this.state,
        listSale: listSaleApi.data,
      })
    } catch (error) {
      console.log(error)
    }
  }

  changeOrderStatus = async () => {
    const { orderId } = this.state
    try {
      this.setState({
        isLoading: true,
      })

      const payload = {
        order_id: orderId,
        status: -1,
      }

      await OrderApi.changeOrderStatus(payload)
      notifySuccess('Hủy đơn hàng thành công!')
      this.props.history.goBack()
    } catch (error) {
      this.setState({
        isLoading: false,
      })
      notifyFail('Hủy đơn hàng thất bại!')
      console.log(error)
    }
  }

  assignSale = async () => {
    const { saleId, orderId, customerInfo } = this.state
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    let isSuccess = false
    try {
      this.setState({
        isLoading: true,
      })

      const payload = {
        order_id: orderId,
        asign_to: saleId,
      }
      await OrderApi.assignSale(payload)
      isSuccess = true
      this.setState(
        {
          saleId: '',
          assignSaleModal: false,
        },
        () => this.getData()
      )
      notifySuccess('Chỉ định thành công!')
    } catch (error) {
      this.setState({
        isLoading: false,
      })
      notifyFail('Chỉ định thất bại!')
      console.log(error)
    }
    if (isSuccess) {
      if (userInfo?.role.id === ROLE.ADMIN) {
        try {
          const payload = {
            type: CHAT_STATUS.SALE_LEADER_CONFIRMED,
            content: 'Đơn hàng của bạn đã được duyệt!',
            user_id: +customerInfo?.customerId,
            sale_id: +saleId,
          }
          callSocket(payload)
            .then(() => {})
            .catch((error) => {})

          // await createNotification({
          //   order_id: orderId,
          //   type: 1,
          //   content: 'Đơn hàng của bạn đã được duyệt!',
          //   metaData: {
          //     order_id: orderId,
          //     type_noti: NOTI_TYPE.ORDER_DETAIL_BOOK_ROOM,
          //   },
          //   type_noti: CHAT_STATUS.SALE_LEADER_CONFIRMED,
          // })

          await createNotification({
            order_id: orderId,
            type: 2,
            content: 'Đơn hàng của bạn đã được duyệt!',
            metaData: {
              order_id: orderId,
            },
            type_noti: CHAT_STATUS.SALE_LEADER_CONFIRMED,
          })
        } catch (error) {
          console.log(error)
        }
      }
    }
  }

  updateOfCustomer = async () => {
    const { customerInfo } = this.state
    if (this.state.orderStatus < ORDER_STATUS.CHANGE_TO_SALE_LEADER) {
      notifyFail('Bạn cần chỉ định cho saleLeader để thực hiện các chức năng')
      return
    }
    let isSuccess = false

    const { updateDepositOfCustomer, paymentCustomerInfo, createPaymentOfCustomer, updatePaymentOfCustomer, orderId } =
      this.state
    const { money, bank, transferImage, transferSms, smsText, status, note } = this.state.modal
    try {
      let data
      if (updateDepositOfCustomer || updatePaymentOfCustomer) {
        if (parseInt(status) !== ORDER_STATUS.REJECTED) {
          if (!bank?.code || !bank?.value) {
            notifyFail('Vui lòng chọn tài khoản ngân hàng!')
            return
          }
        }
      }
      if (parseInt(status) == ORDER_STATUS.REJECTED) {
        data = {
          status: status ? parseInt(status) : null,
          note,
        }
      } else {
        data = {
          amount: formatPrice(money),
          status: status ? parseInt(status) : null,
          sms: smsText,
          bank_id: bank?.code,
          bank: bank?.value,
          transfer: transferImage,
          transfer_sms: transferSms,
          note: note || '',
        }
      }

      this.setState({
        isLoading: true,
      })
      if (updateDepositOfCustomer) {
        // data.id = paymentCustomerInfo?.depositOfCustomer?.id
        data.id = this.state.idDeposit
        const payload = createFormData(data)

        await OrderApi.updateTransaction(payload)
        //call socket when update or refuse

        isSuccess = true
        // isSuccess = true
      } else if (updatePaymentOfCustomer) {
        data.id = paymentCustomerInfo?.moneyLeftToPayOfCustomer?.id
        const payload = createFormData(data)
        await OrderApi.updateTransaction(payload)
        isSuccess = true

        // isSuccess = true
      } else {
        data.order_id = orderId
        data.df_order_transaction_type_id = TRANSACTION_STATUS.MONEY_LEFT_TO_PAY_CUSTOMER
        data.epay = 0
        const payload = createFormData(data)
        await OrderApi.createTransaction(payload)
      }
      this.setState(
        {
          updatePaymentOfCustomer: false,
          updateDepositOfCustomer: false,
          createPaymentOfCustomer: false,
          modal: initialModal,
        },
        () => this.getData()
      )

      notifySuccess('Thành công!')
    } catch (error) {
      this.setState({
        isLoading: false,
      })
      notifyFail('Cập nhật thất bại!')
      console.log(error)
    }
    if (isSuccess) {
      await callSocket({
        type: CHAT_STATUS.UPDATE_CUSTOMER,
        content: '',
        user_id: +customerInfo?.customerId,
      })
    }
  }

  updateOfHomeOwner = async () => {
    const { showModalUpdateDecisionOfHomeOwner, showModalUpdateDepositOfHomeOwner, paymentOwnerInfo, orderId } =
      this.state

    const { money, bank, transferImage, transferSms, smsText, status, price } = this.state.modal
    let isSuccess = false
    try {
      const data = {
        order_id: orderId,
        amount: formatPrice(money),

        status,
        sms: smsText,
        bank: bank,
        transfer: transferImage,
        transfer_sms: transferSms,
      }

      this.setState({
        isLoading: true,
      })

      if (showModalUpdateDecisionOfHomeOwner) {
        data.id = paymentOwnerInfo?.decisionOwner?.id

        if (data.id) {
          const payload = createFormData(data)
          await OrderApi.updateTransaction(payload)
          notifySuccess('Cập nhật thành công!')
        } else {
          data.price = formatPrice(price)
          data.df_order_transaction_type_id = TRANSACTION_STATUS.DECISION_CUSTOMER
          const payload = createFormData(data)
          await OrderApi.createTransaction(payload)
          notifySuccess('Tạo thành công!')
        }
      } else if (showModalUpdateDepositOfHomeOwner) {
        data.id = paymentOwnerInfo?.depositOfHomeOwner?.id
        if (data.id) {
          const payload = createFormData(data)
          await OrderApi.updateTransaction(payload)
          notifySuccess('Cập nhật thành công!')
        } else {
          data.df_order_transaction_type_id = TRANSACTION_STATUS.DEPOSIT_HOME_OWNER
          const payload = createFormData(data)
          await OrderApi.createTransaction(payload)
          notifySuccess('Tạo thành công!')
        }
      } else {
        data.id = paymentOwnerInfo?.moneyLeftToPayOfHomeOwner?.id

        if (data.id) {
          const payload = createFormData(data)
          await OrderApi.updateTransaction(payload)
          notifySuccess('Cập nhật thành công!')
        } else {
          data.df_order_transaction_type_id = TRANSACTION_STATUS.MONEY_LEFT_TO_PAY_HOME_OWNER
          const payload = createFormData(data)
          await OrderApi.createTransaction(payload)
          notifySuccess('Tạo thành công!')
        }
      }
      this.setState(
        {
          showModalUpdateDecisionOfHomeOwner: false,
          showModalUpdateDepositOfHomeOwner: false,
          showModalUpdateMoneyLeftToPayOfHomeOwner: false,
          modal: initialModal,
        },
        () => this.getData()
      )
      isSuccess = true
    } catch (error) {
      this.setState({
        isLoading: false,
      })
      notifyFail('Cập nhật thất bại!')
      console.log(error)
    }
    if (isSuccess) {
      const payload = {
        type: CHAT_STATUS.UPDATE_TO_HOMEOWNER,
        content: `Đơn hàng ${this.state.schedulingInfo.orderCode} đã được cập nhật`,
        provider_id: +this.state.schedulingInfo?.providerId,
      }
      callSocket(payload)
        .then(() => {})
        .catch((error) => {})
      await createNotification({
        order_id: orderId,
        type: 3,
        content: `Đơn hàng ${this.state.schedulingInfo.orderCode} đã được cập nhật!`,
        metaData: {
          order_id: orderId,
          type_noti: NOTI_TYPE.ORDER_DETAIL_BOOK_ROOM,
        },
        type_noti: CHAT_STATUS.UPDATE_TO_HOMEOWNER,
      })
    }
  }

  updateOrderPrice = async () => {
    const { price, adult, child } = this.state.modalOrderPrice
    const { orderId } = this.state
    let isSuccess = false
    const payload = {
      order_id: orderId,
      price: formatPrice(price),
      adult,
      child,
    }

    this.setState({
      isLoading: true,
    })

    try {
      await OrderApi.updatePrice(payload)
      this.setState(
        {
          showModalUpdateOrderPrice: false,
        },
        () => this.getData()
      )
      isSuccess = true
      notifySuccess('Cập nhật giá trị đơn hàng thành công!')
    } catch (error) {
      this.setState({
        isLoading: false,
      })
      notifyFail('Cập nhật giá trị đơn hàng thất bại!')
    }
    if (isSuccess) {
      const payload = {
        type: CHAT_STATUS.ORDER_PRICE,
        content: 'Giá trị đơn hàng của bạn đã được cập nhật',
        user_id: +this.state.customerInfo?.customerId,
      }
      callSocket(payload)
        .then(() => {})
        .catch((error) => {})
      await createNotification({
        order_id: orderId,
        type: 2,
        content: `Giá trị đơn hàng của bạn đã được cập nhật!`,
        metaData: {
          order_id: orderId,
          user_id: +this.state.customerInfo?.customerId,
        },
        type_noti: CHAT_STATUS.ORDER_PRICE,
      })
    }
  }

  createOrUpdateSurcharges = async () => {
    const { createSurcharges, orderId } = this.state
    const { price, note, id, amount } = this.state.modalSurcharges
    const payload = {
      order_id: orderId,
      price: formatPrice(price),
      note: note || '',
      amount: formatPrice(amount),
    }

    this.setState({
      isLoading: true,
    })

    try {
      if (createSurcharges) {
        await OrderApi.createSurcharges(payload)
        notifySuccess('Tạo thành công!')
      } else {
        payload.id = id
        await OrderApi.updateSurcharges(payload)
        notifySuccess('Cập nhật thành công!')
      }
      this.setState(
        {
          createSurcharges: false,
          showModalUpdateSurcharges: false,
          modalSurcharges: {
            id: '',
            price: '',
            note: '',
            amount: '',
          },
        },
        () => this.getData()
      )
    } catch (error) {
      this.setState({
        isLoading: false,
      })

      console.log(error)
    }
  }

  confirmResetPayment = async () => {
    const { orderId } = this.state
    try {
      this.setState({
        isLoading: true,
      })
      await OrderApi.resetPaymentTime({ order_id: orderId })
      this.setState(
        {
          confirmModalResetPayment: false,
        },
        () => this.getData()
      )
      notifySuccess('Mở khóa thành công!')
    } catch (error) {
      this.setState({
        isLoading: false,
        confirmModalResetPayment: false,
      })
      notifyFail('Mở khóa thất bại!')
    }
  }

  confirmPayOff = async () => {
    const { orderId, paymentCustomerInfo } = this.state
    const PAYMENT_STATUS = {
      payOff: 1,
      notPayOff: 0,
    }
    const payload = {
      order_id: orderId,
      type: paymentCustomerInfo.payOff ? PAYMENT_STATUS.notPayOff : PAYMENT_STATUS.payOff,
    }
    try {
      this.setState({
        isLoading: true,
      })
      await OrderApi.updatePaymentStatus(payload)
      this.setState(
        {
          confirmModalPayOff: false,
        },
        () => this.getData()
      )
      notifySuccess(STRING.Success)
    } catch (error) {
      this.setState({
        isLoading: false,
      })
      notifyFail(STRING.Fail)
    }
  }

  handleInputModal = (fieldName, value) => {
    this.setState({
      modal: {
        ...this.state.modal,
        [fieldName]: value || '',
      },
    })
  }

  handleInputModalSurcharges = (fieldName, value) => {
    this.setState({
      modalSurcharges: {
        ...this.state.modalSurcharges,
        [fieldName]: value || '',
      },
    })
  }

  handleInputModalSwitchSale = (fieldName, value) => {
    this.setState({
      modalSwitchSale: {
        ...this.state.modalSwitchSale,
        [fieldName]: value || '',
      },
    })
  }

  handleInputModalOrderPrice = (fieldName, value) => {
    this.setState({
      modalOrderPrice: {
        ...this.state.modalOrderPrice,
        [fieldName]: value || '',
      },
    })
  }

  handleChange = (fieldName, value) => {
    this.setState({
      [fieldName]: value,
    })
  }

  checkValidateValueModalSurcharges = () => {
    const { price, note, status, amount } = this.state.modalSurcharges
    if (price && amount && note) {
      return false
    }

    return true
  }

  checkValidateValueModalUpdateOrderPrice = () => {
    const { price, adult, child } = this.state.modalOrderPrice
    if (price && !isNaN(adult) && !isNaN(child)) {
      return false
    }
    return true
  }

  checkValidateValueModalSwitchSale = () => {
    const { leadSaleId, saleId } = this.state.modalSwitchSale
    if (leadSaleId || saleId) {
      return false
    }
    return true
  }

  handleBlur = (nameKey, titleName, value) => {
    validateForm(this, this.state.modal[nameKey] || '', nameKey, titleName)
  }

  handleIdCard = async (fileName, urlName, event) => {
    if (!event.target.files[0]) {
      return
    }
    if (!ACCEPT_TYPE.IMAGE.includes(event.target.files[0].type)) {
      alert('Định dạng ảnh không được hỗ trợ. Vui lòng chọn ảnh khác.')
      return
    }

    const file = event.target.files[0]

    const image = await resizeFile(file)
    this.setState({
      modal: {
        ...this.state.modal,
        [fileName]: image,
        [urlName]: (window.URL || window.webkitURL).createObjectURL(file),
      },
    })
  }

  renderHeader = () => {
    const { customerInfo, orderStatus } = this.state
    return (
      <HeaderPage context={this.props} titleHeader={STRING.orderDetail}>
        {orderStatus != ORDER_STATUS.FINISHED ? (
          <Button className="mr-2 mb-0" color="danger" onClick={this.changeOrderStatus}>
            {STRING.cancelOrder}
          </Button>
        ) : (
          ''
        )}

        {!(orderStatus > ORDER_STATUS.CHECK_IN) ? (
          <Button
            className="mr-0 mb-0"
            color="primary"
            onClick={() =>
              this.setState({
                assignSaleModal: true,
              })
            }
          >
            {STRING.assign}
          </Button>
        ) : (
          ''
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
    const { schedulingInfo, paymentCustomerInfo, payment_provider_at } = this.state
    return (
      <ScheduleInfo
        schedulingInfo={schedulingInfo}
        payment_provider_at={payment_provider_at || ''}
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
        {this.paymentOfSupplier()}
      </Row>
    )
  }

  paymentOfCustomer = () => {
    const { paymentCustomerInfo, paymentStatus } = this.state
    return (
      <Col lg="7" className="px-2 mb-3">
        <Col className="box--shadow p-3">
          <Row className="mb-3">
            <Col md="8" className="pl-0">
              <h5 className="text-primary">Thanh toán của khách hàng</h5>
            </Col>

            <Col md="4" className="pl-0">
              {paymentStatus >= PAYMENT_STATUS.CAN_CHECK_IN && (
                <>
                  <Checkbox
                    checked={paymentCustomerInfo?.payOff}
                    className="mr-1"
                    onChange={() => {
                      this.setState({
                        confirmModalPayOff: true,
                      })
                    }}
                  />
                  Khách hàng đã thanh toán hết
                </>
              )}
            </Col>
          </Row>

          {this.renderMoneyDecisionCustomer()}
          <hr />
          {this.renderDepositOfGuests()}
          {this.table(paymentCustomerInfo.depositOfCustomer?.paymentHistoryList, 'depositOfCustomer')}
          <hr />
          {this.renderSurcharges()}
          {this.tableSurcharges()}
          <hr />
          {this.renderMoneyLeftToPay()}
          {this.table(paymentCustomerInfo.moneyLeftToPayOfCustomer?.paymentHistoryList, 'moneyLeftToPayOfCustomer')}
        </Col>
      </Col>
    )
  }

  renderMoneyDecisionCustomer = () => {
    const { paymentCustomerInfo, orderPrice, paymentStatus, sumDeposit, isRequestPayment } = this.state
    return (
      <MoneyDecisionOfCustomer
        paymentCustomerInfo={paymentCustomerInfo}
        orderPrice={orderPrice}
        paymentStatus={paymentStatus}
        sumDeposit={sumDeposit}
        isRequestPayment={isRequestPayment}
        handleShowModal={() =>
          this.setState({
            showModalUpdateOrderPrice: true,
          })
        }
        handleAllowDeposit={() => {
          this.setState({
            showModalAllowDeposit: true,
          })
        }}
        handleKeepOrderForCustomer={() => {
          this.setState({
            showModalKeepOrderForCustomer: true,
          })
        }}
        handleAllowCheckIn={() => {
          this.setState({
            showModalAllowCheckIn: true,
          })
        }}
      />
    )
  }

  renderDepositOfGuests = () => {
    const { paymentCustomerInfo, endPaymentAt, paymentStatus } = this.state
    let unBlock = false

    // check if endPaymentAt is exist and endPaymentAt is out of date

    if (paymentStatus === -1 && Date.now() >= Date.parse(endPaymentAt)) {
      unBlock = true
    }
    return (
      <DepositOfCustomer
        unBlock={unBlock}
        paymentCustomerInfo={paymentCustomerInfo}
        handleResetPaymentAt={() =>
          this.setState({
            confirmModalResetPayment: true,
          })
        }
        handleShowModal={() => {
          let numberOfIsChecked = paymentCustomerInfo.depositOfCustomer?.paymentHistoryList?.filter(
            (payment) => payment.isSelected
          ).length

          const currentPayment = paymentCustomerInfo.depositOfCustomer?.paymentHistoryList?.find(
            (payment) => payment.isSelected
          )

          if (numberOfIsChecked !== 1) {
            notifyFail('Vui lòng chọn một giá trị dưới bảng để cập nhật!')
            return
          }

          // const currentPayment = paymentCustomerInfo.depositOfCustomer?.paymentHistoryList[currentIndex]
          this.setState({
            updateDepositOfCustomer: true,
            idDeposit: currentPayment.id,
            modal: {
              ...this.state.modal,
              bank: {
                code: currentPayment?.bank_id || '',
                value: currentPayment?.bank !== 'undefined' ? currentPayment?.bank : '',
                label: currentPayment?.bank !== 'undefined' ? currentPayment?.bank : '',
              },
              money: currentPayment.amount,
              status: currentPayment.status === 1 ? 2 : currentPayment.status,
              transferImageUrl: currentPayment.transfer_image,
              transferSmsUrl: currentPayment.sms_image,
              transferDate: formatDateForInput(currentPayment.created_at),
              smsText: currentPayment.sms,
              note: currentPayment.note,
            },
          })
        }}
      />
    )
  }

  renderMoneyLeftToPay = () => {
    const { paymentCustomerInfo, moneyNotPayOfCustomer } = this.state
    return (
      <MoneyLeftToPayOfCustomer
        paymentCustomerInfo={paymentCustomerInfo}
        moneyNotPayOfCustomer={moneyNotPayOfCustomer}
        createPayment={() => {
          this.setState({
            createPaymentOfCustomer: true,
            modal: {
              paymentMethod: 'Nhà cung cấp thu hộ',
              money: `${moneyNotPayOfCustomer}`,
              bank: {},
              transferImage: '',
              transferImageUrl: '',
              transferSmsUrl: '',
              transferSms: '',
              transferDate: '',
              smsText: '',
              status: '',
              note: '',
              payOff: '',
            },
          })
        }}
        handleShowModal={() => {
          let numberOfIsChecked = paymentCustomerInfo.moneyLeftToPayOfCustomer?.paymentHistoryList?.filter(
            (payment) => payment.isSelected
          ).length

          let currentIndex = paymentCustomerInfo.moneyLeftToPayOfCustomer?.paymentHistoryList?.findIndex(
            (payment) => payment.isSelected
          )

          if (numberOfIsChecked !== 1) {
            notifyFail('Vui lòng chọn một giá trị dưới bảng để cập nhật!')
            return
          }

          const currentPayment = paymentCustomerInfo.moneyLeftToPayOfCustomer?.paymentHistoryList[currentIndex]
          this.setState({
            updatePaymentOfCustomer: true,
            modal: {
              ...this.state.modal,
              bank: {
                code: currentPayment?.bank_id || '',
                value: currentPayment?.bank !== 'undefined' ? currentPayment?.bank : '',
                label: currentPayment?.bank !== 'undefined' ? currentPayment?.bank : '',
              },
              money: currentPayment.amount,
              status: currentPayment.status === 1 ? 2 : currentPayment.status,
              transferImageUrl: currentPayment.transfer_image,
              transferSmsUrl: currentPayment.sms_image,
              transferDate: formatDateForInput(currentPayment.created_at),
              smsText: currentPayment.sms,
              note: currentPayment.note,
            },
          })
        }}
      />
    )
  }

  renderSurcharges = () => {
    const { paymentCustomerInfo, listSurcharges, accompaniedService } = this.state
    return (
      <Surcharges
        paymentCustomerInfo={paymentCustomerInfo}
        accompaniedService={accompaniedService}
        createSurcharges={() => {
          this.setState({
            createSurcharges: true,
          })
        }}
        handleShowModal={() => {
          let numberOfIsChecked = listSurcharges.filter((payment) => payment.isSelected).length

          if (numberOfIsChecked !== 1) {
            notifyFail('Vui lòng chọn một giá trị dưới bảng để cập nhật!')
            return
          }

          let currentIndex = listSurcharges.findIndex((payment) => payment.isSelected)

          const currentSurcharges = listSurcharges[currentIndex]
          this.setState({
            showModalUpdateSurcharges: true,
            modalSurcharges: {
              price: formatNumber(currentSurcharges.price?.toString()),
              amount: currentSurcharges?.amount ? formatNumber(currentSurcharges?.amount?.toString()) : 0,
              id: currentSurcharges?.id,
              note: currentSurcharges?.note,
            },
          })
        }}
      />
    )
  }

  paymentOfSupplier = () => {
    const { paymentOwnerInfo, paymentCustomerInfo, moneyNotPayForProvider, payment_provider_at } = this.state
    return (
      <PaymentOfHomeOwner
        moneyNotPayForProvider={moneyNotPayForProvider}
        paymentOwnerInfo={paymentOwnerInfo}
        paymentCustomerInfo={paymentCustomerInfo}
        hiddenButton={payment_provider_at !== null}
        onUpdateDecisionOfHomeOwner={() =>
          this.setState({
            showModalUpdateDecisionOfHomeOwner: true,
            modal: {
              ...this.state.modal,
              status: 2,
            },
          })
        }
        onUpdateDepositOfHomeOwner={() => {
          this.setState({
            showModalUpdateDepositOfHomeOwner: true,
            modal: {
              ...this.state.modal,
              status: 2,
            },
          })
        }}
        onUpdateMoneyLeftToPayOfHomeOwner={() => {
          this.setState({
            showModalUpdateMoneyLeftToPayOfHomeOwner: true,
            modal: {
              ...this.state.modal,
              status: 2,
              money: this.state.moneyNotPayForProvider || '',
            },
          })
        }}
      />
    )
  }

  tableSurcharges = () => {
    const tableHeader = [
      {
        header: '',
      },
      {
        header: STRING.numericalOrder,
      },
      {
        header: 'Phát sinh mua',
      },
      {
        header: 'Phát sinh bán',
      },
      {
        header: 'Nội dung',
      },
      {
        header: 'Ngày phát sinh',
      },
    ]

    return (
      <table className="table table-bordered table-striped table-responsive-sm ">
        <TableData tableHeader={tableHeader} />
        {this.renderTableDataSurcharges()}
      </table>
    )
  }

  renderTableDataSurcharges = () => {
    const { listSurcharges } = this.state
    return (
      <tbody>
        {listSurcharges?.length ? (
          listSurcharges?.map((value, index) => (
            <tr key={index}>
              <td>
                <input
                  type="checkbox"
                  className="cursor"
                  checked={value.isSelected}
                  onChange={() => {
                    const newListSurcharges = JSON.parse(JSON.stringify(listSurcharges))
                    newListSurcharges[index].isSelected = !listSurcharges[index].isSelected
                    this.setState({
                      listSurcharges: newListSurcharges,
                    })
                  }}
                />
              </td>
              <td>{index + 1}</td>
              <td>{value?.amount ? formatMoney(value?.amount) : '--'}</td>
              <td>{formatMoney(value?.price) || STRING.notUpdate}</td>
              <td>{value?.note || STRING.notUpdate}</td>
              <td>{toDateString(value?.created_at) || STRING.notUpdate}</td>
            </tr>
          ))
        ) : (
          <EmptyData />
        )}
      </tbody>
    )
  }

  table = (paymentHistoryList, parentPaymentHistoryList) => {
    const { tableHeader } = this.state
    let isResponsive = ''
    if (paymentHistoryList?.length) {
      isResponsive = 'table-responsive'
    }

    return (
      <table className={`table table-bordered table-striped ${isResponsive}`} style={{ width: '100%' }}>
        <TableData tableHeader={tableHeader} />
        {this.renderTableData(paymentHistoryList, parentPaymentHistoryList)}
      </table>
    )
  }

  renderTableData = (paymentHistoryList, parentPaymentHistoryList) => {
    const { paymentCustomerInfo } = this.state
    return (
      <tbody>
        {paymentHistoryList?.length ? (
          paymentHistoryList?.map((value, index) => (
            <tr key={index}>
              <td>
                <input
                  type="checkbox"
                  className="cursor"
                  checked={value.isSelected}
                  onChange={() => {
                    const newPaymentCustomerInfo = JSON.parse(JSON.stringify(paymentCustomerInfo))
                    newPaymentCustomerInfo[parentPaymentHistoryList].paymentHistoryList[index].isSelected =
                      !paymentCustomerInfo[parentPaymentHistoryList].paymentHistoryList[index].isSelected

                    this.setState({
                      paymentCustomerInfo: newPaymentCustomerInfo,
                    })
                  }}
                />
              </td>
              <td>{index + 1}</td>
              <td>
                {formatMoney(value?.amount) || STRING.notUpdate} <br />
                {value?.is_epay ? '(Khách hàng chuyển khoản)' : '(Nhà cung cấp thu hộ)'}
              </td>
              <td>{formatDateTime(value?.created_at) || '--'}</td>

              <td>
                {value?.transfer_image ? (
                  <Image style={{ width: 104, height: 78 }} src={value?.transfer_image} />
                ) : (
                  'Trống'
                )}
              </td>
              <td>{value?.sms || STRING.notUpdate}</td>
              <td>
                {value?.sms_image ? (
                  <Image style={{ width: 104, height: 78 }} src={value?.sms_image} />
                ) : (
                  STRING.notUpdate
                )}
              </td>
              <td>{value?.note || '--'}</td>
              <td>
                {(value?.status === ORDER_STATUS.REJECTED
                  ? 'Từ chối'
                  : value?.status === ORDER_STATUS.ADMIN_CONFIRMED
                  ? 'Chấp nhận'
                  : 'Chờ cập nhật') || '--'}
              </td>
            </tr>
          ))
        ) : (
          <EmptyData />
        )}
      </tbody>
    )
  }

  checkValidateValueAssignSale = () => {
    const { saleId } = this.state

    if (saleId) {
      return false
    }

    return true
  }

  checkValidateValueUpdateOfCustomer = () => {
    const { money, bank, transferSms, transferSmsUrl, smsText, status, note } = this.state.modal
    const {
      showModalUpdateDecisionOfHomeOwner,
      showModalUpdateMoneyLeftToPayOfHomeOwner,
      showModalUpdateDepositOfHomeOwner,
      createPaymentOfCustomer,
    } = this.state

    if (createPaymentOfCustomer && money && transferSmsUrl && smsText) return false

    if (status === ORDER_STATUS.REJECTED && note) return false

    if (
      showModalUpdateDecisionOfHomeOwner ||
      showModalUpdateMoneyLeftToPayOfHomeOwner ||
      showModalUpdateDepositOfHomeOwner
    ) {
      if (money && smsText && status) return false
    }

    if (money && bank?.value && smsText && status) return false

    return true
  }

  renderModal = () => {
    return (
      <>
        {this.renderModalAssignSale()}
        {this.renderModalUpdateOfCustomer()}
        {this.renderModalCustomerList()}
        {this.renderUpdateSurcharges()}
        {this.renderModalSwitchSale()}
        {this.renderModalUpdateOrderPrice()}
        {this.renderModalUpdateOfHomeOwner()}
        {this.renderConfirmModalPayOff()}
        {this.renderConfirmModalResetPayment()}
        {this.renderConfirmModalAllowDeposit()}
        {this.renderConfirmModalKeepOrder()}
        {this.renderConfirmModalAllowCheckin()}
      </>
    )
  }

  renderModalAssignSale = () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    const { assignSaleModal, saleId, listSale, listLeadSale } = this.state

    let allField
    let titleModal = ''
    if (userInfo?.role.id === ROLE.ADMIN) {
      titleModal = 'Chỉ định lead sale'
      allField = [
        {
          type: TYPE_INPUT.select,
          titleName: 'Lead sale',
          valueName: 'saleId',
          value: saleId,
          list: listLeadSale,
        },
      ]
    } else {
      titleModal = 'Chỉ định sale'
      allField = [
        {
          type: TYPE_INPUT.select,
          titleName: 'Sale',
          valueName: 'saleId',
          value: saleId,
          list: listSale,
        },
      ]
    }

    return (
      <ModalComponent
        allField={allField}
        title={titleModal}
        checkValidateValue={this.checkValidateValueAssignSale()}
        handleInputModal={this.handleChange}
        isOpen={assignSaleModal}
        addUpdate={this.assignSale}
        onHide={() =>
          this.setState({
            saleId: '',
            assignSaleModal: false,
          })
        }
      />
    )
  }

  renderModalSwitchSale = () => {
    const { showModalSwitchSale, listSale } = this.state
    const { leadSaleId, saleId } = this.state.modalSwitchSale
    let allField = [
      {
        type: TYPE_INPUT.select,
        titleName: 'Lead sale',
        valueName: 'leadSaleId',
        value: leadSaleId,
        list: listSale,
      },
      {
        type: TYPE_INPUT.select,
        titleName: 'sale',
        valueName: 'saleId',
        value: saleId,
        list: listSale,
      },
    ]
    return (
      <ModalComponent
        allField={allField}
        title={'Đổi người phụ trách'}
        checkValidateValue={this.checkValidateValueModalSwitchSale()}
        handleInputModal={this.handleInputModalSwitchSale}
        isOpen={showModalSwitchSale}
        addUpdate={this.switchSale}
        onHide={() =>
          this.setState({
            saleId: '',
            leadSaleId: '',
            showModalSwitchSale: false,
            // assignSaleModal: false,
          })
        }
      />
    )
  }

  renderModalUpdateOfCustomer = () => {
    const {
      money,
      transferDate,
      bank,
      transferImage,
      transferImageUrl,
      transferSms,
      transferSmsUrl,
      smsText,
      paymentMethod,
      status,
      note,
    } = this.state.modal
    const { moneyError, bankError, smsTextError } = this.state.validateError
    const { updatePaymentOfCustomer, updateDepositOfCustomer, createPaymentOfCustomer } = this.state
    let allField = [
      {
        type: TYPE_INPUT.radio,
        titleName: 'Xác nhận cọc',
        valueName: 'status',
        value: status,
      },
      {
        type: TYPE_INPUT.textConvertToNumber,
        titleName: 'Số tiền',
        valueName: 'money',
        value: money,
        error: moneyError,
      },
      {
        type: TYPE_INPUT.date,
        titleName: 'Ngày CK',
        valueName: 'transferDate',
        value: transferDate,
        detail: !createPaymentOfCustomer,
      },
      {
        type: TYPE_INPUT.autoComplete,
        titleName: 'Ngân hàng',
        placeHolder: 'Chọn ngân hàng',
        value: bank,
        error: bankError,
        listOptionAutocomplete: this.state.listOptionBank,
      },

      {
        type: TYPE_INPUT.file_front,
        titleName: `Ảnh CK`,
        value: transferImage,
        valueName: 'transferImage',
        url: transferImageUrl,
        urlName: 'transferImageUrl',
        detail: true,
      },
      createPaymentOfCustomer && {
        type: TYPE_INPUT.file_back,
        titleName: createPaymentOfCustomer ? `Ảnh SMS thu hộ` : 'Ảnh SMS',
        value: transferSms,
        valueName: 'transferSms',
        url: transferSmsUrl,
        urlName: 'transferSmsUrl',
      },
      {
        type: TYPE_INPUT.text_description,
        titleName: createPaymentOfCustomer ? `SMS thu hộ` : 'SMS tiền về',
        valueName: 'smsText',
        value: smsText,
        error: smsTextError,
      },
    ]

    if (updatePaymentOfCustomer || createPaymentOfCustomer) {
      allField.splice(4, 1)
      if (createPaymentOfCustomer) {
        allField.splice(2, 2)

        allField.shift()

        allField.unshift({
          type: TYPE_INPUT.text,
          titleName: 'Hình thức thanh toán',
          valueName: 'paymentMethod',
          value: paymentMethod,
          detail: true,
        })
      }
    }

    const titleForModal = updateDepositOfCustomer
      ? 'Cập nhật cọc của khách hàng'
      : updatePaymentOfCustomer
      ? 'Cập nhật thanh toán của khách hàng'
      : 'Tạo thanh toán của khách hàng'

    if (status === ORDER_STATUS.REJECTED) {
      allField = allField.splice(0, 1)
      allField.push({
        type: TYPE_INPUT.text_description,
        titleName: 'Lý do từ chối',
        valueName: 'note',
        value: note,
      })
    }

    return (
      <ModalComponent
        allField={allField}
        title={titleForModal}
        checkValidateValue={allField.length > 1 ? this.checkValidateValueUpdateOfCustomer() : false}
        handleInputModal={this.handleInputModal}
        checkValidateError={allField.length > 2 ? this.state.validateError : {}}
        handleIdCard={this.handleIdCard}
        isOpen={updatePaymentOfCustomer || updateDepositOfCustomer || createPaymentOfCustomer}
        handleBlur={allField.length > 2 ? this.handleBlur : () => {}}
        addUpdate={this.updateOfCustomer}
        onSearchAutocomplete={this.onSearch}
        onChangeAutocomplete={this.onChange}
        onSelectAutocomplete={this.onSelect}
        onHide={() =>
          this.setState({
            updatePaymentOfCustomer: false,
            updateDepositOfCustomer: false,
            createPaymentOfCustomer: false,
            modal: initialModal,
            validateError: {
              moneyError: '',
              bankError: '',
              smsTextError: '',
              priceError: '',
            },
          })
        }
      />
    )
  }

  renderModalUpdateOfHomeOwner = () => {
    const { money, bank, transferImage, transferSms, smsText, transferImageUrl, status, price, transferSmsUrl } =
      this.state.modal
    const { moneyError, bankError, smsTextError, priceError } = this.state.validateError

    const {
      showModalUpdateDecisionOfHomeOwner,
      showModalUpdateMoneyLeftToPayOfHomeOwner,
      showModalUpdateDepositOfHomeOwner,
    } = this.state

    let titleForModal = showModalUpdateDecisionOfHomeOwner
      ? 'Cập nhật chốt của chủ nhà'
      : showModalUpdateMoneyLeftToPayOfHomeOwner
      ? 'Cập nhật tiền còn thanh toán'
      : 'Cập nhật cọc của chủ nhà'

    let allField = [
      // {
      //   type: TYPE_INPUT.date,
      //   titleName: 'Ngày CK',
      //   valueName: 'transferDate',
      //   value: transferDate,
      //   error: transferDateError,
      // },
      // {
      //   type: TYPE_INPUT.text,
      //   titleName: STRING.bank,
      //   valueName: 'bank',
      //   value: bank,
      //   error: bankError,
      // },
      {
        type: TYPE_INPUT.file_front,
        titleName: `Ảnh CK`,
        value: transferImage,
        valueName: 'transferImage',
        url: transferImageUrl,
        urlName: 'transferImageUrl',
      },
      showModalUpdateDecisionOfHomeOwner && {
        type: TYPE_INPUT.file_back,
        titleName: showModalUpdateDecisionOfHomeOwner ? `Ảnh SMS Chốt` : 'Ảnh SMS',
        value: transferSms,
        valueName: 'transferSms',
        url: transferSmsUrl,
        urlName: 'transferSmsUrl',
      },
      {
        type: TYPE_INPUT.text_description,
        titleName: showModalUpdateDecisionOfHomeOwner ? `SMS Chốt` : 'SMS',
        valueName: 'smsText',
        value: smsText,
        // error: smsTextError,
      },
    ]
    // if (showModalUpdateMoneyLeftToPayOfHomeOwner) {
    //   allField.push({
    //     type: TYPE_INPUT.checkbox,
    //     titleName: 'Khách hàng đưa tiền mặt',
    //     valueName: 'is_cash',
    //     value: is_cash,
    //   })
    //   allField.push({
    //     type: TYPE_INPUT.checkbox,
    //     titleName: 'Khách hàng CK nốt',
    //     valueName: 'banking',
    //     value: banking,
    //   })
    // }

    if (showModalUpdateDecisionOfHomeOwner) {
      allField.unshift({
        type: TYPE_INPUT.textConvertToNumber,
        titleName: 'Giá nhập',
        valueName: 'money',
        value: money,
        error: moneyError,
      })
      // allField.unshift({
      //   type: TYPE_INPUT.textConvertToNumber,
      //   titleName: 'Giá bán',
      //   valueName: 'price',
      //   value: price,
      //   error: priceError,
      // })

      allField.splice(1, 1)
    } else {
      allField.unshift({
        type: TYPE_INPUT.textConvertToNumber,
        titleName: 'Số tiền',
        valueName: 'money',
        value: money,
        error: moneyError,
      })
    }

    allField.unshift({
      type: TYPE_INPUT.radio,
      titleName: 'Xác nhận cọc',
      valueName: 'status',
      value: status,
      refuse: true,
      option1: 'Chấp nhận',
      option2: 'Từ chối',
    })

    return (
      <ModalComponent
        allField={allField}
        title={titleForModal}
        checkValidateValue={this.checkValidateValueUpdateOfCustomer()}
        handleInputModal={this.handleInputModal}
        checkValidateError={this.state.validateError}
        handleIdCard={this.handleIdCard}
        isOpen={
          showModalUpdateDecisionOfHomeOwner ||
          showModalUpdateMoneyLeftToPayOfHomeOwner ||
          showModalUpdateDepositOfHomeOwner
        }
        handleBlur={this.handleBlur}
        addUpdate={this.updateOfHomeOwner}
        onHide={() =>
          this.setState({
            showModalUpdateDecisionOfHomeOwner: false,
            showModalUpdateMoneyLeftToPayOfHomeOwner: false,
            showModalUpdateDepositOfHomeOwner: false,
            modal: initialModal,
            validateError: {
              moneyError: '',
              bankError: '',
              smsTextError: '',
              priceError: '',
            },
          })
        }
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

  renderUpdateSurcharges = () => {
    const { showModalUpdateSurcharges, createSurcharges } = this.state
    const { price, note, amount } = this.state.modalSurcharges
    const allField = [
      {
        type: TYPE_INPUT.textConvertToNumber,
        titleName: 'Phát sinh mua',
        valueName: 'amount',
        value: amount,
      },
      {
        type: TYPE_INPUT.textConvertToNumber,
        titleName: 'Phát sinh bán',
        valueName: 'price',
        value: price,
      },
      {
        type: TYPE_INPUT.text_description,
        titleName: 'Nội dung',
        valueName: 'note',
        value: note,
      },
    ]
    const titleForModal = createSurcharges ? 'Tạo chi phí phát sinh' : 'Cập nhật chi phí phát sinh'
    return (
      <ModalComponent
        allField={allField}
        title={titleForModal}
        checkValidateValue={this.checkValidateValueModalSurcharges()}
        handleInputModal={this.handleInputModalSurcharges}
        isOpen={showModalUpdateSurcharges || createSurcharges}
        addUpdate={this.createOrUpdateSurcharges}
        handleBlur={null}
        onHide={() =>
          this.setState({
            showModalUpdateSurcharges: false,
            createSurcharges: false,
            modalSurcharges: {
              price: '',
              note: '',
              id: '',
              amount: '',
            },
          })
        }
      />
    )
  }

  renderModalUpdateOrderPrice = () => {
    const { price, child, adult } = this.state.modalOrderPrice
    const { showModalUpdateOrderPrice } = this.state
    let allField = [
      {
        type: TYPE_INPUT.textConvertToNumber,
        titleName: 'Số tiền',
        valueName: 'price',
        value: price,
      },
      {
        type: TYPE_INPUT.number,
        titleName: 'Người lớn',
        valueName: 'adult',
        value: adult,
      },
      {
        type: TYPE_INPUT.number,
        titleName: 'Trẻ nhỏ',
        valueName: 'child',
        value: child,
      },
    ]
    return (
      <ModalComponent
        allField={allField}
        title={'Cập nhật Giá trị đơn hàng'}
        checkValidateValue={this.checkValidateValueModalUpdateOrderPrice()}
        handleInputModal={this.handleInputModalOrderPrice}
        isOpen={showModalUpdateOrderPrice}
        addUpdate={this.updateOrderPrice}
        handleBlur={this.handleBlur}
        onHide={() =>
          this.setState({
            showModalUpdateOrderPrice: false,
          })
        }
      />
    )
  }

  renderConfirmModalPayOff = () => {
    const { paymentCustomerInfo } = this.state
    return (
      <ConfirmModal
        isOpen={this.state.confirmModalPayOff}
        onHide={() =>
          this.setState({
            confirmModalPayOff: false,
          })
        }
        title={paymentCustomerInfo.payOff ? 'bỏ hoàn thành đơn hàng' : 'hoàn thành đơn hàng'}
        action={this.confirmPayOff}
      />
    )
  }

  renderConfirmModalResetPayment = () => {
    return (
      <ConfirmModal
        isOpen={this.state.confirmModalResetPayment}
        onHide={() =>
          this.setState({
            confirmModalResetPayment: false,
          })
        }
        title={'mở cọc lại'}
        action={this.confirmResetPayment}
      />
    )
  }

  renderConfirmModalAllowDeposit = () => {
    return (
      <ConfirmModal
        isOpen={this.state.showModalAllowDeposit}
        onHide={() =>
          this.setState({
            showModalAllowDeposit: false,
          })
        }
        title={'cho phép đặt cọc'}
        action={this.handleAllowDeposit}
      />
    )
  }

  renderConfirmModalKeepOrder = () => {
    return (
      <ConfirmModal
        isOpen={this.state.showModalKeepOrderForCustomer}
        onHide={() =>
          this.setState({
            showModalKeepOrderForCustomer: false,
          })
        }
        title={'dữ chỗ cho khách'}
        action={this.handleKeepOrder}
      />
    )
  }
  renderConfirmModalAllowCheckin = () => {
    return (
      <ConfirmModal
        isOpen={this.state.showModalAllowCheckIn}
        onHide={() =>
          this.setState({
            showModalAllowCheckIn: false,
          })
        }
        title={'cho phép khách hàng check-in'}
        action={this.handleAllowCheckIn}
      />
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
        {this.listenLocationChange()}
        {this.renderModal()}
        {this.paymentInfo()}
      </ScreenWrapper>
    )
  }
}

const mapDispatchToProps = {
  getListOverView,
}

export default connect(null, mapDispatchToProps)(OrderDetailByTourScreen)
