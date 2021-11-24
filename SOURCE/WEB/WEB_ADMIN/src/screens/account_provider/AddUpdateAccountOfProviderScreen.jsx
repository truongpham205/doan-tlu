import React, { useState, useEffect, useCallback } from 'react'
import HeaderPage from 'components/HeaderPage'
import { STRING, ACCEPT_TYPE, ROUTER, ROLE } from 'constants/Constant'
import ScreenWrapper from 'components/ScreenWrapper'
import Select from 'react-select'
import { FormFeedback, Input, Spinner, FormGroup, Row, Col, Label, Button } from 'reactstrap'
// import './style.css'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

import * as FilterApi from 'network/FilterApi'
import * as ProviderTypeApi from 'network/ProviderTypeApi'
import * as ProviderApi from 'network/ProviderApi'
import { resizeFile } from 'utils/resize/resizeFile'
import { createFormData } from 'utils/createFormData'
import { withRouter, useHistory } from 'react-router-dom'
import { notifySuccess, notifyFail } from 'utils/notify'
AddUpdateAccountOfProviderScreen.propTypes = {}

const initialValues = {
  phone: '',
  full_name: '',
  password: '',
  email: '',
  address: '',
  provider_type_id: '',
  provider_name: '',
}

function AddUpdateAccountOfProviderScreen(props) {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'))
  const isProvider = userInfo?.role_id == ROLE.PROVIDER
  const schemaAdd = yup.object().shape({
    // phone: yup.number().required('số điện thoại không được để trống'),
    phone: yup
      .string()
      .required('số điện thoại không được để trống')
      .min(9)
      .matches(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, 'Số điện thoại không hợp lệ'),
    // full_name: yup.string().required('Người liên hệ không được để trống'),
    password: yup.string().required('Mật khẩu không được để trống'),
    confirm_password: yup.string().required('Xác nhân mật khẩu không được để trống'),
    email: yup.string().email().required('email không được để trống'),
    // .required('email không được để trống'),
    address: yup.string().required('Địa chỉ  không được để trống'),
    provider_type_id: !isProvider ? yup.object().required('Loại nhà cung cấp không được để trống') : '',
    provider_name: yup.string().required('Tên nhà cung cấp không được để trống'),
  })

  const schemaEdit = yup.object().shape({
    // phone: yup.number().required('số điện thoại không được để trống'),
    phone: yup
      .string()
      .required('số điện thoại không được để trống')
      .min(9)
      .matches(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, 'Số điện thoại không hợp lệ'),
    // full_name: yup.string().required('Người liên hệ không được để trống'),
    email: yup.string().email().required('email không được để trống'),
    // .required('email không được để trống'),
    address: yup.string().required('Địa chỉ  không được để trống'),
    provider_type_id: !isProvider ? yup.object().required('Loại nhà cung cấp không được để trống') : '',
    provider_name: yup.string().required('Tên nhà cung cấp không được để trống'),
  })

  let schema = schemaAdd

  if (props.match?.params?.id) {
    schema = schemaEdit
  }
  const [isLoadingAddUpdate, setIsLoadingAddUpdate] = useState(true)
  const { register, handleSubmit, errors, clearErrors, reset, watch, control } = useForm({
    resolver: yupResolver(schema),
  })
  const [defaultValues, setDefaultValues] = useState(initialValues)
  const [listProviderType, setListProviderType] = useState([])
  const [providerId, setProviderId] = useState('')
  const [editProvider, setEditProvider] = useState(false)
  const [avatar, setAvatar] = useState({
    urlLocal: '',
    file: '',
  })
  const history = useHistory()

  useEffect(() => {
    const { id } = props.match.params
    !isProvider && getListProviderType()
    if (id) {
      getProviderDetail(id)
      setEditProvider(true)
    } else {
      setIsLoadingAddUpdate(false)
    }
  }, [])

  const getProviderDetail = async (id) => {
    try {
      const providerDetail = await ProviderApi.getListAccountProvider({ id })
      setProviderId(id)
      const newInitialValues = {
        phone: providerDetail?.data?.phone,
        full_name: providerDetail?.data?.full_name,
        email: providerDetail?.data?.email,
        address: providerDetail?.data?.provider_info?.address,
        provider_type_id: {
          value: providerDetail?.data?.provider_info?.provider_type?.id,
          label: providerDetail?.data?.provider_info?.provider_type?.name,
        },
        provider_name: providerDetail?.data?.provider_info?.provider_name,
      }
      setDefaultValues(newInitialValues)
      setIsLoadingAddUpdate(false)
    } catch (error) {
      console.log(error)
      setIsLoadingAddUpdate(false)
    }
  }

  const getListProviderType = async () => {
    try {
      const listProviderType = await ProviderTypeApi.getListProviderType()
      let options = listProviderType.data.map((providerType) => ({ value: providerType.id, label: providerType.name }))
      setListProviderType(options)
    } catch (error) {
      console.log(error)
    }
  }

  const onSubmit = async (data) => {
    try {
      const dataClone = { ...data }
      setIsLoadingAddUpdate(true)
      dataClone.image = avatar.file
      dataClone.full_name = userInfo?.full_name
      dataClone.provider_type_id = isProvider ? userInfo?.provider_info?.provider_type_id : data.provider_type_id.value
      if (editProvider) {
        dataClone.provider_id = providerId
        const payload = createFormData(dataClone)
        await ProviderApi.updateProvider(payload)
        setIsLoadingAddUpdate(false)
        setDefaultValues(initialValues)
        notifySuccess(STRING.editSuccess)
        history.goBack()
        return
      }
      const payload = createFormData(dataClone)
      await ProviderApi.createProvider(payload)
      setIsLoadingAddUpdate(false)
      setDefaultValues(initialValues)
      notifySuccess(STRING.addSuccess)
      props.history.goBack()
    } catch (error) {
      setDefaultValues(data)
      setIsLoadingAddUpdate(false)
      notifyFail(STRING.addFail)
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
    return <HeaderPage context={props} titleHeader={editProvider ? STRING.editProvider : STRING.addSupplierFull} />
  }

  const renderBody = () => {
    return <Row>{renderContentRight()}</Row>
  }

  const renderContentRight = () => {
    return (
      <Col className="p-2 mx-auto">
        <div className="px-4 py-3 box--shadow col-12">
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormGroup row>
              <Label for="exampleEmail">Tên quản gia (*)</Label>
              <input
                placeholder={'Tên quản gia'}
                className={errors.provider_name?.message ? 'form-control is-invalid' : 'form-control'}
                type="text"
                name="provider_name"
                defaultValue={defaultValues.provider_name}
                ref={register({ required: true })}
              />
              {errors.provider_name?.message && (
                <span className="invalid-feedback">{errors.provider_name?.message}</span>
              )}
            </FormGroup>

            <FormGroup row>
              <Label for="exampleEmail">{STRING.email} (*)</Label>
              <input
                placeholder={STRING.email}
                type="email"
                name="email"
                className={errors.email?.message ? 'form-control is-invalid' : 'form-control'}
                ref={register({ required: true })}
                defaultValue={defaultValues.email}
              />
              {errors.email?.message && <span className="invalid-feedback">{errors.email?.message}</span>}
            </FormGroup>

            <FormGroup row>
              <Label for="exampleEmail">{STRING.phoneNumber} (*)</Label>
              <input
                placeholder={STRING.phoneNumber}
                type="tel"
                name="phone"
                className={errors.phone?.message ? 'form-control is-invalid' : 'form-control'}
                ref={register({ required: true })}
                defaultValue={defaultValues.phone}
              />
              {errors.phone?.message && <span className="invalid-feedback">{errors.phone?.message}</span>}
            </FormGroup>

            {/* <FormGroup row>
              <Label for="exampleEmail">{STRING.contactPerson} (*)</Label>
              <input
                placeholder={STRING.contactPerson}
                type="text"
                className={errors.full_name?.message ? 'form-control is-invalid' : 'form-control'}
                name="full_name"
                defaultValue={defaultValues.full_name}
                ref={register({ required: true })}
              />
              {errors.full_name?.message && <span className="invalid-feedback">{errors.full_name?.message}</span>}
            </FormGroup> */}
            {/* <FormGroup row></FormGroup> */}
            <FormGroup row>
              {!isProvider && (
                <Col sm className="pl-0">
                  <Label for="exampleEmail">{STRING.supplierTypeFull}</Label>
                  <Controller
                    name="provider_type_id"
                    control={control}
                    rules={{ required: true }}
                    options={listProviderType}
                    as={Select}
                    defaultValue={defaultValues.provider_type_id}
                  />
                  {errors.provider_type_id?.message && (
                    <span className="invalid-feedback d-inline-block">{`Vui lòng chọn loại nhà cung cấp`}</span>
                  )}
                </Col>
              )}
            </FormGroup>

            <FormGroup row>
              <Label for="exampleEmail">{STRING.addressDetail}</Label>
              <input
                placeholder={STRING.addressDetail}
                type="text"
                className={errors.address?.message ? 'form-control is-invalid' : 'form-control'}
                defaultValue={defaultValues.address}
                name="address"
                ref={register({ required: true })}
              />
              {errors.address?.message && <span className="invalid-feedback">{errors.address?.message}</span>}
            </FormGroup>

            {!editProvider ? (
              <>
                <FormGroup row>
                  <Label for="exampleEmail">{STRING.passWord}</Label>
                  <input
                    placeholder={STRING.passWord}
                    className={errors.password?.message ? 'form-control is-invalid' : 'form-control'}
                    type="password"
                    name="password"
                    defaultValue={defaultValues.password}
                    ref={register({ required: true })}
                  />
                  {errors.password?.message && <span className="invalid-feedback">{errors.password?.message}</span>}
                </FormGroup>

                <FormGroup row>
                  <Label for="exampleEmail">{STRING.confirmPassWord}</Label>
                  <input
                    placeholder={STRING.confirmPassWord}
                    type="password"
                    className={errors.confirm_password?.message ? 'form-control is-invalid' : 'form-control'}
                    name="confirm_password"
                    defaultValue={defaultValues.confirm_password}
                    ref={register({ required: true })}
                  />
                  {errors.confirm_password?.message && (
                    <span className="invalid-feedback">{errors.confirm_password?.message}</span>
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

export default withRouter(AddUpdateAccountOfProviderScreen)
