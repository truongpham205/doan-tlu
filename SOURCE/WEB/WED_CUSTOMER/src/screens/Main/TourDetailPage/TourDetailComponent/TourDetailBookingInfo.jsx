import React, { useState, useEffect } from 'react'
import { DatePicker, Space, Image } from 'antd'
import moment from 'moment'
import { Button, Modal, Form } from 'react-bootstrap'
import swal from 'sweetalert'
import { useParams } from 'react-router-dom'

import { STRING, SOCKET_URL, CHAT_STATUS } from '@constants/Constant'
import Counter from '@components/Counter.jsx'
import orderApi from '@networks/orderApi'
import Loading from '@components/Loading'
import { getImage } from '@utils/getImage.js'
import { textError } from '@components/TextValidation'
import axios from 'axios'
import userApi from '@networks/userApi'

const { RangePicker } = DatePicker

TourDetailBookingInfo.propTypes = {}

function TourDetailBookingInfo(props) {
  const { tourDetail, userInfo } = props
  const [amountAdults, setAmountAdults] = useState(0)
  const [amountChildren, setAmountChildren] = useState(0)
  const [modal, setModal] = useState(false)
  const [tabActive, setTabActive] = useState('info')
  const [note, setNote] = useState('')
  const [checkin_at, setCheckInAt] = useState('')
  const [checkout_at, setCheckOutAt] = useState('')
  const [isLoading, setLoading] = useState(false)
  const [defaultValue, setDefaultValue] = useState('')
  const [isCheck, setIsCheck] = useState(false)

  const image = tourDetail?.service_images && getImage(tourDetail?.service_images)
  // tourDetail?.service_images?.length > 0 && tourDetail?.service_images[tourDetail?.service_images?.length - 1].path
  const params = useParams()

  const pushNotiAdmin = async (name, typeName, orderId) => {
    axios.defaults.baseURL = SOCKET_URL
    await axios
      .get('/socketio', {
        params: {
          type: CHAT_STATUS.NEW_ORDER,
          content: 'Bạn có đơn đặt ' + typeName + ' từ ' + name + '!',
        },
      })
      .then(async function (response) {
        const paramsNoti = {
          order_id: orderId,
          type: 1, //1 cho admin và sale_leader, còn lại là khách hàng
          content: 'Bạn có đơn đặt ' + typeName + ' từ ' + name + '!',
          metaData: {
            order_id: orderId,
            type_noti: 1, // đặt phòng là 1, đặt tour là 3
          },
          type_noti: CHAT_STATUS.NEW_ORDER, // type của thông báo
        }
        await userApi.createNoti(paramsNoti)
      })
      .catch(function (error) {})
  }

  const createOrder = async () => {
    setLoading(true)
    try {
      const payload = {
        customer_name: userInfo?.full_name || '',
        customer_phone: userInfo?.phone || '',
        // customer_address: userInfo?.customer_info?.address || '',
        customer_address: 'Nam Định',
        service_id: Number(params?.id) || '',
        checkin_at: moment(checkin_at, 'DD/MM/YYYY').format('YYYY/MM/DD') || '',
        checkout_at: moment(checkout_at, 'DD/MM/YYYY').format('YYYY/MM/DD') || '',
        adult: amountAdults || '',
        children: amountChildren || '',
        note: note || '',
      }
      const res = await orderApi.createOrder(payload)
      pushNotiAdmin(userInfo?.full_name, tourDetail?.service_category_name, res.data?.id)
      setLoading(false)
      swal('Thành công', 'Đặt lịch thành công', 'success', {
        button: {
          text: 'OK',
        },
      }).then(() => handleChange(setTabActive, 'confirm'))
    } catch (err) {
      setLoading(false)
      swal('Thất bại', `${err.msg}`, 'error')
    }
  }

  const clearData = () => {
    setTabActive('info')
    // setAmountAdults(0)
    // setAmountChildren(0)
    // setNote('')
  }

  const handleDecrementAdults = () => {
    if (amountAdults > 0) {
      setAmountAdults(amountAdults - 1)
    }
  }

  const handleIncrementAdults = () => {
    setAmountAdults(amountAdults + 1)
  }

  const handleDecrementChildren = () => {
    if (amountChildren > 0) {
      setAmountChildren(amountChildren - 1)
    }
  }

  const handleIncrementChildren = () => {
    setAmountChildren(amountChildren + 1)
  }

  const handleChange = (fun, value) => {
    fun(value)
  }

  const handleChangeDatePicker = (e) => {
    if (e) {
      setCheckInAt(moment(e[0]._d).format('DD/MM/YYYY'))
      setCheckOutAt(moment(e[1]._d).format('DD/MM/YYYY'))
    }
  }

  const checkOpenModal = () => {
    setIsCheck(true)

    if (!checkin_at || !checkout_at || amountAdults == 0) {
    } else {
      setModal(true)
    }
  }

  const renderBookingModal = () => {
    return (
      <Modal
        show={modal}
        onHide={() => {
          setModal(false)
          clearData()
        }}
        dialogClassName="modal-90w"
        centered
        size="lg"
        scrollable={true}
      >
        <Modal.Header>
          <div className="d-flex" style={{ width: '100%', justifyContent: 'space-around' }}>
            <div
              className={tabActive === 'info' ? 'text-center tab-booking-active' : 'text-center tab-booking'}
              onClick={() => handleChange(setTabActive, 'info')}
            >
              <div>
                <label className="number-icon">1</label>
              </div>
              <div>
                <label>{STRING.serviceInfo}</label>
              </div>
            </div>
            <i className="fas fa-chevron-right mt-3"></i>
            <div
              className={tabActive === 'confirm' ? 'text-center tab-booking-active' : 'text-center tab-booking'}
              // onClick={() => handleChange(setTabActive, 'confirm')}
            >
              <div>
                <label className="number-icon">2</label>
              </div>
              <div>
                <label>{STRING.confirmAndQuote}</label>
              </div>
            </div>
          </div>
        </Modal.Header>

        <Modal.Body>
          {tabActive === 'info' && (
            <div className="row">
              <div className="col-sm-6 tab-booking_left" style={{ borderRight: '1px solid #9e9e9e' }}>
                <div className="row" style={{ marginLeft: '8px' }}>
                  <label className="label-type">{tourDetail?.service_category_name}</label>
                </div>
                <div className="row" style={{ marginLeft: '8px' }}>
                  <div>
                    <label className="m-0">{tourDetail?.name}</label>
                  </div>
                  <span>
                    <label className="text-yellow">{tourDetail?.rating && tourDetail?.rating.toFixed(1)}</label>
                  </span>
                  <span>
                    <i className="fas fa-star text-yellow"></i>
                  </span>
                </div>
                <div className="row">
                  <Image
                    // width={350}
                    // height={200}
                    src={`${image}`}
                    style={{ objectFit: 'cover', cursor: 'pointer', borderRadius: '8px' }}
                  />
                </div>
              </div>
              <div className="col-sm-6">
                <p className="m-0">Thời gian</p>
                <label>
                  Từ {checkin_at} - đến {checkout_at}
                </label>
                <p className="m-0 pt-2">Số lượng</p>
                <label>
                  {amountAdults} {STRING.adults}, {amountChildren} {STRING.children}
                </label>
                <p className="m-0 pt-4">{STRING.note}</p>
                <Form.Control
                  as="textarea"
                  placeholder={STRING.noteEnter}
                  rows="4"
                  value={note}
                  onChange={(e) => handleChange(setNote, e.target.value)}
                />
              </div>
            </div>
          )}
          {tabActive === 'confirm' && (
            <div className="row">
              <img src={require('@assets/done-image.jpg')} style={{ margin: 'auto', width: '30%' }}></img>
              <h5 style={{ margin: 'auto' }}>Bạn đã đặt lịch thành công, yêu cầu của bạn sẽ sớm được xác nhận</h5>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="justify-content-end">
          {tabActive === 'info' ? (
            <h6 style={{ color: '#0abe35', cursor: 'pointer' }} onClick={() => createOrder()}>
              {STRING.confirmButton}
            </h6>
          ) : (
            <h6
              style={{ color: '#0abe35', cursor: 'pointer' }}
              onClick={
                (() => {
                  setModal(false)
                  clearData()
                },
                () => {
                  window.location.reload()
                })
              }
            >
              {STRING.endButton}
            </h6>
          )}
        </Modal.Footer>
      </Modal>
    )
  }

  function disabledDate(current) {
    // Can not select days before today and today
    return current && current < moment().endOf('day')
  }

  return (
    <>
      {renderBookingModal()}
      {isLoading && <Loading />}
      <div className="booking-bg mb-3">
        <label className="booking-title">{STRING.bookingInfo}</label>
        <div>
          <label>{STRING.timeUsedService}</label>
          <br />
          <Space direction="vertical">
            <RangePicker
              onChange={(e) => handleChangeDatePicker(e)}
              disabledDate={disabledDate}
              defaultValue={[checkin_at, checkout_at]}
              placeholder={['Từ ngày', 'Đến ngày']}
              format="DD/MM/YYYY"
            />
          </Space>
        </div>
        {isCheck && (!checkin_at || !checkout_at) && textError('Vui lòng chọn thời gian')}
        <div>
          <div className="mt-3">
            <div>
              <label>{STRING.amount}</label>
            </div>
            <div>
              <div className="row">
                <div className="col-5">
                  <span className="mr-3">{STRING.adults}:</span>
                </div>
                <div className="col-7">
                  <span>
                    <Counter
                      value={amountAdults}
                      handleDecrement={handleDecrementAdults}
                      handleIncrement={handleIncrementAdults}
                    />
                  </span>
                </div>
                {isCheck && amountAdults == 0 && textError('Chọn ít nhất 1 người lớn')}
              </div>

              <div className="row">
                <div className="col-5">
                  <span className="mr-3">{STRING.children}:</span>
                </div>
                <div className="col-7">
                  <span>
                    <Counter
                      value={amountChildren}
                      handleDecrement={handleDecrementChildren}
                      handleIncrement={handleIncrementChildren}
                    />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className="row mt-3 booking-buttons">
            {/* <Button variant="success" className="text-light mr-2 btn-booking">
              {STRING.quote}
            </Button> */}
            <Button variant="warning" className="text-light btn-booking" onClick={() => checkOpenModal()}>
              {STRING.booking}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export default TourDetailBookingInfo
