import { ClockCircleOutlined } from '@ant-design/icons'
import Loading from '@components/Loading'
import { textError } from '@components/TextValidation'
import ImageUpload from '@components/UploadImage.jsx'
import {
  ACCEPT_TYPE,
  CHAT_STATUS,
  ORDER_STATUS,
  ORDER_STATUS_STRING,
  SOCKET_URL,
  STATUS_SHOW_BUTTON_DEPOSIT_HISTORY,
  STATUS_SHOW_BUTTON_PAYMENT,
  STATUS_SHOW_BUTTON_PAYMENT_HISTORY,
  STRING,
  TRANSACTION,
  PEOPLE,
  PAYMENT_STATUS_NEW,
} from '@constants/Constant'
import { Container } from '@material-ui/core'
import orderApi from '@networks/orderApi'
import userApi from '@networks/userApi'
import { createFormData } from '@utils/createFormData'
import Fire from '@utils/firebaseConfig'
import { handleRating } from '@utils/handleRating.js'
import { notifySuccess } from '@utils/notify'
import { Checkbox, Empty, Image, Radio, Rate, Timeline } from 'antd'
import axios from 'axios'
import Cookies from 'js-cookie'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { Button, FormControl, Modal, Table } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { useHistory, useParams } from 'react-router-dom'
import swal from 'sweetalert'
import { CountDownTime } from '../../../../components/CountDown'
import { ModalDetailCustomer } from './ModalOrderCustomer'
import { Tabs } from 'antd'
import { ErrorMessage } from '@hookform/error-message'
import QRCode from 'qrcode.react'

const { TabPane } = Tabs

