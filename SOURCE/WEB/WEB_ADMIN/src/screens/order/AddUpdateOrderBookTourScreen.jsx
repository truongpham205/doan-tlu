import HeaderPage from 'components/HeaderPage'
import ScreenWrapper from 'components/ScreenWrapper'
import ModalComponent from 'components/ModalComponent'
import { STRING, TYPE_INPUT } from 'constants/Constant'
import reactotron from 'debug/ReactotronConfig'
import { Input, AutoComplete } from 'antd'
import React, { useEffect, useState, useRef } from 'react'
import DatePicker from 'react-datepicker'
import { Controller, useForm } from 'react-hook-form'
import Select from 'react-select'
import * as CustomerApi from 'network/CustomerApi'
import * as RoomTypeApi from 'network/RoomTypeApi'
import * as FilterApi from 'network/FilterApi'
import * as RoomApi from 'network/RoomApi'
import * as OrderApi from 'network/OrderApi'
import { Button, Col, FormGroup, Label, Row } from 'reactstrap'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { toDateString } from 'utils/helper'
import './style.css'
import { createFormData } from 'utils/createFormData'
import { notifySuccess, notifyFail } from 'utils/notify'
import { withRouter, useHistory } from 'react-router-dom'
import swal from 'sweetalert'
AddUpdateOrderBookTourScreen.propTypes = {}

const initialValues = {
  customer_phone: '',
  customer_name: '',
  customer_address: '',
  adult: '',
  children: '',
  customer_id: '',
  service_id: '',
  province_id: '',
  service_category_id: '',
}

const initialCustomer = {
  value: '',
  label: '',
  address: '',
  phone: '',
  code: '',
}

const initialModal = {
  fullName: '',
  phoneNumber: '',
  email: '',
  address: '',
  passWord: '',
}

const schema = yup.object().shape({
  // phone: yup.number().required('số điện thoại không được để trống'),
  customer_phone: yup
    .string()
    .required('số điện thoại không được để trống')
    .min(9)
    .matches(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, 'Số điện thoại không hợp lệ'),
  customer_name: yup.string().required('Họ tên không được để trống'),
  customer_address: yup.string().required('Địa chỉ không được để trống'),
  adult: yup.number().required('Vui lòng điền số lượng'),
  children: yup.number().required('Vui lòng điền số lượng'),
  customer_id: yup.object().required('Khách hàng không được để trống'),
  service_id: yup.object().required('Tên căn không được để trống'),
})

