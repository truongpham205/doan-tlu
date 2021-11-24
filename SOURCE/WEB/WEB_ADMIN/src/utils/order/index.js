import { ORDER_STATUS, PAYMENT_STATUS, STRING } from 'constants/Constant'
export const handleOrderStatus = (status) => {
  switch (status) {
    case ORDER_STATUS.REJECTED:
      return 'Từ chối'
    case ORDER_STATUS.CUSTOMER_CREATED:
      return 'Chờ xác nhận'
    case ORDER_STATUS.ADMIN_CONFIRMED:
      return 'Admin đã xác nhận'
    case ORDER_STATUS.CHANGE_TO_SALE_LEADER:
      return 'Chỉ định lead sale'
    case ORDER_STATUS.CHANGE_TO_SALE:
      return 'Chỉ định sale'
    case ORDER_STATUS.SALE_CONFIRMED:
      return 'Sale đã xác nhận'
    case ORDER_STATUS.CHECK_IN:
      return 'check in'
    case ORDER_STATUS.CHECK_OUT:
      return 'check out'
    case ORDER_STATUS.FINISHED:
      return 'Hoàn thành'
    default:
      break
  }
}

export const handlePaymentStatus = (status) => {
  switch (status) {
    case PAYMENT_STATUS.FALSE:
      return 'Thanh toán lỗi'
    case PAYMENT_STATUS.UNPAID:
      return 'Chưa thanh toán'
    case PAYMENT_STATUS.NOT_PAID_OFF:
      return 'Đã đặt cọc'
    case PAYMENT_STATUS.PAID:
      return 'Đặt cọc thành công'
    case PAYMENT_STATUS.SUCCESS:
      return 'Đã thanh toán'
    case PAYMENT_STATUS.ACCEPT_FOR_DESPOSIT:
      return 'Cho phép đặt cọc'
    case PAYMENT_STATUS.DESPOSIT_SUCCESS:
      return 'Giữ chỗ cho khách'
    case PAYMENT_STATUS.CAN_CHECK_IN:
      return 'Có thể check in'
    case PAYMENT_STATUS.SUCCESS_ALL:
      return 'Đã thanh toán hết'
    default:
      return STRING.notUpdate
  }
}