function formatNumber(n) {
  return n.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

function formatPrice(price) {
  if (!price) return ''
  return price.toString().split('.').join('')
}

function BookingRoomDetail(props) {
  const params = useParams()
  const orderId = params.id
  const history = useHistory()
  const [userInfo, setUserInfo] = useState({})
  const [orderDetail, setOrderDetail] = useState({})
  const [isLoading, setLoading] = useState(false)
  const [modalUpload, setModalUpload] = useState(false)
  const [orderTransitionType, setOrderTransitionType] = useState(TRANSACTION.DEPOSIT)
  const [imageBakingDisplay, setImageBakingDisplay] = useState('')
  const [imageBakingUpload, setImageBakingUpload] = useState('')
  const [paymentStatus, setpaymentStatus] = useState(1)
  const [isUsePoint, setUsePoint] = useState(false)
  const [point, setPoint] = useState('')
  const [isCheck, setIsCheck] = useState(false)
  const [statusName, setStatusName] = useState('')
  const [showModalRating, setShowModalRating] = useState(false)
  const [rateService, setRateService] = useState(5)
  const [rateSale, setRateSale] = useState(5)
  const [noteService, setNoteService] = useState('')
  const [noteSale, setNoteSale] = useState('')
  const [transactionDetail, setTransactionDetail] = useState('')
  const [showModalTransaction, setShowModalTransaction] = useState(false)
  const [transactionName, setTransactionName] = useState('')
  const [isShowModal, setIsShowModal] = useState(false)
  const [showModalEditMember, setShowModalEditMember] = useState(false)
  const [memberInfo, setMemberInfo] = useState() //thông tin thành viên muốn chỉnh sửa
  const [openModalService, setOpenModalService] = useState(false)

  const { register, errors, handleSubmit, reset } = useForm({
    criteriaMode: 'all',
  })

  const createRoomChat = async () => {
    if (orderDetail?.sale?.key_chat) {
      const threadID = userInfo?.key_chat + orderDetail?.sale?.key_chat
      await Fire.shared.checkExistThread(threadID, (isExist) => {
        if (orderDetail?.sale?.key_chat && !isExist) {
          const threadID = userInfo?.key_chat + orderDetail?.sale?.key_chat
          const customerInfo = {
            keyChat: userInfo?.key_chat,
            avatar: userInfo?.customer_info?.profile_image,
            name: userInfo?.full_name,
            phone: userInfo?.phone,
          }
          const saleInfo = {
            keyChat: orderDetail?.sale?.key_chat,
            avatar: orderDetail?.sale?.profile_image,
            name: orderDetail?.sale?.full_name,
            phone: orderDetail?.sale?.phone,
          }
          const params = { threadID, customerInfo, saleInfo }
          Fire.shared.createThread(params, (value) => console.log(value))
          notifySuccess(
            `Tạo phòng chat thành công với ${orderDetail?.sale?.full_name}, click vào biểu tượng để bắt đầu chat`
          )
        } else {
          notifySuccess(
            `Phòng chat với ${orderDetail?.sale?.full_name} đã tồn tại, click vào biểu tượng để bắt đầu chat`
          )
        }
      })
    } else {
      notifySuccess('Đơn hàng chưa được chỉ định cho sale')
    }
  }

  const getFirstDataOrderDetail = async (id) => {
    setLoading(true)
    try {
      const params = {
        order_id: id,
      }
      const res = await orderApi.orderDetail(params)
      setOrderDetail(res.data)
      getStatusTour(res.data.status)
      setLoading(false)
      setTimeout(function () {
        if (res.data?.status == 10 && !res.data?.is_review) {
          setShowModalRating(true)
        }
      }, 1000)
      if (
        orderId === Cookies.get('orderHightlight') &&
        new Date() < new Date(res.data.end_payment_at) &&
        Number(res.data.payment_status) === PAYMENT_STATUS_NEW.ACCEPT_FOR_DESPOSIT
      ) {
        setModalUpload(true)
      }

      setTimeout(() => {
        Cookies.remove('orderHightlight')
      }, 2000)
      // Cookies.remove('orderHightlight')

      // return function cleanup() {
      //   Cookies.remove('orderHightlight')
      // }
      // getTransactionDetail(orderId)
    } catch (err) {
      swal('Thất bại', `${err.msg}`, 'error')
      setLoading(false)
    }
  }

  const getOrderDetail = async (id) => {
    setLoading(true)
    try {
      const params = {
        order_id: id,
      }
      const res = await orderApi.orderDetail(params)
      setOrderDetail(res.data)
      getStatusTour(res.data.status)
      setLoading(false)
    } catch (err) {
      swal('Thất bại', `${err.msg}`, 'error')
      setLoading(false)
    }
  }

  const requestPayment = async () => {
    setLoading(true)
    try {
      const params = {
        order_id: orderId,
      }
      const res = await orderApi.requestPayment(params)
      setLoading(false)
      getOrderDetail(orderId)
      pushNotiRequestPayment()
      swal('Thành công', `Đã gửi yêu cầu đặt cọc`, 'success')
    } catch (err) {
      swal('Thất bại', `${err.msg}`, 'error')
      setLoading(false)
    }
  }

  const getTransactionDetail = async (id) => {
    // setLoading(true)
    try {
      const params = {
        id: id,
      }
      const res = await orderApi.transactionDetail(params)
      setTransactionDetail(res.data)
      setLoading(false)
    } catch (err) {
      swal('Thất bại', `${err.msg}`, 'error')
      setLoading(false)
    }
  }

  const pushNotiAdmin = async () => {
    axios.defaults.baseURL = SOCKET_URL
    await axios
      .get('/socketio', {
        params: {
          type: paymentStatus === 1 ? CHAT_STATUS.DEPOSIT_TRANSACTION : CHAT_STATUS.PAYMENT_TRANSACTION,
          content:
            paymentStatus === 1
              ? `Đơn hàng ${orderDetail.code} đã được đặt cọc`
              : paymentStatus === 2
              ? `Đơn hàng ${orderDetail.code} đã được đặt cọc nốt`
              : `Đơn hàng ${orderDetail.code} đã được thanh toán`,
          order_id: orderId,
        },
      })
      .then(async function (response) {
        const paramsNoti = {
          order_id: orderId,
          type: 1, //1 cho admin và sale_leader, còn lại là khách hàng
          content:
            paymentStatus === 1
              ? `Đơn hàng ${orderDetail.code} đã được đặt cọc`
              : paymentStatus === 2
              ? `Đơn hàng ${orderDetail.code} đã được đặt cọc nốt`
              : `Đơn hàng ${orderDetail.code} đã được thanh toán`,
          metaData: {
            order_id: orderId,
            type_noti: paymentStatus === 1 ? CHAT_STATUS.DEPOSIT_TRANSACTION : CHAT_STATUS.PAYMENT_TRANSACTION,
            tab: 2, // đặt phòng là 2, đặt tour là 4
          },
          type_noti: paymentStatus === 1 ? CHAT_STATUS.DEPOSIT_TRANSACTION : CHAT_STATUS.PAYMENT_TRANSACTION,
        }
        await userApi.createNoti(paramsNoti)
      })
      .catch(function (error) {})
  }

  const pushNotiRequestPayment = async () => {
    axios.defaults.baseURL = SOCKET_URL
    await axios
      .get('/socketio', {
        params: {
          type: CHAT_STATUS.REQUEST_PAYMENT,
          content: 'Bạn có yêu cầu đặt cọc từ ' + orderDetail?.customer_name,
          order_id: orderId,
        },
      })
      .then(async function (response) {
        const paramsNoti = {
          order_id: orderId,
          type: 1, //1 cho admin và sale_leader, còn lại là khách hàng
          content: 'Bạn có yêu cầu đặt cọc từ ' + orderDetail?.customer_name,
          metaData: {
            order_id: orderId,
            type_noti: 2, // đặt phòng là 2, đặt tour là 4
          },
          type_noti: CHAT_STATUS.REQUEST_PAYMENT, // type của thông báo
        }
        await userApi.createNoti(paramsNoti)
      })
      .catch(function (error) {})
  }

  const createTransaction = async () => {
    setLoading(true)
    try {
      await orderApi.createTransaction(
        createFormData({
          order_id: orderId,
          use_point: formatPrice(point) || '',
          df_order_transaction_type_id: paymentStatus,
          transfer: imageBakingUpload,
        })
      )
      pushNotiAdmin()
      setLoading(false)
      swal('Thành công', 'Ảnh chuyển khoản đã được cập nhật', 'success').then(() => {
        clearData()
        getOrderDetail(orderId)
      })
      window.location.reload()
    } catch (err) {
      setLoading(false)
      swal('Thất bại', `${err.msg}`, 'error')
    }
  }

  const createReview = async () => {
    setLoading(true)
    try {
      await orderApi.orderReview({
        order_id: orderDetail?.id,
        rateService,
        rateSale,
        noteService,
        noteSale,
      })
      setShowModalRating(false)
      setLoading(false)
      swal('Thành công', 'Đánh giá của bạn đã được gửi', 'success')
    } catch (err) {
      setLoading(false)
      swal('Thất bại', `${err.msg}`, 'error')
    }
  }

  const clearData = () => {
    setModalUpload(false)
    setOrderTransitionType(TRANSACTION.DEPOSIT)
    setImageBakingDisplay('')
    setImageBakingUpload('')
    setpaymentStatus(1)
    setUsePoint(false)
    setPoint('')
    setIsCheck(false)
  }

  const handleChangeImage = (event) => {
    if (event.target?.files?.length <= 0) {
      return
    }
    if (event.target.files[0] && !ACCEPT_TYPE.IMAGE.includes(event.target.files[0].type)) {
      alert('Định dạng ảnh không được hỗ trợ. Vui lòng chọn ảnh khác.')
      return
    }
    setImageBakingDisplay(
      event.target.files[0] && (window.URL || window.webkitURL).createObjectURL(event.target.files[0])
    )
    setImageBakingUpload(event.target.files[0])
  }

  const getUserInfo = async () => {
    try {
      const res = await userApi.userInfo()
      setUserInfo(res.data)
    } catch (err) {
      swal('Thất bại', `${err.msg}`, 'error')
    }
  }

  useEffect(async () => {
    getFirstDataOrderDetail(orderId)
    getUserInfo()
  }, [])

  const onChangeCheckBox = (e) => {
    setOrderTransitionType(e.target.value)
  }

  const onChangeIsUsePoint = (e) => {
    if (e.target.checked) {
      setUsePoint(true)
    } else {
      setUsePoint(false)
    }
  }

  const checkCreatePayment = () => {
    setIsCheck(true)
    if (
      isUsePoint &&
      point &&
      (Number(formatPrice(point)) > Number(userInfo?.customer_info?.point) || Number(formatPrice(point)) < 0)
    ) {
    } else {
      createTransaction()
    }
  }

  const renderError = () => {
    if (isCheck) {
      if (!point) {
        return textError('Vui lòng nhập số điểm muốn sử dụng')
      } else if (Number(formatPrice(point)) > Number(userInfo?.customer_info?.point)) {
        return textError('Số điểm tích lũy không đủ')
      } else if (Number(formatPrice(point)) < 0) {
        return textError('Điểm không được âm')
      }
    }
  }

  const renderUploadModal = () => {
    let paymentHistory = []
    const temp =
      orderDetail?.transaction?.length &&
      orderDetail?.transaction?.map((value, key) => {
        if (value?.id === 1 || value?.id === 2 || value?.id === 6) {
          const temp_1 = value?.order_transactions?.forEach((item, index) => {
            paymentHistory.unshift(item)
          })
        }
      })

    let price =
      Number(orderDetail?.paymentStatus) === PAYMENT_STATUS_NEW.ACCEPT_FOR_DESPOSIT ||
      Number(orderDetail?.paymentStatus) === PAYMENT_STATUS_NEW.SUCCESS
        ? (Number(orderDetail?.price || 0) * 70) / 100
        : Number(orderDetail?.price || 0) + Number(orderDetail?.accompanied_service || 0)

    const temp1 =
      paymentHistory?.length > 0 &&
      paymentHistory?.map((value) => {
        price -= Number(value?.amount || 0)
      })

    return (
      <Modal
        show={modalUpload}
        onHide={() => setModalUpload(false)}
        dialogClassName="modal-90w"
        aria-labelledby="example-custom-modal-styling-title"
        centered
        className="pb-0"
        scrollable={true}
      >
        <Modal.Header closeButton>
          <h5 className="m-0">Cập nhật thông tin chuyển khoản</h5>
        </Modal.Header>
        <Modal.Body className="custom-body">
          <div className="row">
            <div className="ml-3 mr-3" style={{ flexGrow: 1 }}>
              <label>Số tiền còn thanh toán: </label>
              {Number(price) > 0 ? (
                <span className="ml-2">
                  {Number(price)?.toLocaleString('vi', {
                    currency: 'VND',
                  }) || 'Chưa cập nhật'}{' '}
                  VND
                </span>
              ) : (
                <span className="ml-2">0 VND</span>
              )}
              <br />
              {(Number(orderDetail?.payment_status) === PAYMENT_STATUS_NEW.ACCEPT_FOR_DESPOSIT ||
                Number(orderDetail?.payment_status) === PAYMENT_STATUS_NEW.SUCCESS) && (
                <div>
                  Nhận đủ 70% sẽ được giữ nhà: (Tối thiểu{' '}
                  {((Number(orderDetail?.price || 0) * 70) / 100)?.toLocaleString('vi', {
                    currency: 'VND',
                  }) || 'Chưa cập nhật'}{' '}
                  VND)
                </div>
              )}
              {/* {paymentStatus == 1 && (
                <>
                  <label>Hình thức thanh toán</label>
                  <br />
                  <Radio.Group onChange={(e) => onChangeCheckBox(e)} value={orderTransitionType}>
                    <Radio value={TRANSACTION.DEPOSIT}>Đặt cọc</Radio>
                    <Radio value={TRANSACTION.PAY_OFF}>Trả hết</Radio>
                  </Radio.Group>
                  <div>Nhận đủ 70% sẽ được giữ nhà</div>
                </>
              )} */}
              <Checkbox className="mt-2" onChange={(e) => onChangeIsUsePoint(e)}>{`Sử dụng điểm tích lũy (${Number(
                userInfo?.customer_info?.point || 0
              )?.toLocaleString('vi', {
                currency: 'VND',
              })} điểm)`}</Checkbox>
              <br />
              {isUsePoint && (
                <div>
                  <FormControl
                    // type="number"
                    placeholder="Nhập số điểm muốn sử dụng"
                    value={point}
                    onChange={(e) => setPoint(formatNumber(e.target.value))}
                  />
                  {renderError()}
                </div>
              )}
              <label className="mt-2">Ảnh chuyển khoản</label>
              <br />
              <ImageUpload
                src={imageBakingDisplay}
                id="upload1"
                sizeClass="image-size-md"
                onChange={(e) => handleChangeImage(e)}
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="row d-flex justify-content-center">
            <Button variant="success" className="mr-2" onClick={() => checkCreatePayment()}>
              Cập nhật
            </Button>
            <Button variant="danger" onClick={() => setModalUpload(false)}>
              Đóng
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    )
  }

  const renderModalService = () => {
    return (
      <Modal
        show={openModalService}
        onHide={() => setOpenModalService(false)}
        dialogClassName="modal-90w"
        aria-labelledby="example-custom-modal-styling-title"
        centered
        className="pb-0"
        scrollable={true}
      >
        <Modal.Header closeButton>
          <h5 className="m-0">Danh sách dịch vụ đi kèm</h5>
        </Modal.Header>
        <Modal.Body className="custom-body">
          <Table striped bordered responsive hover className="text-center">
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên dịch vụ</th>
                <th>Phát sinh bán</th>
              </tr>
            </thead>
            <tbody>
              {orderDetail?.order_surcharges?.length > 0 ? (
                orderDetail?.order_surcharges?.map((value, index) => (
                  <tr>
                    <td style={{ verticalAlign: 'middle' }}>{index + 1}</td>
                    <td style={{ verticalAlign: 'middle' }}>{value?.note || 'Chưa cập nhật'}</td>
                    <td style={{ verticalAlign: 'middle' }}>
                      {Number(value?.price).toLocaleString('vi', {
                        currency: 'VND',
                      }) + ' VNĐ' || 'Chưa cập nhật'}
                    </td>
                  </tr>
                ))
              ) : (
                <td colSpan="3">
                  <Empty description="Không có dịch vụ đi kèm" />
                </td>
              )}
            </tbody>
          </Table>
        </Modal.Body>
      </Modal>
    )
  }

  const handleChangeRateService = (value) => {
    setRateService(value)
  }

  const handleChangeRateSale = (value) => {
    setRateSale(value)
  }

  const renderModalRating = () => {
    return (
      <Modal
        show={showModalRating}
        onHide={() => setShowModalRating(false)}
        dialogClassName="modal-90w"
        aria-labelledby="example-custom-modal-styling-title"
        centered
        className="pb-0"
        size="md"
        scrollable={true}
      >
        <Modal.Header closeButton>
          <h5 className="m-0">Tổng quan chuyến đi</h5>
        </Modal.Header>
        <Modal.Body className="custom-body ml-0 mr-0">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: '50%', marginRight: '1rem' }}>
              <Image
                src={orderDetail?.service_image}
                style={{ objectFit: 'cover', cursor: 'pointer', borderRadius: '8px', width: '100%' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label className="label-type">{orderDetail?.service_category_name}</label>
                <div style={{ color: 'orange' }}>
                  <i className="fas fa-map-marker-alt mr-1"></i>
                  <span style={{ fontWeight: 500 }}>{orderDetail?.region_name}</span>
                </div>
              </div>

              <div style={{ fontWeight: 500 }}>{orderDetail?.service_name}</div>
              <div className="star p-0">{handleRating(orderDetail?.rating || 5)}</div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <div style={{ fontWeight: 500 }}>Tổng quan chuyến đi</div>
            <div>
              <Rate value={rateService} onChange={handleChangeRateService} />
            </div>
            <div>
              <textarea
                rows={4}
                className="w-100 form-control"
                placeholder="Viết đánh giá của bạn"
                value={noteService}
                onChange={(e) => setNoteService(e.target.value)}
              ></textarea>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <div style={{ fontWeight: 500 }}>Nhân viên tư vấn</div>
            <div>
              <Rate value={rateSale} onChange={handleChangeRateSale} />
            </div>
            <div>
              <textarea
                rows={4}
                className="w-100 form-control"
                placeholder="Viết đánh giá của bạn"
                value={noteSale}
                onChange={(e) => setNoteSale(e.target.value)}
              ></textarea>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer style={{ justifyContent: 'center' }}>
          <Button variant="success" onClick={() => createReview()}>
            Gửi đánh giá
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }

  const renderModalTransaction = () => {
    return (
      <Modal
        show={showModalTransaction}
        onHide={() => setShowModalTransaction(false)}
        dialogClassName="modal-90w"
        aria-labelledby="example-custom-modal-styling-title"
        centered
        className="pb-0"
        size="md"
        scrollable={true}
      >
        <Modal.Header closeButton>
          <h5 className="m-0">{transactionName}</h5>
        </Modal.Header>
        <Modal.Body className="custom-body ml-0 mr-0">
          <Timeline mode="alternate">
            {transactionDetail?.length > 0 &&
              transactionDetail?.map((value) => (
                <div>
                  <Timeline.Item dot={<ClockCircleOutlined style={{ fontSize: '16px' }} />}>
                    <div>{moment(value?.created_at || '').format('HH:MM DD/MM/YYYY')}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
                      <div>
                        {value?.transfer_image && (
                          <Image
                            src={value?.transfer_image}
                            style={{ objectFit: 'cover', borderRadius: '8px' }}
                          ></Image>
                        )}
                      </div>
                      <div>
                        {value?.sms_image && (
                          <Image src={value?.sms_image} style={{ objectFit: 'cover', borderRadius: '8px' }}></Image>
                        )}
                      </div>
                    </div>
                    <div>Tin nhắn SMS: {value?.sms || ''}</div>
                    <div>Ghi chú: {value?.note || ''}</div>
                  </Timeline.Item>
                </div>
              ))}
          </Timeline>
        </Modal.Body>
      </Modal>
    )
  }

  const getStatusTour = (status) => {
    const temp = ORDER_STATUS_STRING?.map((value) => {
      if (value.value == status) {
        setStatusName(value.name)
      }
    })
  }

  const editMember = async (data) => {
    if (Number(data.is_leader) === 1) {
      if (!memberInfo.font_id || !memberInfo.font_id || !data.identify) {
        swal(
          'Thất bại',
          'Trưởng đoàn yêu cầu nhập đầy đủ thông tin bao gồm CMND và ảnh bao gồm cả mặt trước và mặt sau',
          'error'
        )
        return
      }
    }
    setLoading(true)
    try {
      const formData = createFormData({
        id: memberInfo.id,
        order_id: orderDetail.id,
        name: data.name,
        identify: data.identify || '',
        type: memberInfo.type,
        old: Number(data.old),
        year: Number(data.year),
        font_id: memberInfo.font_id || '',
        back_id: memberInfo.back_id || '',
        is_leader: Number(data.is_leader),
      })
      await orderApi.createOrderCustomer(formData)
      swal('Thành công', 'Cập nhật thông tin thành công', 'success')
      setShowModalEditMember(false)
      setMemberInfo()
      setLoading(false)
      getOrderDetail(orderDetail.id)
    } catch (err) {
      setLoading(false)
      swal('Thất bại', `${err.msg}`, 'error')
    }
  }

  const renderModalEditMember = () => {
    return (
      <Modal
        show={showModalEditMember}
        onHide={() => setShowModalEditMember(false)}
        dialogClassName="modal-90w"
        aria-labelledby="example-custom-modal-styling-title"
        centered
        className="pb-0"
        size="lg"
        // scrollable={true}
      >
        <form action="#" method="post" onSubmit={handleSubmit(editMember)} style={{ width: '100%' }}>
          <Modal.Header closeButton>
            <h5 className="m-0">Sửa thông tin thành viên</h5>
          </Modal.Header>
          <Modal.Body className="custom-body">
            <div className="row">
              {Number(memberInfo?.type) === 1 && (
                <>
                  <div className="col-xl-6 col-md-12 mt-2 d-flex justify-content-center p-0">
                    {memberInfo?.font_id_display || memberInfo?.font_id ? (
                      <div>
                        <Image src={memberInfo?.font_id_display || memberInfo?.font_id} className="image-uploaded" />
                        <button onClick={() => setMemberInfo({ ...memberInfo, font_id: '', font_id_display: '' })}>
                          Xóa ảnh
                        </button>
                      </div>
                    ) : (
                      <label htmlFor="font_id_edit" style={{ cursor: 'pointer' }}>
                        <div className="upload-image">
                          <i className="fas fa-camera" style={{ fontSize: '2rem' }}></i>
                          <p className="icon-add">Ảnh mặt trước CMND</p>
                        </div>
                      </label>
                    )}

                    <FormControl
                      type="file"
                      id="font_id_edit"
                      accept=".jpg,.jpeg,.png"
                      hidden
                      onChange={(event) => {
                        if (event.target?.files?.length <= 0) {
                          return
                        }
                        if (event.target.files[0] && !ACCEPT_TYPE.IMAGE.includes(event.target.files[0].type)) {
                          alert('Định dạng ảnh không được hỗ trợ. Vui lòng chọn ảnh khác.')
                          return
                        }
                        setMemberInfo({
                          ...memberInfo,
                          font_id: event.target.files[0],
                          font_id_display:
                            event.target.files[0] &&
                            (window.URL || window.webkitURL).createObjectURL(event.target.files[0]),
                        })
                      }}
                    />
                  </div>

                  <div className="col-xl-6 col-md-12 mt-2 d-flex justify-content-center p-0">
                    {memberInfo?.back_id_display || memberInfo?.back_id ? (
                      <div>
                        <Image src={memberInfo?.back_id_display || memberInfo?.back_id} className="image-uploaded" />
                        <button onClick={() => setMemberInfo({ ...memberInfo, back_id: '', back_id_display: '' })}>
                          Xóa ảnh
                        </button>
                      </div>
                    ) : (
                      <label htmlFor="back_id_edit" style={{ cursor: 'pointer' }}>
                        <div className="upload-image">
                          <i className="fas fa-camera" style={{ fontSize: '2rem' }}></i>
                          <p className="icon-add">Ảnh mặt sau CMND</p>
                        </div>
                      </label>
                    )}

                    <FormControl
                      type="file"
                      id="back_id_edit"
                      accept=".jpg,.jpeg,.png"
                      hidden
                      onChange={(event) => {
                        if (event.target?.files?.length <= 0) {
                          return
                        }
                        if (event.target.files[0] && !ACCEPT_TYPE.IMAGE.includes(event.target.files[0].type)) {
                          alert('Định dạng ảnh không được hỗ trợ. Vui lòng chọn ảnh khác.')
                          return
                        }
                        setMemberInfo({
                          ...memberInfo,
                          back_id: event.target.files[0],
                          back_id_display:
                            event.target.files[0] &&
                            (window.URL || window.webkitURL).createObjectURL(event.target.files[0]),
                        })
                      }}
                    />
                  </div>
                </>
              )}
              {/* <form action="#" method="post" onSubmit={handleSubmit()} style={{ width: '100%' }}> */}
              <div className="col-sm-12 mt-3">
                <strong>Họ và tên</strong>
                <FormControl
                  type="text"
                  placeholder="Nhập tên thành viên"
                  defaultValue={memberInfo?.name}
                  name="name"
                  ref={register({
                    required: 'Vui lòng nhập đầy đủ thông tin',
                  })}
                  // value={memberInfo?.name}
                  // onChange={(e) => setMemberInfo({ ...memberInfo, name: e.target.value })}
                />
                <ErrorMessage
                  errors={errors}
                  name="name"
                  render={({ messages }) =>
                    messages &&
                    Object.entries(messages).map(([type, message]) => (
                      <p key={type} style={{ color: 'red' }}>
                        {message}
                      </p>
                    ))
                  }
                />
              </div>
              <div className="col-sm-12 mt-3">
                <strong>Vai trò</strong>
                <FormControl
                  as="select"
                  // value={memberInfo?.is_leader}
                  // onChange={(e) => setMemberInfo({ ...memberInfo, is_leader: e.target.value })}
                  defaultValue={memberInfo?.is_leader}
                  name="is_leader"
                  ref={register({
                    required: 'This is required.',
                  })}
                >
                  <option value={0}>Thành viên</option>
                  <option value={1}>Trưởng đoàn</option>
                </FormControl>
                <ErrorMessage
                  errors={errors}
                  name="is_leader"
                  render={({ messages }) =>
                    messages &&
                    Object.entries(messages).map(([type, message]) => (
                      <p key={type} style={{ color: 'red' }}>
                        {message}
                      </p>
                    ))
                  }
                />
              </div>
              <div className="col-sm-12 mt-3">
                <strong>Người lớn/Trẻ em</strong>
                <FormControl
                  as="select"
                  onChange={(e) => {
                    setMemberInfo({ ...memberInfo, type: e.target.value })
                  }}
                  value={memberInfo?.type}
                  // defaultValue={memberInfo?.type}
                  // name="type"
                  // ref={register({
                  //   required: 'This is required.',
                  // })}
                >
                  <option value={PEOPLE.ADULTS}>{STRING.adults}</option>
                  <option value={PEOPLE.CHILD}>{STRING.children}</option>
                </FormControl>
                <ErrorMessage
                  errors={errors}
                  name="type"
                  render={({ messages }) =>
                    messages &&
                    Object.entries(messages).map(([type, message]) => (
                      <p key={type} style={{ color: 'red' }}>
                        {message}
                      </p>
                    ))
                  }
                />
              </div>
              {Number(memberInfo?.type) === 1 && (
                <div className="col-sm-12 mt-3">
                  <strong>CMND</strong>
                  <FormControl
                    type="text"
                    placeholder="Nhập CMND/CCCD"
                    defaultValue={memberInfo?.identify}
                    name="identify"
                    ref={register({})}
                    // value={memberInfo?.identify}
                    // onChange={(e) => setMemberInfo({ ...memberInfo, identify: e.target.value })}
                  />
                  <ErrorMessage
                    errors={errors}
                    name="identify"
                    render={({ messages }) =>
                      messages &&
                      Object.entries(messages).map(([type, message]) => (
                        <p key={type} style={{ color: 'red' }}>
                          {message}
                        </p>
                      ))
                    }
                  />
                </div>
              )}
              <div className="col-sm-12 mt-3">
                <strong>Tuổi</strong>
                <FormControl
                  type="number"
                  placeholder="Nhập tuổi"
                  // value={memberInfo?.old}
                  // onChange={(e) => setMemberInfo({ ...memberInfo, old: e.target.value })}
                  defaultValue={memberInfo?.old}
                  name="old"
                  ref={register({
                    required: 'Vui lòng nhập đầy đủ thông tin',
                  })}
                />
                <ErrorMessage
                  errors={errors}
                  name="old"
                  render={({ messages }) =>
                    messages &&
                    Object.entries(messages).map(([type, message]) => (
                      <p key={type} style={{ color: 'red' }}>
                        {message}
                      </p>
                    ))
                  }
                />
              </div>
              <div className="col-sm-12 mt-3">
                <strong>Năm sinh</strong>
                <FormControl
                  type="number"
                  placeholder="Nhập năm sinh"
                  defaultValue={memberInfo?.year}
                  name="year"
                  ref={register({
                    required: 'Vui lòng nhập đầy đủ thông tin',
                  })}
                  // value={memberInfo?.year}
                  // onChange={(e) => setMemberInfo({ ...memberInfo, year: e.target.value })}
                />
                <ErrorMessage
                  errors={errors}
                  name="year"
                  render={({ messages }) =>
                    messages &&
                    Object.entries(messages).map(([type, message]) => (
                      <p key={type} style={{ color: 'red' }}>
                        {message}
                      </p>
                    ))
                  }
                />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <div className="row d-flex justify-content-center">
              <Button type="submit" variant="success" className="mr-2">
                Cập nhật
              </Button>
              <Button variant="danger" onClick={() => setShowModalEditMember(false)}>
                Đóng
              </Button>
            </div>
          </Modal.Footer>
        </form>
      </Modal>
    )
  }

  const renderButtonDeposit = () => {
    if (Number(orderDetail.payment_status) === PAYMENT_STATUS_NEW.UNPAID) {
      return (
        <Button
          variant="success"
          className="mt-1"
          onClick={() => requestPayment()}
          disabled={orderDetail.is_request_payment === 1}
        >
          Yêu cầu đặt cọc
        </Button>
      )
    } else {
      if (
        (Number(orderDetail.payment_status) === PAYMENT_STATUS_NEW.SUCCESS ||
          Number(orderDetail.payment_status) === PAYMENT_STATUS_NEW.ACCEPT_FOR_DESPOSIT ||
          Number(orderDetail.payment_status) === PAYMENT_STATUS_NEW.DESPOSIT_SUCCESS) &&
        orderDetail.price > 0
      ) {
        return (
          <>
            {/* <p className="m-0">Bạn có muốn đặt cọc để giữ nhà không?</p> */}
            {new Date() > new Date(orderDetail.end_payment_at) &&
              Number(orderDetail.payment_status) === PAYMENT_STATUS_NEW.ACCEPT_FOR_DESPOSIT && (
                <div>
                  <small>Hết thời gian đặt cọc</small>
                </div>
              )}
            {new Date() < new Date(orderDetail.end_payment_at) &&
              Number(orderDetail.payment_status) === PAYMENT_STATUS_NEW.ACCEPT_FOR_DESPOSIT && (
                <div>
                  <CountDownTime endTime={orderDetail?.end_payment_at} />
                </div>
              )}
            <Button
              variant="success"
              className="mt-1 mr-1"
              onClick={() => {
                Number(orderDetail.payment_status) === PAYMENT_STATUS_NEW.DESPOSIT_SUCCESS
                  ? setpaymentStatus(2)
                  : setpaymentStatus(1)
                setModalUpload(true)
              }}
              disabled={
                Number(orderDetail.payment_status) === PAYMENT_STATUS_NEW.ACCEPT_FOR_DESPOSIT &&
                new Date() > new Date(orderDetail.end_payment_at)
              }
            >
              {Number(orderDetail.payment_status) === PAYMENT_STATUS_NEW.DESPOSIT_SUCCESS ? 'Đặt cọc nốt' : 'Đặt cọc'}
            </Button>

            <Button variant="danger" className="mt-1" onClick={() => history.goBack()}>
              Để sau
            </Button>
          </>
        )
      } else if (Number(orderDetail.payment_status) === PAYMENT_STATUS_NEW.CAN_CHECK_IN) {
        return (
          <Button
            variant="success"
            className="mt-1 mr-1"
            onClick={() => {
              setpaymentStatus(6)
              setModalUpload(true)
            }}
          >
            Thanh toán
          </Button>
        )
      }
    }
  }

  const renderPaymentType = (item) => {
    if (Number(item?.df_order_transaction_type_id) === 6) {
      if (Number(item?.is_epay) === 0) {
        return <span>Thanh toán (Nhà cung cấp thu hộ)</span>
      } else {
        return <span>Thanh toán </span>
      }
    } else if (Number(item?.df_order_transaction_type_id) === 1) {
      return <span>Đặt cọc</span>
    } else if (Number(item?.df_order_transaction_type_id) === 2) {
      return <span>Đặt cọc nốt</span>
    }
  }

  const renderDesposit = () => {
    let paymentHistory = []
    const temp =
      orderDetail?.transaction?.length &&
      orderDetail?.transaction?.map((value, key) => {
        if (value?.id === 1 || value?.id === 2 || value?.id === 6) {
          const temp_1 = value?.order_transactions?.forEach((item, index) => {
            paymentHistory.unshift(item)
          })
        }
      })
    paymentHistory.sort((a, b) => (a.created_at > b.created_at ? 1 : -1))

    let paymentTotal = []
    const temp_2 =
      orderDetail?.transaction?.length &&
      orderDetail?.transaction?.map((value, key) => {
        if (value?.id === 1 || value?.id === 2 || value?.id === 6) {
          const temp_3 = value?.order_transactions?.forEach((item, index) => {
            paymentTotal.unshift(item)
          })
        }
      })

    let price =
      Number(orderDetail?.paymentStatus) === PAYMENT_STATUS_NEW.ACCEPT_FOR_DESPOSIT ||
      Number(orderDetail?.paymentStatus) === PAYMENT_STATUS_NEW.SUCCESS
        ? (Number(orderDetail?.price || 0) * 70) / 100
        : Number(orderDetail?.price || 0) + Number(orderDetail?.accompanied_service || 0)

    const temp4 =
      paymentTotal?.length > 0 &&
      paymentTotal?.map((value) => {
        price -= Number(value?.amount || 0)
      })
    let price_transaction = 0;

    const temp5 =
      paymentTotal?.length > 0 &&
      paymentTotal?.map((value) => {
        price_transaction += Number(value?.amount || 0)
      })
    return (
      <div className="infor-status-tour row mt-4">
        <div className="col-xl-12 col-xs-12">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="title_tab">Lịch sử chuyển khoản</span>
            <div>{renderButtonDeposit()}</div>
          </div>

          <div>
            <div style={{ color: 'green' }}>
              <span>Tổng số tiền đã thanh toán: </span>
              <span>
                {Number(price_transaction).toLocaleString('vi', {
                  currency: 'VND',
                }) + ' VNĐ'}
              </span>
            </div>

            <div style={{ color: 'red' }}>
              <span>Tổng số tiền còn thanh toán: </span>
              <span>
                {Number(price).toLocaleString('vi', {
                  currency: 'VND',
                }) + ' VNĐ'}
              </span>
            </div>
          </div>
          <div>
            <Tabs defaultActiveKey="1">
              {paymentHistory?.length > 0 &&
                paymentHistory.map((item, index) => {
                  return (
                    <TabPane tab={`Lần ${index + 1}`} key={index + 1}>
                      <div className="deposit_index">
                        <div className="transfer_infor mr-5">
                          <div className="mr-1">
                            {item?.transfer_image && (
                              <Image
                                src={item?.transfer_image}
                                width={200}
                                height={200}
                                style={{ objectFit: 'cover', borderRadius: '8px' }}
                              ></Image>
                            )}
                          </div>
                          <div>
                            {item?.sms_image && (
                              <Image
                                src={item?.sms_image}
                                width={200}
                                height={200}
                                style={{ objectFit: 'cover', borderRadius: '8px' }}
                              ></Image>
                            )}
                          </div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              backgroundColor: '#eeeeee',
                              padding: '1rem 0.3rem',
                            }}
                          >
                            <label className="m-0">Thời gian</label>
                            {/* <span>{moment(item?.created_at).format('HH:MM DD/MM/YYYY') || 'Chưa cập nhật'}</span> */}
                            <span>{moment(item?.created_at || '').format('HH:mm DD/MM/YYYY')}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0.3rem' }}>
                            <label className="m-0">Số tiền</label>
                            <span>
                              {Number(item?.amount).toLocaleString('vi', {
                                currency: 'VND',
                              }) + ' VNĐ'}
                            </span>
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              backgroundColor: '#eeeeee',
                              padding: '1rem 0.3rem',
                            }}
                          >
                            <label className="m-0">Loại chuyển khoản</label>
                            {renderPaymentType(item)}
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0.3rem' }}>
                            <label className="m-0">Trạng thái</label>
                            <span>
                              {Number(item?.status) === -1 ? (
                                <span style={{ color: '#C62828' }}>{`Từ chối (${item?.note})`}</span>
                              ) : Number(item?.status) === 2 ? (
                                <span style={{ color: '#8BC34A' }}>Thành công</span>
                              ) : (
                                <span style={{ color: '#FBC02D' }}>Chờ xác nhận</span>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </TabPane>
                  )
                })}
            </Tabs>
          </div>
        </div>
      </div>
    )
  }

  const renderMember = () => {
    return (
      <div className="infor-status-tour row mt-4">
        <div className="col-xl-12 col-xs-12">
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', justifyContent: 'space-between' }}>
            <span className="title_tab">Thông tin chi tiết danh sách thành viên</span>
            {orderDetail?.status != -1 &&
              orderDetail?.status != 7 &&
              orderDetail?.status != 10 &&
              orderDetail?.order_customers?.length === 0 &&
              (Number(orderDetail.payment_status) === PAYMENT_STATUS_NEW.DESPOSIT_SUCCESS ||
                Number(orderDetail.payment_status) === PAYMENT_STATUS_NEW.CAN_CHECK_IN) && ( // nếu đã cập nhật danh sách thành viên thì chỉ đc phép sửa
                <Button
                  variant="success"
                  onClick={() => {
                    setIsShowModal(true)
                  }}
                >
                  Cập nhật danh sách
                </Button>
              )}
            {/* <Button
              variant="success"
              onClick={() => {
                setIsShowModal(true)
              }}
            >
              Cập nhật danh sách
            </Button> */}
          </div>
          <Table striped bordered responsive hover className="text-center">
            <thead>
              <tr>
                <th>STT</th>
                <th>{STRING.fullName}</th>
                <th>Năm sinh</th>
                <th>Tuổi</th>
                <th>CMND/CCCD</th>
                <th>Ảnh mặt trước CMND</th>
                <th>Ảnh mặt sau CMND</th>
                <th>{STRING.note}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orderDetail?.order_customers?.length > 0 ? (
                orderDetail?.order_customers?.map((value, index) => (
                  <tr>
                    <td style={{ verticalAlign: 'middle' }}>{index + 1}</td>
                    <td style={{ verticalAlign: 'middle' }}>
                      {value?.name}
                      {Number(value?.is_leader) === 1 && <span className="text-danger"> (Trưởng đoàn)</span>}
                    </td>
                    <td style={{ verticalAlign: 'middle' }}>{value?.year || 'Chưa cập nhật'}</td>
                    <td style={{ verticalAlign: 'middle' }}>{value?.old || 'Chưa cập nhật'}</td>
                    <td style={{ verticalAlign: 'middle' }}>{value?.identify || 'Chưa cập nhật'}</td>
                    <td style={{ verticalAlign: 'middle' }}>
                      {/* <div> */}
                      {value?.font_id && (
                        <Image
                          src={value?.font_id}
                          alt="Ảnh mặt trước"
                          style={{ height: 'auto', width: '200px', margin: 'auto' }}
                        ></Image>
                      )}
                      {/* </div>
                      <div>
                        {value?.back_id && (
                          <Image
                            src={value?.back_id}
                            alt="Ảnh mặt sau"
                            style={{ height: 'auto', width: '200px', margin: 'auto' }}
                          ></Image>
                        )}
                      </div> */}
                    </td>
                    <td style={{ verticalAlign: 'middle' }}>
                      {value?.back_id && (
                        <Image
                          src={value?.back_id}
                          alt="Ảnh mặt sau"
                          style={{ height: 'auto', width: '200px', margin: 'auto' }}
                        ></Image>
                      )}
                    </td>
                    <td style={{ verticalAlign: 'middle' }}>
                      {value?.type ? (value?.type == 1 ? STRING.adults : STRING.children) : 'Chưa lưu thông tin'}
                    </td>
                    <td style={{ verticalAlign: 'middle' }}>
                      <div
                        className="table-icon-edit"
                        onClick={() => {
                          setMemberInfo(value)
                          setShowModalEditMember(true)
                        }}
                        // style={{ height: '3rem', width: '3rem' }}
                      >
                        <i className="fas fa-pencil-alt"></i>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <td colSpan="9">
                  <Empty description="Chưa cập nhật danh sách thành viên" />
                </td>
              )}
            </tbody>
          </Table>
        </div>
      </div>
    )
  }

  return (
    <Container maxWidth="lg">
      {(Number(orderDetail.payment_status) === PAYMENT_STATUS_NEW.SUCCESS ||
        Number(orderDetail.payment_status) === PAYMENT_STATUS_NEW.ACCEPT_FOR_DESPOSIT ||
        Number(orderDetail.payment_status) === PAYMENT_STATUS_NEW.DESPOSIT_SUCCESS ||
        Number(orderDetail.payment_status) === PAYMENT_STATUS_NEW.CAN_CHECK_IN) &&
        renderUploadModal()}
      <ModalDetailCustomer
        isShowModal={isShowModal}
        closeModal={() => setIsShowModal(false)}
        orderDetail={orderDetail}
        setLoading={(value) => setLoading(value)}
        getOrderDetail={(id) => getOrderDetail(id)}
      />
      {renderModalEditMember()}
      {renderModalRating()}
      {renderModalTransaction()}
      {renderModalService()}
      <div className="mt-4">
        {isLoading && <Loading />}
        <div className="row mt-3 mb-3">
          <h4 className="m-0 ml-3">CHI TIẾT ĐẶT PHÒNG</h4>
        </div>
        <div className="infor-status-tour row">
          <div className="col-md-9 info_left">
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <span className="title_tab">{orderDetail?.service_name || 'Chưa cập nhật'}</span>
              {/* <span className="status-tag">{statusName || 'Chưa cập nhật'}</span> */}
              <span
                style={{
                  backgroundColor: '#bdbdbd',
                  color: '#0abe35',
                  fontWeight: 'bold',
                  padding: '4px 8px',
                  borderRadius: '3px',
                }}
                className="ml-4"
              >
                {statusName || 'Chưa cập nhật'}
              </span>
            </div>

            <div className="row">
              <div className="col-sm-3">
                <div>
                  <div className="title_info">Ngày ở</div>
                  <div>
                    {`${moment(orderDetail?.checkin_at).format('DD/MM/YYYY')} - ${moment(
                      orderDetail?.checkout_at
                    ).format('DD/MM/YYYY')}`}
                  </div>
                </div>
                <div className="mt-2">
                  <div className="title_info">Số khách</div>
                  <div>{orderDetail?.adult + orderDetail?.children}</div>
                </div>
              </div>
              <div className="col-sm-3">
                <div>
                  <div className="title_info">Loại phòng</div>
                  <div>{orderDetail?.service_category_name}</div>
                </div>

                <div className="mt-2">
                  <div className="title_info">Dịch vụ đi kèm</div>
                  <div>
                    {Number(orderDetail?.accompanied_service).toLocaleString('vi', {
                      currency: 'VND',
                    }) + ' VNĐ' || 'Chưa cập nhật'}
                  </div>
                  <i
                    style={{ color: '#0abe35', cursor: 'pointer', fontSize: '0.8rem' }}
                    onClick={() => setOpenModalService(true)}
                  >{`Xem chi tiết`}</i>
                </div>
              </div>
              <div className="col-sm-3">
                <div>
                  <div className="title_info">Khu vực</div>
                  <div>{orderDetail?.region_name}</div>
                </div>

                <div className={orderId === Cookies.get('orderHightlight') ? 'hightlight mt-2' : 'mt-2'}>
                  <div className="title_info">Giá trị đơn hàng</div>
                  <div>
                    {Number(orderDetail?.price).toLocaleString('vi', {
                      currency: 'VND',
                    }) + ' VNĐ' || 'Chưa cập nhật'}
                  </div>
                </div>
              </div>

              <div className="col-sm-3">
                <div>
                  <div className="title_info">Mã QR</div>
                  <div>
                    <QRCode value={orderDetail?.code || ''} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <span className="title_tab">Tư vấn</span>
            <div>Bạn cần giúp đỡ ?</div>
            <div>
              {orderDetail?.status == 10 && (
                <span>
                  <Button
                    variant="success"
                    className="mr-1 mt-1"
                    onClick={() => setShowModalRating(true)}
                    disabled={orderDetail?.is_review}
                  >
                    {orderDetail?.is_review ? 'Đã đánh giá' : 'Đánh giá'}
                  </Button>
                </span>
              )}
              {(orderDetail?.status === ORDER_STATUS.SALE_CONFIRMED ||
                orderDetail?.status === ORDER_STATUS.CHECK_IN ||
                orderDetail?.status === ORDER_STATUS.CHECK_OUT ||
                orderDetail?.status === ORDER_STATUS.FINISHED) &&
                orderDetail?.sale?.key_chat && (
                  <span>
                    <Button variant="warning" className="text-light mt-1" onClick={() => createRoomChat()}>
                      Chat
                    </Button>
                  </span>
                )}
            </div>
          </div>
        </div>
        {orderDetail?.price > 0 && renderDesposit()}
        {/* {Number(orderDetail.payment_status) !== PAYMENT_STATUS_NEW.UNPAID && renderDesposit()} */}
        {renderMember()}
      </div>
    </Container>
  )
}

export default BookingRoomDetail
