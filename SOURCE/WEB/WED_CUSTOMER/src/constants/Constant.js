const ROUTER = {
  LOGIN: '/dang-nhap',
  REGISTER: '/dang-ky',
  FORGOT_PASSWORD: '/quen-mat-khau',
  HOME_PAGE: '/trang-chu',
  REVIEW_PAGE: '/danh-gia',
  TOUR_PAGE: '/danh-sach-tour',
  TOUR_DETAIL_PAGE: '/chi-tiet-tour',
  CREATE_NEW_PASSWORD: '/tao-moi-mat-khau',
  NEW_DETAIL: '/chi-tiet-bai-viet',
  SERVICE_DETAIL: '/danh-sach-dich-vu',
  USER_INFO: '/thong-tin-nguoi-dung',
  BOOKING_LIST: '/danh-sach-dat-phong',
  BOOKING_DETAIL: '/chi-tiet-phong-dat',
  FAVOURITE_LIST: '/danh-sach-yeu-thich',
  RESULT_SEARCH: '/ket-qua-tim-kiem',
}

const STRING = {
  searchTourPlaceholder: 'Bạn cần tìm khách sạn, địa điểm du lịch nào?',
  search: 'Tìm kiếm',
  clearFilter: 'Xóa bộ lọc',
  apartment: 'Căn hộ',
  hotel: 'Khách sạn',
  villa: 'Biệt thự',
  room: 'Phòng',
  home: 'Nhà riêng',
  rankStar: 'Hạng sao',
  maybeNeed: 'Có thể bạn cần',
  description: 'Mô tả',
  service: 'Dịch vụ',
  schedule: 'Lịch trình',
  assessmentForm: 'Bài đánh giá',
  detailDescription: 'Mô tả chi tiết',
  tourCode: 'Mã tour',
  evaluate: 'Đánh giá',
  bookingInfo: 'Thông tin đặt lịch',
  timeUsedService: 'Thời gian sử dụng dịch vụ',
  amount: 'Số lượng',
  adults: 'Người lớn',
  children: 'Trẻ em',
  quote: 'Báo giá',
  booking: 'Đặt ngay',
  serviceInfo: 'Thông tin đặt dịch vụ',
  confirmAndQuote: 'Xác nhận và chờ báo giá',
  confirmButton: 'XÁC NHẬN >>',
  note: 'Ghi chú',
  noteEnter: 'Nhập ghi chú',
  endButton: 'KẾT THÚC >> ',
  profileManager: 'Quản lý hồ sơ cá nhân',
  bookingRoom: 'Đặt phòng',
  favoritesList: 'Danh sách yêu thích',
  login: 'Đăng nhập',
  logout: 'Đăng xuất',
  zone: 'Khu vực',
  tourCode: 'Mã căn',
  startDate: 'Ngày đến',
  toDate: 'Ngày đi',
  roomType: 'Loại phòng',
  people: 'Số người',
  status: 'Trạng thái',
  detail: 'Chi tiết',
  edit: 'Chỉnh sửa',
  cancel: 'Hủy',
  fullName: 'Họ và tên',
  dateOfBirth: 'Ngày sinh',
  region: 'Khu vực',
}

const COLOR = {
  MAIN_COLOR: '#0ABE35',
}