function AddUpdateOrderBookTourScreen(props) {
  const [isLoadingAddUpdate, setIsLoadingAddUpdate] = useState(true)
  const [createCustomer, setCreateCustomer] = useState(false)
  const [checkinDate, setCheckInDate] = useState()
  const [listCustomer, setListCustomer] = useState([])
  const [defaultValues, setDefaultValues] = useState(initialValues)
  const [listRoomType, setListRoomType] = useState([])
  const [listProvince, setListProvince] = useState([])
  const [listRoom, setListRoom] = useState([])
  const [checkoutDate, setCheckOutDate] = useState()
  const [customer, setCustomer] = useState(initialCustomer)
  const [modal, setModal] = useState(initialModal)
  const { control, handleSubmit, watch, register, errors, setValue } = useForm({
    resolver: yupResolver(schema),
  })
  const history = useHistory()
  const customerRef = useRef(null)

  useEffect(() => {
    // getListCustomer()
    getListRoomType()
    getListProvince()
    setIsLoadingAddUpdate(false)
  }, [])

  useEffect(() => {
    getListRoom()
  }, [watch('service_category_id') || watch('province_id')])

  useEffect(() => {
    setValue('customer_name', customer?.label)
    setValue('customer_phone', customer?.phone)
    setValue('customer_address', customer?.address)
  }, [customer?.code])

  const getListCustomer = async () => {
    try {
      const listCustomerApi = await CustomerApi.getListCustomer()
      setListCustomer(
        listCustomerApi.data.map((customer, index) => ({
          value: customer.full_name,
          label: customer.full_name,
          address: customer.address,
          phone: customer.phone,
          code: customer.id,
          key: index,
        }))
      )
    } catch (error) {
      console.log(error)
    }
  }

  const getListRoomType = async () => {
    try {
      const listRoomTypeApi = await RoomTypeApi.getListRoomType()
      setListRoomType(
        listRoomTypeApi.data.map((roomType) => ({
          value: roomType.id,
          label: roomType.name,
        }))
      )
    } catch (error) {
      console.log(error)
    }
  }

  const getListProvince = async () => {
    try {
      const listProvinceApi = await FilterApi.getListProvince()
      setListProvince(
        listProvinceApi.data.map((province) => ({
          value: province.id,
          label: province.name,
          code: province.code,
        }))
      )
    } catch (error) {
      console.log(error)
    }
  }

  const getListRoom = async () => {
    const service_category_id = watch('service_category_id')?.value || ''
    const province_id = watch('province_id')?.value || ''
    const payload = {
      service_category_id: 1,
      province_id,
    }
    try {
      const listRoomApi = await RoomApi.getListRoom(payload)
      setListRoom(
        listRoomApi.data.map((room) => ({
          value: room.id,
          label: room.name,
        }))
      )
    } catch (error) {
      console.log(error)
    }
  }

  async function onSubmit(data) {
    // we need clone because if call Api is error we will can keep value in input
    if (!customer?.code) {
      swal({
        title: 'Vui lòng chọn khách hàng!',
        icon: 'error',
      })
      return
    }
    const dataClone = { ...data }
    dataClone.checkin_at = toDateString(checkinDate)
    dataClone.checkout_at = toDateString(checkoutDate)
    dataClone.customer_id = customer?.code
    dataClone.service_id = data.service_id.value
    dataClone.province_id = data.province_id.value

    try {
      setIsLoadingAddUpdate(true)
      const payload = createFormData(dataClone)
      await OrderApi.createOrderBookRoom(payload)
      setIsLoadingAddUpdate(false)
      setDefaultValues(initialValues)
      notifySuccess(STRING.addSuccess)
      history.goBack()
    } catch (error) {
      setDefaultValues(data)
      setIsLoadingAddUpdate(false)
      notifyFail(STRING.addFail)
    }
  }
  const addCustomer = async () => {
    setIsLoadingAddUpdate(true)
    try {
      const payload = {
        phone: modal.phoneNumber,
        full_name: modal.fullName,
        email: modal.email,
        address: modal.address,
        password: modal.passWord,
      }
      await CustomerApi.registerCustomer(payload)
      setIsLoadingAddUpdate(false)
      setCreateCustomer(false)
      setModal(initialModal)
      notifySuccess(STRING.addSuccess)
    } catch (error) {
      setIsLoadingAddUpdate(false)
      console.log(error)
    }
  }

  const onSearch = (searchText) => {
    if (!searchText) {
      clearTimeout(customerRef.current)
      setListCustomer([])
      return
    }

    if (customerRef.current) {
      clearTimeout(customerRef.current)
    }

    customerRef.current = setTimeout(() => {
      if (searchText) {
        getListCustomer(searchText)
      }
    }, 300)
  }

  const onSelect = (data, option) => {
    setCustomer(option)
  }

  const onChange = (data) => {
    setCustomer({
      ...customer,
      value: data,
    })
  }

  const renderHeader = () => {
    return <HeaderPage context={props} titleHeader="Tạo đơn hàng" />
  }

  const handleInputModal = (fieldName, value) => {
    setModal({
      ...modal,
      [fieldName]: value,
    })
  }

  const checkValidateValue = () => {
    if (modal.fullName && modal.phoneNumber && modal.passWord && modal.email && modal.address) {
      return false
    }
    return true
  }

  const renderModal = () => {
    const addField = [
      {
        type: TYPE_INPUT.text,
        titleName: STRING.fullName,
        value: modal.fullName,
        // error: validateError.fullNameError,
        valueName: 'fullName',
        // errorName: 'fullNameError',
      },
      {
        type: TYPE_INPUT.phoneNumber,
        titleName: STRING.phoneNumber,
        value: modal.phoneNumber,
        // error: validateError.phoneNumberError,
        valueName: 'phoneNumber',
        // errorName: 'phoneNumberError',
      },
      {
        type: TYPE_INPUT.email,
        titleName: STRING.email,
        value: modal.email,
        // error: validateError.emailError,
        valueName: 'email',
        // errorName: 'emailError',
      },
      {
        type: TYPE_INPUT.text,
        titleName: STRING.address,
        value: modal.address,
        // error: validateError.fullNameError,
        valueName: 'address',
        // errorName: 'fullNameError',
      },
      {
        type: TYPE_INPUT.passWord,
        titleName: STRING.passWord,
        value: modal.passWord,
        // error: validateError.passWordError,
        valueName: 'passWord',
        // errorName: 'passWordError',
      },
    ]
    return (
      <ModalComponent
        allField={addField}
        title={'Thêm khách hàng'}
        // checkValidateError={validateError}
        checkValidateValue={checkValidateValue()}
        handleInputModal={handleInputModal}
        isOpen={createCustomer}
        handleBlur={() => {}}
        addUpdate={addCustomer}
        onHide={() => {
          setCreateCustomer(false)
          setModal(initialModal)
        }}
      />
    )
  }

  const renderContentLeft = () => {
    return (
      <Col xl="6" className="p-2">
        <div className="px-3 py-3 box--shadow ">
          <Col className="d-block pl-0 mb-3">
            <h5>{STRING.orderInfo}</h5>
          </Col>
          <Row className="mb-3">
            <Col sm="3">
              <Label for="customerName">{STRING.customer}</Label>
            </Col>
            <Col sm="9">
              <AutoComplete
                dropdownClassName="certain-category-search-dropdown"
                dropdownMatchSelectWidth={500}
                value={customer?.value}
                options={listCustomer}
                // defaultValue={customer?.value}
                style={{ width: '100%' }}
                onSelect={onSelect}
                onSearch={onSearch}
                onChange={onChange}
              >
                <Input
                  size="large"
                  placeholder="Chọn khách hàng"
                  suffix={
                    <i
                      className="fas fa-plus-circle"
                      style={{ fontSize: '20px' }}
                      onClick={() => setCreateCustomer(true)}
                    ></i>
                  }
                />
              </AutoComplete>
              {/* <Controller
                name="customer_id"
                rules={{ required: true }}
                defaultValue={defaultValues.customer_id}
                control={control}
                placeholder={STRING.customer}
                options={listCustomer}
                isSearchable={true}
                isClearable={true}
                as={Select}
              />
              {errors.customer_id?.message && <span className="text--red">{'Vui lòng chọn Khách hàng'}</span>} */}
            </Col>
          </Row>
          <Row className="mb-3">
            <Col sm="3">
              <Label for="customerName">{STRING.orderer}</Label>
            </Col>
            <Col sm="9">
              <input
                name="customer_name"
                type="text"
                defaultValue={defaultValues.customer_name}
                className={errors.customer_name?.message ? 'form-control is-invalid' : 'form-control'}
                ref={register({ required: true })}
                placeholder={`Nhập tên ${STRING.orderer.toLowerCase()}`}
              ></input>
              {errors.customer_name?.message && (
                <span className="invalid-feedback">{errors.customer_name?.message}</span>
              )}
            </Col>
          </Row>
          <Row className="mb-3">
            <Col sm="3">
              <Label for="customerName">{STRING.phoneNumber}</Label>
            </Col>
            <Col sm="9">
              <input
                name="customer_phone"
                className={errors.customer_phone?.message ? 'form-control is-invalid' : 'form-control'}
                type="tel"
                defaultValue={defaultValues.customer_phone}
                ref={register({ required: true })}
                placeholder={`Nhập ${STRING.phoneNumber.toLowerCase()}`}
              ></input>
              {errors.customer_phone?.message && (
                <span className="invalid-feedback">{errors.customer_phone?.message}</span>
              )}
            </Col>
          </Row>
          <Row className="mb-3">
            <Col sm="3">
              <Label for="customerName">{STRING.address}</Label>
            </Col>
            <Col sm="9">
              <input
                className={errors.customer_address?.message ? 'form-control is-invalid' : 'form-control'}
                name="customer_address"
                defaultValue={defaultValues.customer_address}
                type="text"
                ref={register({ required: true })}
                placeholder={`Nhập ${STRING.address.toLowerCase()}`}
              ></input>
              {errors.customer_address?.message && (
                <span className="invalid-feedback">{errors.customer_address?.message}</span>
              )}
            </Col>
          </Row>
          <Row className="">
            <Col sm="3">
              <Label for="customerName">{STRING.time}</Label>
            </Col>
            <Col sm="9" className="row pr-0">
              <Col sm="6">
                <DatePicker
                  className="form-control"
                  selected={checkinDate}
                  placeholderText="Ngày đi"
                  locale="vi"
                  dateFormat="dd/MM/yyyy"
                  onChange={(date) => setCheckInDate(date)}
                  maxDate={checkoutDate}
                />
              </Col>
              <Col sm="6 pr-0">
                <DatePicker
                  className="form-control"
                  selected={checkoutDate}
                  placeholderText="Ngày về"
                  locale="vi"
                  dateFormat="dd/MM/yyyy"
                  onChange={(date) => setCheckOutDate(date)}
                  minDate={checkinDate}
                />
              </Col>
            </Col>
          </Row>
        </div>
      </Col>
    )
  }

  const renderContentRight = () => {
    return (
      <Col xl="6" className="pl-2 py-2 pr-1">
        <div className="px-4 pt-3 box--shadow col-12" style={{ paddingBottom: '2.2rem' }}>
          <Col className="d-block pl-0 mb-3">
            <h5>Thông tin đặt lịch</h5>
          </Col>
          <FormGroup row>
            <Col sm="3">
              <Label for="exampleEmail">{STRING.serviceType}</Label>
            </Col>
            <Col sm="9">Đặt tour</Col>
          </FormGroup>

          {/* <FormGroup row>
            <Col sm="3">
              <Label for="exampleEmail">{STRING.roomType}</Label>
            </Col>
            <Col sm="9">
              <Controller
                name="service_category_id"
                control={control}
                defaultValue={defaultValues.service_category_id}
                placeholder={STRING.roomType}
                options={listRoomType}
                isSearchable={true}
                isClearable={true}
                as={Select}
              />
            </Col>
          </FormGroup> */}
          <FormGroup row>
            <Col sm="3">
              <Label for="exampleEmail">{STRING.zone}</Label>
            </Col>
            <Col sm="9">
              <Controller
                name="province_id"
                control={control}
                defaultValue={defaultValues.province_id}
                placeholder={STRING.zone}
                options={listProvince}
                isSearchable={true}
                isClearable={true}
                as={Select}
              />
            </Col>
          </FormGroup>
          <FormGroup row>
            <Col sm="3">
              <Label for="exampleEmail">{STRING.tourName}</Label>
            </Col>
            <Col sm="9">
              <Controller
                name="service_id"
                control={control}
                rules={{ required: true }}
                defaultValue={defaultValues.service_id}
                placeholder={STRING.tourName}
                options={listRoom}
                isSearchable={true}
                isClearable={true}
                as={Select}
              />
              {errors.service_id?.message && <span className="text--red">{'Vui lòng chọn tên căn'}</span>}
            </Col>
          </FormGroup>
          {/* numberOfGuests */}
          <Row className="mb-2">
            <Col sm="3">
              <Label for="customerName">{STRING.numberOfGuests}</Label>
            </Col>
            <Col sm="9" className="row">
              <Col sm="6" className="pl-1">
                <input
                  type="number"
                  name="adult"
                  defaultValue={defaultValues.adult}
                  className={
                    errors.adult?.message
                      ? 'form-control is-invalid  d-inline-block mr-2'
                      : 'form-control d-inline-block mr-2'
                  }
                  ref={register({ required: true })}
                  style={{ width: '45%' }}
                />
                <span>{STRING.adults}</span>
              </Col>
              <Col sm="6">
                <input
                  className={
                    errors.children?.message
                      ? 'form-control is-invalid  d-inline-block mr-2'
                      : 'form-control d-inline-block mr-2'
                  }
                  type="number"
                  defaultValue={defaultValues.children}
                  name="children"
                  ref={register({ required: true })}
                  style={{ width: '50%' }}
                />
                <span>{STRING.children}</span>
              </Col>
            </Col>
          </Row>
          {/* time */}

          {/* note */}
          <Row className="form-group">
            <Col sm="3">
              <Label for="note">{STRING.note}</Label>
            </Col>
            <Col sm="9">
              <input
                placeholder={STRING.note}
                className="form-control"
                defaultValue={defaultValues.note}
                type="text-area"
                name="note"
                ref={register}
              />
            </Col>
          </Row>
        </div>
      </Col>
    )
  }

  const renderBody = () => {
    return (
      <Row>
        {renderModal()}
        <form onSubmit={handleSubmit(onSubmit)} className="col-12 row pr-0">
          {renderContentLeft()}
          {renderContentRight()}
          <Col className="text-center mt-4">
            <Button color="danger">{STRING.cancel}</Button>
            <input type="submit" value={STRING.save} className="btn btn-success" />
          </Col>
        </form>
      </Row>
    )
  }

  return (
    <ScreenWrapper renderHeader={renderHeader} titleHeader={'test'} isLoadingAddUpdate={isLoadingAddUpdate}>
      {renderBody()}
    </ScreenWrapper>
  )
}

export default withRouter(AddUpdateOrderBookTourScreen)
