const debug = require('debug');

class AppError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
    this.name = 'AppError';
  }
}
Error.create = function ({ code, message }) {
  const err = new AppError(code, message);
  // err.code = code;
  return err;
};
Error.errorInvalidParam = (message) => Error.create({ code: 9, message });
Error.prototype.withMessage = function withMessage(msg) {
  this.message = msg;
  return this;
};

module.exports = {
  AppError,
  // error code
  statusCode: {
    OK: 200,
    BAD_REQUEST: 400,
    INTERNAL_SERVER_ERROR: 500,
    UNAUTHORIZED: 403,
    MULTIPLE_CHOICES: 300,
    FORBIDDEN: 403,
  },

  apiCode: {
    SUCCESS: Error.create({ code: 1, message: 'Thành công' }),
    DB_ERROR: Error.create({ code: 2, message: 'Truy vấn lỗi' }),
    WRONG_TYPE_ACCOUNT: Error.create({ code: 3, message: 'Không đúng loại user' }),
    DELETE_IMAGE_ERROR: Error.create({ code: 4, message: 'Lỗi xoá ảnh' }),
    ACCOUNT_EXIST: Error.create({ code: 5, message: 'Tài khoản đã tồn tại' }),
    LOGIN_FAIL: Error.create({ code: 6, message: 'Sai tài khoản hoặc mật khẩu' }),
    UPLOAD_IMAGE_ERROR: Error.create({ code: 7, message: 'Lỗi upload media' }),
    CREATE_USER_ERROR: Error.create({ code: 8, message: 'Lỗi tạo tài khoản' }),
    INVALID_PARAM: Error.create({ code: 9, message: 'Tham số không hợp lệ' }),
    NOT_FOUND: Error.create({ code: 10, message: 'Dữ liệu không tồn tại ' }),
    UNAUTHORIZED: Error.create({ code: 403, message: 'Không có quyền truy cập' }),
    INVALID_ACCESS_TOKEN: Error.create({ code: 404, message: 'Token không hợp lệ' }),
    NO_PERMISSION: Error.create({ code: 11, message: 'Không có quyền thực hiện chức năng' }),
    EMAIL_EXIST: Error.create({ code: 5, message: 'Email đã tồn tại' }),
    UPDATE_FAIL: Error.create({ code: 12, message: 'Cập nhật lỗi' }),
    DESPOSI_FAIL: Error.create({ code: 49, message: 'Cập nhật lỗi' }),
    DELETE_FAIL: Error.create({ code: 13, message: 'Xoá lỗi' }),
    FAIL_CHANGE_PASS: Error.create({ code: 14, message: 'Mật khẩu không đúng' }),
  },
  config: {
    CRYPT_SALT: 10,
    PAGING_LIMIT: 12,
    RESET_PASSWORD: '123456a@',
    MAX_IMAGE: 5,
    TIME_UPDATE_FORM_QUESTION: 10,
  },
  phone: {
    MIN_SEARCH_PHONE_LENGTH: 5,
    MIN_CREATE_PHONE_LENGTH: 6,
    MAX_CREATE_PHONE_LENGTH: 15,
  },

  firebase: {
    ACCOUNT: '',
  },

  debug: {
    db: debug('app:dbquery'),
    log: debug('app:log'),
    debug: debug('app:debug'),
    error: debug('app:error'),
    email: debug('app:email'),
  },

  IS_ACTIVE: {
    ACTIVE: 1,
    INACTIVE: 0,
    DEACTIVE: 2,
  },

  ROLE: {
    ADMIN: 1,
    PROVIDER: 2,
    SALE: 3,
    CUSTOMER: 4,
    SALE_LEADER: 5,
    ACCOUNTANT: 6,
    EDITOR: 7,
  },
  ORDER_STATUS: {
    REJECTED: -1,
    CUSTOMER_CREATED: 1,
    ADMIN_CONFIRMED: 2,
    CHANGE_TO_SALE_LEADER: 5,
    CHANGE_TO_SALE: 5,
    SALE_CONFIRMED: 5,
    CHECK_IN: 6,
    CHECK_OUT: 7,
    SALE_REJECTED: 8,
    FINISHED: 10,
  },
  ORDER_WAITING: [1],
  ORDER_PROCESSING: [2, 3, 4, 5, 6, 7],
  ORDER_HISTORY: [-1, 10],

  ORDER_STATUS_OF_CUSTOMER: [-1],
  ORDER_STATUS_OF_SALE: [5, 8],
  ORDER_STATUS_OF_PROVIDER: [6, 7],
  ORDER_STATUS_OF_ADMIN: [-1, 10],

  PAYMENT_STATUS: {
    FALSE: -1, // thanh toán lỗi
    UNPAID: 1, // chưa thánh toán
    NOT_PAID_OFF: 2, // đã đặt cọc
    PAID: 3, // đặt cọc thành công
    SUCCESS: 4, // đặt cọc thành công
    ACCEPT_FOR_DESPOSIT: 5, // cho phép đặt cọc
    DESPOSIT_SUCCESS: 6, // đặt cọc thành công dữ chỗ cho khách
    CAN_CHECK_IN: 7, // có thế check in được
    SUCCESS_ALL: 10, // hoàn thành
  },

  TRANSFER_STATUS: {
    WAITING: 1,
    SUCCESS: 2,
    FALSE: -1,
  },
  CUSTOMER_TYPE: {
    ADULT: 1,
    CHILD: 2,
  },

  REVIEW_TYPE: {
    SERVICE: 1,
    SALE: 2,
  },
  NOTI_TYPE: {
    // customer
    CAN_PAYMENT: 1,
    USER_HISTORY: 2,
    CANCEL: 4,
    NEWS: 5,
    CHAT: 10,
    SUCCESS: 8,
    DESPOSIT_CUSTOMER: 13,
    ACCEPT_FOR_DESPOSIT: 14,
    DESPOSIT_SUCCESS: 15,
    CAN_CHECK_IN: 16,
    // sale
    ASIGNED: 3,
    DESPOSIT: 6,
    // providers
    NEW_ORDER: 7,
    TRANSACTION_OF_PROVIDER: 11,
    // websocket
    CUSTOMER_PAYMENT: 9,
  },

  PROFIT: {
    CUSTOMER: 0.01,
    SALE: 0.1,
  },

  USER_HISTORY_TYPE: {
    PROFIT: 1, // cộng điểm khi hoàn thành đơn
    USE_POINT: 2, // dùng điểm
    ROLL_BACK: 3, // trả lại điểm
    PAYMENT: 4, // trừ điểm khi quyết toán
    INVITE: 5, // cộng điểm khi giới thiệu app
  },
  KEY_CHAT_ADMIN: 'f895e2ab2f576d37619f8015a45a5d75',
  SOCKET_URL: 'http://3.1.13.10:3211',
};