const IMAGE_REGION = [
  {
    id: 1,
    name: 'Tây Bắc',
    url: 'http://havatravel.vn/upload/images/havatravel-174110094144-ruong.jpg',
    shortDes:
      'Vùng Tây Bắc là vùng miền núi phía tây của miền Bắc Việt Nam, gồm 6 tỉnh Hòa Bình, Sơn La, Điện Biên, Lai Châu, Lào Cai, Yên Bái, có chung đường biên giới với Lào và Trung Quốc. Đến du lịch Tây Bắc du khách sẽ không khỏi nạc nhiên trước khung cảnh vùng núi trập trùng đẹp như tranh, trước cuộc sống của người dân vùng cao vẫn còn chút gì đó hoang sơ nhưng thật bình yên, êm ả.',
  },
  {
    id: 2,
    name: 'Đông Bắc',
    url: 'https://baogialai.com.vn/dataimages/201610/original/images1174624_1thac.jpg',
    shortDes:
      'Được thiên nhiên ưu đãi với cảnh quan thiên nhiên tuyệt đẹp của núi, thung lũng, thác nước và rừng mưa, du lịch Đông Bắc Việt Nam là điểm đến lý tưởng cho hành trình trải nghiệm những điều mới mẻ. Theo chân kinh nghiệm du lịch Đông Bắc tự túc tham gia vào các hoạt động thú vị chỉ có ở vùng Đông Bắc và ngắm nhìn vẻ đẹp hùng vĩ của núi rừng Đông Bắc.',
  },
  {
    id: 3,
    name: 'Đồng bằng sông Hồng',
    url: 'https://media.truyenhinhdulich.vn/upload/news/33_dong_bang_song_hong.jpg',
    shortDes:
      'Đồng bằng sông Hồng  là một vùng đất rộng lớn nằm quanh khu vực hạ lưu sông Hồng thuộc miền Bắc Việt Nam, vùng đất bao gồm 10 tỉnh và thành phố như: Bắc Ninh, Hà Nam, Hà Nội, Hải Dương, Hải Phòng, Hưng Yên, Nam Định, Ninh Bình, Thái Bình và Vĩnh Phúc.',
  },
  {
    id: 4,
    name: 'Bắc Trung Bộ',
    url: 'https://cdn3.ivivu.com/2015/05/kham-pha-bac-trung-bo-cung-duong-di-san-van-hoa-ivivu-1.jpg',
    shortDes:
      'Bắc Trung Bộ nằm gọn trên dải đất hẹp nhất của Việt Nam, giữa một bên là dãy Trường Sơn hùng vĩ, một bên là biển Đông mênh mông. Với đường bờ biển dài cùng nhiều cửa khẩu giáp với Lào, khu vực này có vị trí đặc biệt quan trọng trong phát triển kinh tế - du lịch giữa Việt Nam với các nước trong khu vực trên hành lang Đông - Tây.',
  },
  {
    id: 5,
    name: 'Nam Trung Bộ',
    url: 'https://media.truyenhinhdulich.vn/upload/news/35_duyen_hai_nam_trung_bo.jpg',
    shortDes:
      'Vùng Duyên hải Nam Trung Bộ tiếp giáp Đông Nam Bộ ở phía nam thuận lợi trong giao lưu phát triển kinh tế chịu ảnh hưởng mạnh mẽ của Đông Nam Bộ trong quá trình phát triển giáp với Tây Nguyên và là cửa ngõ ra biển của Tây Nguyên, Campuchia, Thái Lan, thuận lợi giao lưu phát triển kinh tế và hình thành nền kinh tế mở.',
  },
  {
    id: 6,
    name: 'Tây Nguyên',
    url: 'https://baogialai.com.vn/dataimages/202006/original/images2894093_1_15913419719771038118165.jpg',
    shortDes:
      'Khu vực tây Nguyên bao gồm các tỉnh Kon Tum, Gia Lai, Lâm Đồng, Đăk Lăk và Đăk Nông. Đến với vùng Tây Nguyên rộng lớn, du khách không chỉ có dịp chiêm ngưỡngnhững danh lam thắng cảnh tuyệt vời mà còn có cơ hội tham gia vào những trải nghiệm thú vị về cuộc sônngs của đồng bào các dân tộc ít người nơi đây nhưu Ba Na, Ê đê, Gia Rai,…thưởng thức những món ăn đặc sắc mang đậm nét đặc trưng của núi rừng Tây Nguyên. Với khí hậu tương đối dễ chịu, con người thân thiện gần gũi, chắc chắn Tây Nguyên sẽ làm say lòng mỗi du khách khi có dịp đến với nơi đây',
  },
  {
    id: 7,
    name: 'Đông Nam Bộ',
    url: 'https://www.sukien-teambuilding.com/wp-content/uploads/du-lich-mice-o-dong-nam-bo5.jpg',
    shortDes:
      'Đến Đông Nam Bộ, du khách có dịp tham quan Thành phố Hồ Chí Minh được ví như “Hòn ngọc Viễn Đông” với lịch sử hơn 300 năm, nơi có nhiều di tích cách mạng, công trình kiến trúc cổ như bến cảng nhà Rồng, địa đạo Củ Chi, dinh Độc Lập, đền Quốc Tổ, dinh Xã Tây, Nhà hát lớn, Bưu điện thành phố hay hệ thống các ngôi chùa cổ: Giác Lâm, Bà Thiên Hậu, Tổ Đình Giác Viên...; các nhà thờ Đức Bà, Huyện Sỹ, Thông Tây Hội, Thủ Đức...; các bảo tàng Chứng tích Chiến tranh, Phụ nữ Nam Bộ, Hồ Chí Minh, Mỹ thuật, Lịch sử Việt Nam',
  },
  {
    id: 8,
    name: 'Tây Nam Bộ',
    url: 'https://owa.bestprice.vn/images/articles/uploads/bat-mi-5-ly-do-khien-ban-nhat-dinh-phai-di-du-lich-mien-tay-5fc74caae1e96.jpg',
    shortDes:
      'Vùng đồng bằng sông Cửu Long là vùng cực Nam của Việt Nam, hay còn gọi là vùng đồng bằng sông Mê Kông, vùng đồng bằng Nam Bộ hoặc miền Tây Nam Bộ hoặc nói ngắn gọn là miền Tây thì người dân Việt Nam cũng có thể hiểu được. Miền Tây Nam Bộ gồm có 12 tỉnh (An Giang, Bạc Liêu, Bến Tre, Cà Mau, Đồng Tháp, Tiền Giang, Sóc Trăng, Long An, Hậu Giang, Kiên Giang, Trà Vinh, Vĩnh Long) và 1 thành phố trực thuộc Trung ương (Cần Thơ). Khác với thời tiết phía Bắc, khi Xuân về, miền Tây vẫn ấm áp với nắng hanh vàng rất thích hợp cho một chuyến du xuân. Asia Holiday Travel xin giới thiệu những nét khái quát về mảnh đất con người miền Tây đến với Quý khách nhân dịp Xuân kỷ hợi 2019.',
  },
]

