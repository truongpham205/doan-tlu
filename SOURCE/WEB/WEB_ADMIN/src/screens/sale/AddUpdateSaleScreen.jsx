import React, { useState, useEffect, useRef, useMemo } from 'react'
import HeaderPage from 'components/HeaderPage'
import { STRING, ACCEPT_TYPE, ROUTER } from 'constants/Constant'
// import { Image } from 'antd'
import ScreenWrapper from 'components/ScreenWrapper'
import Select from 'react-select'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { FormFeedback, Input, Spinner, FormGroup, Row, Col, Label, Button } from 'reactstrap'
import { Image } from 'react-bootstrap'
import './style.css'
import { resizeFile } from 'utils/resize/resizeFile'
import { createFormData } from 'utils/createFormData'
import { formatDateForInput } from 'utils/helper'
import * as SaleApi from 'network/SaleApi'
import * as FilterApi from 'network/FilterApi'
// import 'yup-phone'
import PropTypes from 'prop-types'
import { withRouter, useHistory } from 'react-router-dom'
import { notifySuccess, notifyFail } from 'utils/notify'
// .matches(/(84|0[3|5|7|8|9])+([0-9]{8})\b/)

const schemaAdd = yup.object().shape({
  phone: yup
    .string()
    .required('số điện thoại không được để trống')
    .min(9)
    .matches(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, 'Số điện thoại không hợp lệ'),
  full_name: yup.string().required('Họ tên không được để trống'),
  password: yup.string().required('Mật khẩu không được để trống'),
  confirm_password: yup.string().required('Xác nhân mật khẩu không được để trống'),
  email: yup.string().email().required('email không được để trống'),
  address: yup.string().required('Địa chỉ không được để trống'),
  gender: yup.number().required('giới tính không được để trống'),
  identify: yup
    .string()
    .required('CMND không được để trống')
    .matches(/^[0-9]{9}$|^[0-9]{12}$/g, 'Số CMND không hợp lệ'),
  province_id: yup.object().required('Tỉnh/ Thành phố không được để trống'),
  profit: yup.string().required('Hoa hồng không được để trống'),
})

const schemaEdit = yup.object().shape({
  phone: yup.string(),
  full_name: yup.string().required('Họ tên không được để trống'),
  email: yup.string().email().required('email không được để trống'),
  address: yup.string().required('Địa chỉ không được để trống'),
  gender: yup.number().required('giới tính không được để trống'),
  identify: yup
    .string()
    .required('CMND không được để trống')
    .matches(/^[0-9]{9}$|^[0-9]{12}$/g, 'Số CMND không hợp lệ'),
  province_id: yup.object().required('Tỉnh/ Thành phố không được để trống'),
  profit: yup.string().required('Hoa hồng không được để trống'),
})

let schema = schemaAdd

const initialValues = {
  phone: '',
  full_name: '',
  password: '',
  confirm_password: '',
  email: '',
  address: '',
  gender: '',
  identify: '',
  province_id: '',
  profit: '',
}

AddUpdateSaleScreen.propTypes = {}

