import { Checkbox, Image } from 'antd'
import ConfirmModal from 'components/ConfirmModal'
import EmptyData from 'components/EmptyData'
import HeaderPage from 'components/HeaderPage'
import ModalComponent from 'components/ModalComponent'
import ScreenWrapper from 'components/ScreenWrapper'
import TableData from 'components/TableData'
import { callSocket, getListBank, createNotification } from 'constants/Api'
import {
  // NUMBER,
  ACCEPT_TYPE,
  CHAT_STATUS,
  ORDER_STATUS,
  ORDER_STATUS_LIST,
  PAYMENT_STATUS_LIST,
  ROLE,
  STRING,
  TRANSACTION_STATUS,
  TYPE_INPUT,
  NOTI_TYPE,
} from 'constants/Constant'
import * as FilterApi from 'network/FilterApi'
import * as OrderApi from 'network/OrderApi'
import * as SaleApi from 'network/SaleApi'
import * as TourApi from 'network/TourApi'
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
import { notifyFail, notifySuccess } from 'utils/notify'
import { handlePaymentStatus, handleOrderStatus } from 'utils/order'
import { resizeFile } from 'utils/resize/resizeFile'
import CustomerList from './components/common/CustomerList'
import ChooseProvider from './components/order_detail_book_tour/ChooseProvider'
import PaymentOfProvider from './components/order_detail_book_tour/PaymentOfProvider'
import CustomerInfo from './components/order_detail_by_book_room/CustomerInfo'
import DepositOfCustomer from './components/order_detail_by_book_room/DepositOfCustomer'
import MoneyDecisionOfCustomer from './components/order_detail_by_book_room/MoneyDecisionOfCustomer'
import MoneyLeftToPayOfCustomer from './components/order_detail_by_book_room/MoneyLeftToPayOfCustomer'
import ScheduleInfo from './components/order_detail_by_book_room/ScheduleInfo'
import Surcharges from './components/order_detail_by_book_room/Surcharges'
import './style.css'
// const clonedeep = require('lodash.clonedeep')
const initialValuesModal = {
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

class OrderDetailScreen extends React.Component {
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
      showModalUpdateMoneyLeftToPayOfHomeOwner: false,
      showModalUpdateOrderPrice: false,
      showListCustomer: false,
      listCustomer: [],
      listSurcharges: [],
      confirmModalPayOff: false,
      showModalUpdateSurcharges: false,
      createSurcharges: false,
      confirmModalResetPayment: false,
      confirmModalDeleteProvider: false,
      accompaniedService: '',
      listProvider: [],
      activeClassName: false,
      listMoneyNotPayForProvider: [],
      modal: initialValuesModal,
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
      orderStatus: '',
      isLoading: true,
      transportStatus: '',
      paymentStatus: '',
      moneyNotPayOfCustomer: '',
      showModalInfoTransport: false,
      transportStatusList: ORDER_STATUS_LIST,
      paymentStatusList: PAYMENT_STATUS_LIST,
      showModalInfoPayment: false,
      isChecked: false,
      orderId: '',
      endPaymentAt: '',
      currentIndexOfProvider: '',
      listOptionBank: [],
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
      value: `${item?.name} (${item?.seri_number})`,
      label: `${item?.name} (${item?.seri_number})`,
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
          ...this.state.modal.bank,
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
      if (data?.type == CHAT_STATUS.DEPOSIT_CUSTOMER || data?.type == CHAT_STATUS.PAYMENT_CUSTOMER) {
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
      const orderDetailApi = await OrderApi.getOrderBookTourDetail(payload)
      this.setState({
        orderId: payload?.order_id,
        listCustomer: orderDetailApi.data?.order_customers,
        listMoneyNotPayForProvider: orderDetailApi.data.order_providers?.map((item) =>
          this.getListMoneyNotPayForProvider(item)
        ),
        moneyNotPayOfCustomer: formatNumber(this.calculateMoneyLeftToPayOfCustomer(orderDetailApi)?.toString() || '0'),
        accompaniedService: formatMoney(parseInt(orderDetailApi.data?.accompanied_service) || 0),
        orderStatus: orderDetailApi.data?.status,
        listSurcharges: orderDetailApi.data?.order_surcharges.map((surcharges) => {
          surcharges.isSelected = false
          return surcharges
        }),
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
          serviceType: STRING.bookTour,
          roomTypeName: orderDetailApi.data?.service_category_name,
          regionName: orderDetailApi.data?.region_name,
          roomName: orderDetailApi.data?.service_name,
          leadSale: orderDetailApi.data?.sale_leader?.full_name || STRING.notUpdate,
          leadSalePhone: orderDetailApi.data?.sale_leader?.phone || STRING.notUpdate,
          sale: orderDetailApi.data?.sale?.full_name || STRING.notUpdate,
          salePhone: orderDetailApi.data?.sale?.phone || STRING.notUpdate,
          providerName: orderDetailApi.data?.service?.provider?.provider_info?.provider_name || STRING.notUpdate,
          providerPhone: orderDetailApi.data?.service?.provider?.provider_phone || STRING.notUpdate,
          isTour: true,
          orderCode: orderDetailApi.data?.code,
          orderStatus: handleOrderStatus(orderDetailApi.data?.status),
          paymentStatus: handlePaymentStatus(orderDetailApi.data?.payment_status),
        },
        modalOrderPrice: {
          price: orderDetailApi?.data.price ? formatNumber(orderDetailApi?.data.price?.toString()) : '',
          child: orderDetailApi?.data.children,
          adult: orderDetailApi?.data.adult,
        },
        endPaymentAt:
          !orderDetailApi.data?.transaction[0].order_transactions.length &&
          !orderDetailApi.data?.transaction[1].order_transactions.length
            ? orderDetailApi.data?.end_payment_at
            : '',
        listProvider: orderDetailApi.data?.order_providers,
        paymentCustomerInfo: {
          payOff: orderDetailApi.data?.payment_status === ORDER_STATUS.FINISHED,
          moneyDecisionCustomer: {
            moneyDecisionCustomer: formatMoney(orderDetailApi?.data?.price) || STRING.notUpdate,
            usePoint: formatMoney(orderDetailApi?.data?.use_point) || STRING.notUpdate,
            totalMoney: formatMoney(orderDetailApi?.data?.price - orderDetailApi?.data?.use_point),
          },
          depositOfCustomer: this.getDepositOfCustomer(orderDetailApi),
          moneyLeftToPayOfCustomer: this.getMoneyLeftToPayOfCustomer(orderDetailApi),
        },
        isError: false,
        isLoading: false,
      })
    } catch (error) {
      this.setState({
        isError: true,
        isLoading: false,
      })
    }
  }

  getListMoneyNotPayForProvider = (transaction) => {
    if (transaction.order_transactions[0].status === 1) {
      return ''
    }

    if (transaction.order_transactions[1].status === 1) {
      return transaction.order_transactions[0]?.amount
    }

    if (transaction.order_transactions[2].status === 1) {
      return transaction.order_transactions[0]?.amount - transaction.order_transactions[1]?.amount
    }

    return (
      transaction.order_transactions[0]?.amount -
      transaction.order_transactions[1]?.amount -
      transaction.order_transactions[2]?.amount
    )
  }

  getDepositOfCustomer = (res) => {
    let response = JSON.parse(JSON.stringify(res))
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
    const price = response?.data?.price || 0
    const totalMoneyLeftToPay = price + accompanied_service
    const totalMoneyPaid = dispose + service_charge_include
    const amountMoneyLeftToPay = totalMoneyLeftToPay - totalMoneyPaid - usePoint

    return amountMoneyLeftToPay
  }

  getMoneyLeftToPayOfCustomer = (res) => {
    let response = JSON.parse(JSON.stringify(res))
    if (!response.data?.transaction[2]?.order_transactions.length) return {}
    let moneyLeftToPayOfCustomer = { ...response.data?.transaction[2]?.order_transactions[0] }

    moneyLeftToPayOfCustomer.paymentHistoryList = response.data.transaction[2]?.order_transactions?.map((payment) => {
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

    if (userInfo?.role?.id === ROLE.ADMIN && isSuccess) {
      try {
        const payload = {
          type: CHAT_STATUS.SALE_LEADER_CONFIRMED,
          content: 'Đơn hàng đã được duyệt!',
          user_id: customerInfo.customerId,
          sale_id: saleId,
        }
        callSocket(payload)
          .then(() => {})
          .catch((error) => {})
        await createNotification({
          order_id: orderId,
          type: 2,
          content: 'Đơn hàng đã được duyệt!',
          metaData: {
            order_id: orderId,
            type_noti: NOTI_TYPE.ORDER_DETAIL_BOOK_ROOM,
          },
          type_noti: CHAT_STATUS.SALE_LEADER_CONFIRMED,
        })
      } catch (error) {
        console.log(error)
      }
    }
  }

  deleteProvider = async () => {
    const { listProvider, orderId, currentIndexOfProvider } = this.state
    const payload = {
      order_id: orderId,
      id: listProvider[currentIndexOfProvider]?.id,
    }

    this.setState({
      isLoading: true,
    })

    try {
      await TourApi.deleteProvider(payload)
      this.setState(
        {
          confirmModalDeleteProvider: false,
        },
        () => this.getData()
      )

      notifySuccess('Xóa thành công!')
    } catch (error) {
      notifyFail('Xóa thất bại!')
      this.setState({
        isLoading: false,
      })
      console.log(error)
    }
  }

  updateIsPaymentOfProvider = async (providerId) => {
    const { orderId } = this.state
    const payload = {
      order_id: orderId,
      id: providerId,
    }

    this.setState({
      isLoading: true,
    })

    try {
      await TourApi.updateIsPayment(payload)
      this.getData()
      notifySuccess('Cập nhật thành công!')
    } catch (error) {
      notifyFail('Cập nhật thất bại!')
      this.setState({
        isLoading: false,
      })
      console.log(error)
    }
  }

  updateOfCustomer = async () => {
    const { updateDepositOfCustomer, paymentCustomerInfo, createPaymentOfCustomer, updatePaymentOfCustomer, orderId } =
      this.state
    const { money, bank, transferImage, transferSms, smsText, status, note } = this.state.modal
    try {
      if (updateDepositOfCustomer || updatePaymentOfCustomer) {
        if (!bank?.code || !bank?.value) {
          notifyFail('Vui lòng chọn tài khoản ngân hàng!')
          return
        }
      }

      let data
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
          note,
        }
      }

      this.setState({
        isLoading: true,
      })
      if (updateDepositOfCustomer) {
        data.id = paymentCustomerInfo?.depositOfCustomer?.id
        const payload = createFormData(data)
        await OrderApi.updateTransaction(payload)
      } else if (updatePaymentOfCustomer) {
        data.id = paymentCustomerInfo?.moneyLeftToPayOfCustomer?.id
        const payload = createFormData(data)
        await OrderApi.updateTransaction(payload)
      } else {
        data.order_id = orderId
        data.df_order_transaction_type_id = TRANSACTION_STATUS.MONEY_LEFT_TO_PAY_CUSTOMER
        const payload = createFormData(data)
        await OrderApi.createTransaction(payload)
      }
      this.setState(
        {
          updatePaymentOfCustomer: false,
          updateDepositOfCustomer: false,
          createPaymentOfCustomer: false,
          modal: initialValuesModal,
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
  }

  updateOfHomeOwner = async () => {
    const {
      showModalUpdateDecisionOfHomeOwner,
      showModalUpdateDepositOfHomeOwner,
      paymentOwnerInfo,
      orderId,
      currentIndexOfProvider,
      listProvider,
    } = this.state

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
        data.id = listProvider?.[currentIndexOfProvider]?.order_transactions?.[0]?.id
        data.price = formatPrice(price)
        const payload = createFormData(data)
        await OrderApi.updateTransaction(payload)
      } else if (showModalUpdateDepositOfHomeOwner) {
        data.id = listProvider?.[currentIndexOfProvider]?.order_transactions?.[1]?.id
        const payload = createFormData(data)
        await OrderApi.updateTransaction(payload)
      } else {
        data.id = listProvider?.[currentIndexOfProvider]?.order_transactions?.[2]?.id
        const payload = createFormData(data)
        await OrderApi.updateTransaction(payload)
      }
      this.setState(
        {
          showModalUpdateDecisionOfHomeOwner: false,
          showModalUpdateDepositOfHomeOwner: false,
          showModalUpdateMoneyLeftToPayOfHomeOwner: false,
          modal: initialValuesModal,
        },
        () => this.getData()
      )
      notifySuccess('Cập nhật thành công!')
      isSuccess = true
    } catch (error) {
      this.setState({
        isLoading: false,
      })
      notifyFail('Thất bại!')
      console.log(error)
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
      try {
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
          content: 'Giá trị đơn hàng của bạn đã được cập nhật!',
          metaData: {
            order_id: orderId,
          },
          type_noti: CHAT_STATUS.ORDER_PRICE,
        })
      } catch (error) {
        console.log(error)
      }
    }
  }

  createOrUpdateSurcharges = async () => {
    const { createSurcharges, orderId } = this.state
    const { price, note, id } = this.state.modalSurcharges

    const payload = {
      order_id: orderId,
      price: formatPrice(price),
      note,
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

  switchSale = () => {
    alert('Tính năng đang phát triển')
  }

  confirmResetPayment = async () => {
    try {
      this.setState({
        isLoading: true,
      })
      await OrderApi.resetPaymentTime()
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
    const { price, note } = this.state.modalSurcharges
    if (price && note) {
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
    validateForm(this, this.state.modal[nameKey], nameKey, titleName)
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

  handleShowModalUpdateOfHomeOwner = (fileName, currentIndex) => {
    const { listMoneyNotPayForProvider } = this.state
    this.setState({
      [fileName]: true,
      modal: {
        ...this.state.modal,
        status: 2,
        amount: listMoneyNotPayForProvider[currentIndex]?.amount || '',
      },
      currentIndexOfProvider: currentIndex,
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
    const { schedulingInfo, paymentCustomerInfo } = this.state
    return (
      <ScheduleInfo
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
        {this.paymentOfSupplier()}
      </Row>
    )
  }

  TabItem = ({ title, link, isActive }) => {
    return (
      <li className="nav-item">
        <a className={`nav-link ${isActive ? 'active' : ''}`} href={link} data-toggle="tab">
          {title}
        </a>
      </li>
    )
  }

  paymentOfCustomer = () => {
    const { paymentCustomerInfo, activeClassName } = this.state
    let isActive = !activeClassName ? 'active' : ''
    return (
      <Col className={`px-2 tab-pane ${isActive}`} id="customer">
        <Col className="box--shadow p-3">
          <Row className="mb-3">
            <Col md="8" className="pl-0">
              <h5 className="text-primary">Thanh toán của khách hàng</h5>
            </Col>

            <Col md="4" className="pl-0">
              <Checkbox
                checked={paymentCustomerInfo?.payOff}
                className="mr-1"
                onChange={() => {
                  this.setState({
                    confirmModalPayOff: true,
                  })
                }}
              />
              Đã thanh toán hết
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
    const { paymentCustomerInfo } = this.state
    return (
      <MoneyDecisionOfCustomer
        paymentCustomerInfo={paymentCustomerInfo}
        handleShowModal={() =>
          this.setState({
            showModalUpdateOrderPrice: true,
          })
        }
      />
    )
  }

  renderDepositOfGuests = () => {
    const { paymentCustomerInfo, endPaymentAt } = this.state
    let unBlock = false
    // check if endPaymentAt is exist and endPaymentAt is out of date
    if (endPaymentAt && Date.now() > Date.parse(endPaymentAt)) {
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

          let currentIndex = paymentCustomerInfo.depositOfCustomer?.paymentHistoryList?.findIndex(
            (payment) => payment.isSelected
          )

          if (numberOfIsChecked !== 1) {
            notifyFail('Vui lòng chọn một giá trị dưới bảng để cập nhật!')
            return
          }

          const currentPayment = paymentCustomerInfo.depositOfCustomer?.paymentHistoryList[currentIndex]
          this.setState({
            updateDepositOfCustomer: true,
            modal: {
              ...this.state.modal,
              bank: {
                code: currentPayment?.bank_id,
                value: currentPayment?.bank !== 'undefined' ? currentPayment?.bank : '',
                label: currentPayment?.bank !== 'undefined' ? currentPayment?.bank : '',
              },
              money: currentPayment.amount,
              status: currentPayment.status === 1 ? 2 : currentPayment.status,
              transferImageUrl: currentPayment.transfer_image,
              transferSmsUrl: currentPayment.sms_image,
              transferDate: formatDateForInput(currentPayment.created_at),
              smsText: currentPayment.sms,
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
            ...this.state,
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
            ...this.state,
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
              id: currentSurcharges?.id,
              note: currentSurcharges?.note,
            },
          })
        }}
      />
    )
  }

  paymentOfSupplier = () => {
    const { listProvider, orderId, activeClassName, paymentCustomerInfo, listMoneyNotPayForProvider } = this.state
    let isActive = activeClassName ? 'active' : ''
    return (
      <Col className={`px-2 tab-pane  ${isActive}`} id="supplier">
        <ChooseProvider orderId={orderId} getData={this.getData} onAddProvider={() => {}} />

        {listProvider.length ? (
          listProvider?.map((provider, index) => (
            <PaymentOfProvider
              key={index}
              provider={provider}
              index={index}
              onDeleteProvider={(currentIndex) =>
                this.setState({
                  currentIndexOfProvider: currentIndex,
                  confirmModalDeleteProvider: true,
                })
              }
              moneyNotPayForProvider={listMoneyNotPayForProvider[index]}
              orderIsFinished={paymentCustomerInfo?.payOff}
              onUpdateIsPayment={this.updateIsPaymentOfProvider}
              decisionOfHomeOwner={provider?.order_transactions?.[0]}
              depositOfHomeOwner={provider?.order_transactions?.[1]}
              moneyLeftToPayOfHomeOwner={provider?.order_transactions?.[2]}
              onShowModalUpdateOfHomeOwner={this.handleShowModalUpdateOfHomeOwner}
            />
          ))
        ) : (
          <div style={{ minHeight: '500px' }}></div>
        )}
      </Col>
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
        header: STRING.amountMoney,
      },
      {
        header: 'Nội dung',
      },
      {
        header: 'Ngày phát sinh',
      },
    ]

    return (
      <table className="table table-bordered table-striped table-responsive-sm">
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
    return (
      <table className={`table table-bordered table-striped`} style={{ width: '100%' }}>
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
                {value.is_epay ? '(Khách hàng chuyển khoản)' : '(Nhà cung cấp thu hộ)'}
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
    if (saleId) return false
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
      if (money && transferSmsUrl && smsText && status) return false
    }

    if (money && bank.value && transferSmsUrl && smsText && status) return false

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
        {this.renderConfirmModalDeleteProvider()}
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
        title={STRING.changeThePersonInCharge}
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
      // {
      //   type: TYPE_INPUT.checkbox,
      //   titleName: 'Cọc toàn bộ',
      //   valueName: 'payOff',
      //   value: payOff,
      //   detail: true,
      // },
      {
        type: TYPE_INPUT.file_front,
        titleName: `Ảnh CK`,
        value: transferImage,
        valueName: 'transferImage',
        url: transferImageUrl,
        urlName: 'transferImageUrl',
        detail: true,
      },
      {
        type: TYPE_INPUT.file_back,
        titleName: createPaymentOfCustomer ? `Ảnh SMS thu hộ` : `Ảnh SMS`,
        value: transferSms,
        valueName: 'transferSms',
        url: transferSmsUrl,
        urlName: 'transferSmsUrl',
      },
      {
        type: TYPE_INPUT.text_description,
        titleName: createPaymentOfCustomer ? 'SMS thu hộ' : 'SMS tiền về',
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
        checkValidateValue={allField.length > 2 ? this.checkValidateValueUpdateOfCustomer() : false}
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
            modal: initialValuesModal,
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
      {
        type: TYPE_INPUT.file_front,
        titleName: `Ảnh CK`,
        value: transferImage,
        valueName: 'transferImage',
        url: transferImageUrl,
        urlName: 'transferImageUrl',
      },
      {
        type: TYPE_INPUT.file_back,
        titleName: showModalUpdateDecisionOfHomeOwner ? `Ảnh SMS Chốt` : 'Ảnh SMS',
        value: transferSms,
        valueName: 'transferSms',
        url: transferSmsUrl,
        urlName: 'transferSmsUrl',
      },
      {
        type: TYPE_INPUT.text_description,
        titleName: showModalUpdateDecisionOfHomeOwner ? 'SMS chốt' : 'SMS',
        valueName: 'smsText',
        value: smsText,
        error: smsTextError,
      },
    ]

    if (showModalUpdateDecisionOfHomeOwner) {
      allField.unshift({
        type: TYPE_INPUT.textConvertToNumber,
        titleName: 'Giá nhập',
        valueName: 'money',
        value: money,
        error: moneyError,
      })
      allField.unshift({
        type: TYPE_INPUT.textConvertToNumber,
        titleName: 'Giá bán',
        valueName: 'price',
        value: price,
        error: priceError,
      })
      allField.splice(2, 1)
    } else {
      if (showModalUpdateMoneyLeftToPayOfHomeOwner || showModalUpdateDepositOfHomeOwner) {
        allField.unshift({
          type: TYPE_INPUT.text,
          titleName: STRING.bank,
          valueName: 'bank',
          value: bank,
          error: bankError,
        })
      }

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
            modal: initialValuesModal,
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
    const { price, note } = this.state.modalSurcharges
    let allField = [
      {
        type: TYPE_INPUT.textConvertToNumber,
        titleName: 'Số tiền',
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

  renderConfirmModalDeleteProvider = () => {
    return (
      <ConfirmModal
        isOpen={this.state.confirmModalDeleteProvider}
        onHide={() =>
          this.setState({
            confirmModalDeleteProvider: false,
          })
        }
        title={'xóa nhà cung cấp này'}
        action={this.deleteProvider}
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
        title={paymentCustomerInfo.payOff ? 'bỏ thanh toán hết' : 'thanh toán hết'}
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

  renderCard = () => {
    const { activeClassName } = this.state
    return (
      <>
        <div className="card col-12">
          <div className="card-header p-2">
            <ul className="nav nav-pills">
              <li className="nav-item" onClick={() => this.setState({ activeClassName: false })}>
                <a className={`nav-link ${!activeClassName ? 'active' : ''}`} href="#customer" data-toggle="tab">
                  {STRING.customer}
                </a>
              </li>
              <li className="nav-item" onClick={() => this.setState({ activeClassName: true })}>
                <a className={`nav-link ${activeClassName ? 'active' : ''}`} href="#supplier" data-toggle="tab">
                  {STRING.supplier}
                </a>
              </li>
            </ul>
          </div>

          {/* /.card-header */}
          <div className="card-body py-1 px-0">
            <div className="tab-content py-1" style={{ overflow: 'auto' }}>
              {this.paymentOfCustomer()}
              {this.paymentOfSupplier()}
            </div>
          </div>
        </div>
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

        {this.listenLocationChange()}
        {this.renderModal()}
        {this.renderCard()}
      </ScreenWrapper>
    )
  }
}
const mapDispatchToProps = {
  getListOverView,
}

export default connect(null, mapDispatchToProps)(OrderDetailScreen)