const ORDER_STATUS = {
  REJECTED: -1,
  CUSTOMER_CREATED: 1,
  ADMIN_CONFIRMED: 2,
  CHANGE_TO_SALE_LEADER: 3,
  CHANGE_TO_SALE: 4,
  SALE_CONFIRMED: 5,
  CHECK_IN: 6,
  CHECK_OUT: 7,
  FINISHED: 10,
}

const PAYMENT_STATUS_NEW = {
  FALSE: -1, // thanh toán lỗi
  UNPAID: 1, // chưa thánh toán
  NOT_PAID_OFF: 2, // đã đặt cọc
  PAID: 3, // đặt cọc thành công
  SUCCESS: 4, // đặt cọc thành công
  ACCEPT_FOR_DESPOSIT: 5, // cho phép đặt cọc
  DESPOSIT_SUCCESS: 6, // đặt cọc thành công dữ chỗ cho khách
  CAN_CHECK_IN: 7, // có thế check in được
  SUCCESS_ALL: 10, // hoàn thành
}

const PAYMENT_STATUS = {
  UNPAID: 1,
  NOT_PAID_OFF: 2,
  PAID: 3,
}

const TRANSACTION = {
  DEPOSIT: 1,
  PAY_OFF: 2,
}

const ACCEPT_TYPE = {
  IMAGE: ['image/jpeg', 'image/jpg', 'image/png'],
}

const PEOPLE = {
  ADULTS: 1,
  CHILD: 2,
}

const ORDER_STATUS_STRING = [
  { value: 1, name: 'Đã tạo' },
  { value: 2, name: 'Admin xác nhận ' },
  { value: 3, name: 'Phân cho Sale Leader ' },
  { value: 4, name: 'Phân cho Sale ' },
  { value: 5, name: 'Sale đã xác nhận ' },
  { value: 6, name: 'Checkin' },
  { value: 7, name: 'Checkout ' },
  { value: 10, name: 'Hoàn thành ' },
  { value: -1, name: 'Đã hủy' },
]

//dat coc
const STATUS_SHOW_BUTTON_DEPOSIT_HISTORY = [-1, 1]
const STATUS_SHOW_BUTTON_DEPOSIT = [5]

// (STATUS_SHOW_BUTTON_DEPOSIT_HISTORY.includes(data.payment_status) && STATUS_SHOW_BUTTON_DEPOSIT.includes(data.status) && (data.price > 0))

// Thanh toan
const STATUS_SHOW_BUTTON_PAYMENT_HISTORY = [4]
const STATUS_SHOW_BUTTON_PAYMENT = [6]
// (STATUS_SHOW_BUTTON_PAYMENT_HISTORY.includes(data.payment_status) && STATUS_SHOW_BUTTON_PAYMENT.includes(data.status))

// const SOCKET_URL = 'http://3.1.13.10:3211'
// const SOCKET_URL = 'http://167.71.216.137:3211/socketio?product=1232'
const SOCKET_URL = process.env.REACT_APP_SOCKET_ENDPOINT_API

const CHAT_STATUS = {
  SALE_LEADER_CONFIRMED: 1,
  ADMIN_CHAT: 2,
  CUSTOMER_CHAT: 20,
  NEW_ORDER: 10,
  SALE_CHAT: 11,
  ORDER_PRICE: 21,
  DEPOSIT_TRANSACTION: 6,
  PAYMENT_TRANSACTION: 9,
  CHECK_IN_OR_CHECK_OUT: 22,
  KEEP_ORDER: 25,
  CAN_CHECK_IN: 26,
  CAN_DESPOSIT: 27,
  UPDATE_PRICE: 28,
  REQUEST_PAYMENT: 29
}

export {
  ROUTER,
  STRING,
  COLOR,
  IMAGE_REGION,
  ORDER_STATUS,
  PAYMENT_STATUS,
  PAYMENT_STATUS_NEW,
  TRANSACTION,
  ACCEPT_TYPE,
  PEOPLE,
  ORDER_STATUS_STRING,
  STATUS_SHOW_BUTTON_DEPOSIT_HISTORY,
  STATUS_SHOW_BUTTON_DEPOSIT,
  STATUS_SHOW_BUTTON_PAYMENT_HISTORY,
  STATUS_SHOW_BUTTON_PAYMENT,
  SOCKET_URL,
  CHAT_STATUS,
}