function AddUpdateSaleScreen(props) {
  if (props.match?.params?.id) {
    schema = schemaEdit
  }

  const { register, handleSubmit, errors, clearErrors, reset, watch, control } = useForm({
    resolver: yupResolver(schema),
  })
  const [isLoadingAddUpdate, setIsLoadingAddUpdate] = useState(true)
  const [editSale, setEditSale] = useState(false)
  const [listProvince, setListProvince] = useState([])
  const [defaultValues, setDefaultValues] = useState(initialValues)
  const [avatar, setAvatar] = useState({
    urlLocal: '',
    file: '',
  })
  const history = useHistory()
  const [saleId, setSaleId] = useState('')

  useEffect(() => {
    const { id } = props.match.params
    getListProvince()
    if (id) {
      getSaleDetail(id)
      setEditSale(true)
    } else {
      setIsLoadingAddUpdate(false)
    }
  }, [])

  const getSaleDetail = async (id) => {
    try {
      const saleDetail = await SaleApi.getSaleDetail({ id })
      setSaleId(id)
      const newInitialValues = {
        phone: saleDetail.data.phone,
        full_name: saleDetail.data.full_name,
        email: saleDetail.data.email,
        address: saleDetail.data.sale_info.address,
        gender: saleDetail.data.sale_info.gender,
        identify: saleDetail.data.sale_info.identify,
        province_id: {
          value: saleDetail.data?.sale_info?.province?.id,
          label: saleDetail.data?.sale_info?.province?.name,
        },
        profit: saleDetail.data.sale_info.profit,
        dob: formatDateForInput(saleDetail.data.sale_info.dob),
      }
      setAvatar({
        urlLocal: saleDetail.data.sale_info.profile_image,
        file: '',
      })
      setDefaultValues(newInitialValues)
      setIsLoadingAddUpdate(false)
    } catch (error) {
      console.log(error)
    }
  }

  const getListProvince = async () => {
    try {
      const listProvince = await FilterApi.getListProvince()
      let options = listProvince.data.map((province) => ({ value: province.id, label: province.name }))
      setListProvince(options)
    } catch (error) {
      console.log(error)
    }
  }

  // React.useEffect(() => {
  //   console.log('change') // custom register Antd input
  // }, [watch('province_id')])

  const onSubmit = async (data) => {
    try {
      const dataClone = { ...data }
      dataClone.image = avatar.file
      dataClone.province_id = data.province_id.value
      setIsLoadingAddUpdate(true)
      //edit sale
      if (editSale) {
        dataClone.id = saleId
        const payload = createFormData(dataClone)
        await SaleApi.updateSale(payload)
        setIsLoadingAddUpdate(false)
        setDefaultValues(initialValues)
        notifySuccess(STRING.editSuccess)
        history.goBack()
        return
      }
      // add sale
      const payload = createFormData(dataClone)
      await SaleApi.createSale(payload)
      setIsLoadingAddUpdate(false)
      setDefaultValues(initialValues)
      history.goBack()
      notifySuccess(STRING.addSuccess)
    } catch (error) {
      setDefaultValues(data)
      setIsLoadingAddUpdate(false)
      notifyFail(STRING.Fail)
    }
  }

  const handleUploadAvatar = async (event) => {
    if (!event.target.files[0]) return
    const urlLocal = (window.URL || window.webkitURL).createObjectURL(event.target?.files[0])
    if (!ACCEPT_TYPE.IMAGE.includes(event.target.files[0].type)) {
      alert(STRING.requiredVideoFormat)
      return
    }

    const image = await resizeFile(event.target.files[0])
    setAvatar({
      urlLocal: urlLocal,
      file: image,
    })
  }

  const renderHeader = () => {
    return <HeaderPage context={props} titleHeader={editSale ? STRING.editSale : STRING.addSale} />
  }

  const renderBody = () => {
    return (
      <Row>
        {renderContentLeft()}
        {renderContentRight()}
      </Row>
    )
  }

  const renderContentLeft = () => {
    return (
      <Col md="4" className="p-2 ">
        <div className="p-3 box--shadow">
          <p className="mb-1">{STRING.imageLogo}</p>
          <div
            className="img--logo px-2"
            htmlFor="upload-button"
            style={
              avatar.urlLocal
                ? {
                    backgroundImage: `url(${avatar.urlLocal})`,
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center center',
                    ObjectFit: 'contain',
                  }
                : {}
            }
          >
            <label
              htmlFor="upload-button"
              className="label-upload cursor"
              style={avatar.urlLocal ? { zIndex: 99, opacity: 0, width: '100%', height: '100%' } : {}}
            >
              {avatar.urlLocal ? (
                <></>
              ) : (
                <>
                  <i className="fas fa-image upload-icon mx-auto" />
                  <br />
                  <p className=" mb-0 text-muted">Bấm để chọn ảnh đại diện của telesale</p>
                </>
              )}
            </label>

            <input
              type="file"
              id="upload-button"
              accept=".jpg,.jpeg,.png"
              style={{ display: 'none' }}
              onChange={(e) => handleUploadAvatar(e)}
            ></input>
          </div>
        </div>
      </Col>
    )
  }

  const renderContentRight = () => {
    return (
      <Col md="8" className="p-2">
        <div className="px-4 py-3 box--shadow col-12">
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormGroup row>
              <Col sm>
                <Label for="exampleEmail">{STRING.fullName} (*)</Label>
                <input
                  placeholder={STRING.fullName}
                  className={errors.full_name?.message ? 'form-control is-invalid' : 'form-control'}
                  type="text"
                  defaultValue={defaultValues.full_name}
                  name="full_name"
                  required
                  ref={register({ required: true })}
                />
                {errors.full_name?.message && <span className="text--red">{errors.full_name?.message}</span>}
              </Col>

              <Col sm>
                <Label for="exampleEmail">{STRING.email} (*)</Label>
                <input
                  placeholder={STRING.email}
                  className={errors.email?.message ? 'form-control is-invalid' : 'form-control'}
                  type="email"
                  required
                  defaultValue={defaultValues.email}
                  name="email"
                  ref={register}
                />
                {errors.email?.message && <span className="text--red">{errors.email?.message}</span>}
              </Col>
            </FormGroup>

            <FormGroup row>
              <Col sm>
                <Label for="exampleEmail">{STRING.phoneNumber} (*)</Label>
                <input
                  placeholder={STRING.phoneNumber}
                  className={errors.email?.message ? 'form-control is-invalid' : 'form-control'}
                  type="tel"
                  name="phone"
                  disabled={editSale}
                  defaultValue={defaultValues.phone}
                  required
                  ref={register({ required: true })}
                />
                {errors.phone?.message && <span className="text--red">{errors.phone?.message}</span>}
              </Col>

              <Col sm>
                <Label for="exampleEmail">{STRING.dateOfBirth} (*)</Label>
                <input
                  placeholder={STRING.dateOfBirth}
                  className={errors.dob?.message ? 'form-control is-invalid' : 'form-control'}
                  type="date"
                  name="dob"
                  defaultValue={defaultValues.dob}
                  ref={register({ required: true })}
                />
                {errors.dob?.message && <span className="text--red">{errors.dob?.message}</span>}
              </Col>
            </FormGroup>

            <FormGroup row>
              <Col sm className="row">
                <Label for="exampleEmail" className="d-block col-12">
                  {STRING.sex} (*)
                </Label>
                <Col xs="6" className="text-center">
                  <input
                    type="radio"
                    className="mr-2 cursor"
                    name="gender"
                    value={1}
                    defaultChecked={defaultValues.gender == '1'}
                    ref={register({ required: true })}
                  />
                  {STRING.man}
                </Col>
                <Col xs="6">
                  <input
                    type="radio"
                    className="mr-2 cursor"
                    name="gender"
                    value={2}
                    defaultChecked={defaultValues.gender == '2'}
                    ref={register({ required: true })}
                  />{' '}
                  {STRING.women}
                </Col>
                {errors.gender?.message && <span className="text--red">{'Vui lòng chọn giới tính'}</span>}
              </Col>

              <Col sm="6">
                <Label for="exampleEmail">{STRING.province}</Label>
                <Controller
                  name="province_id"
                  rules={{ required: true }}
                  // ref={register({ required: true })}
                  defaultValue={defaultValues.province_id}
                  control={control}
                  placeholder={STRING.province}
                  options={listProvince}
                  as={Select}
                />
                {errors.province_id?.message && <span className="text--red">{'Vui lòng chọn Tỉnh/ Thành phố'}</span>}
              </Col>
            </FormGroup>

            <FormGroup row>
              <Col sm>
                <Label for="exampleEmail">{STRING.idCardNumber} (*)</Label>
                <input
                  placeholder={STRING.idCardNumber}
                  className={errors.identify?.message ? 'form-control is-invalid' : 'form-control'}
                  type="tel"
                  name="identify"
                  defaultValue={defaultValues.identify}
                  required
                  ref={register({ required: true })}
                />
                {errors.identify?.message && <span className="text--red">{errors.identify?.message}</span>}
              </Col>

              <Col sm>
                <Label for="exampleEmail">{STRING.saleCommission} (*)</Label>
                <input
                  placeholder={STRING.saleCommission}
                  className={errors.profit?.message ? 'form-control is-invalid' : 'form-control'}
                  type="number"
                  name="profit"
                  min="1"
                  max="100"
                  defaultValue={defaultValues.profit}
                  required
                  ref={register({ required: true })}
                />
                {errors.profit?.message && <span className="text--red">{errors.profit?.message}</span>}
              </Col>
            </FormGroup>

            <FormGroup row>
              <Label for="exampleEmail">{STRING.addressDetail}</Label>
              <input
                placeholder={STRING.addressDetail}
                type="text"
                className={errors.address?.message ? 'form-control is-invalid' : 'form-control'}
                required
                defaultValue={defaultValues.address}
                name="address"
                ref={register({ required: true })}
              />
              {errors.address?.message && <span className="text--red">{errors.address?.message}</span>}
            </FormGroup>

            {!editSale ? (
              <>
                <FormGroup row>
                  <Label for="exampleEmail">{STRING.passWord}</Label>
                  <input
                    placeholder={STRING.passWord}
                    className={errors.password?.message ? 'form-control is-invalid' : 'form-control'}
                    type="password"
                    name="password"
                    defaultValue={defaultValues.password}
                    required
                    ref={register({ required: true })}
                  />
                  {errors.password?.message && <span className="text--red">{errors.password?.message}</span>}
                </FormGroup>

                <FormGroup row>
                  <Label for="exampleEmail">{STRING.confirmPassWord}</Label>
                  <input
                    placeholder={STRING.confirmPassWord}
                    type="password"
                    name="confirm_password"
                    className={errors.confirm_password?.message ? 'form-control is-invalid' : 'form-control'}
                    required
                    defaultValue={defaultValues.confirm_password}
                    ref={register({ required: true })}
                  />
                  {errors.confirm_password?.message && (
                    <span className="text--red">{errors.confirm_password?.message}</span>
                  )}
                </FormGroup>
              </>
            ) : (
              ''
            )}

            <Col className="text-center">
              <Button color="danger">{STRING.cancel}</Button>
              <input type="submit" value={STRING.save} className="btn btn-success" />
            </Col>
          </form>
        </div>
      </Col>
    )
  }

  return (
    <ScreenWrapper renderHeader={renderHeader} titleHeader={'test'} isLoadingAddUpdate={isLoadingAddUpdate}>
      {renderBody()}
    </ScreenWrapper>
  )
}

export default withRouter(AddUpdateSaleScreen)
