import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import ScreenWrapper from 'components/ScreenWrapper'
import HeaderPage from 'components/HeaderPage'
import { STRING, ACCEPT_TYPE, MEDIA_TYPE } from 'constants/Constant'
import Select from 'react-select'
import { FormFeedback, Input, Spinner, FormGroup, Row, Col, Label, Button } from 'reactstrap'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import UploadMultiImageTour from './components/UploadMultiImageTour'
import UploadVideoTour from './components/UploadVideoTour'
import Editor from 'components/Editor'
import 'styles/Responsive.css'
import * as FilterApi from 'network/FilterApi'
import * as TourApi from 'network/TourApi'
import * as ProviderApi from 'network/ProviderApi'
import * as RoomApi from 'network/RoomApi'
import swal from 'sweetalert'
import { notifyFail, notifySuccess } from 'utils/notify'
import { handleMultiImg } from 'utils/resize/resizeFile'
import { createFormData } from 'utils/createFormData'

AddUpdateDetailTourScreen.propTypes = {}
const initialValues = {
  code: '',
  contact_phone: '',
  contact_name: '',
  name: '',
  address: '',
  district_id: '',
  province_id: '',
  service_category_id: '',
  village_id: '',
  regions_id: '',
  people: '',
  cost: '',
}

const schemaAdd = yup.object().shape({
  contact_phone: yup
    .string()
    .required('số điện thoại không được để trống')
    .min(9)
    .matches(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, 'Số điện thoại không hợp lệ'),
  contact_name: yup.string().required('Tên người liên hệ không được để trống'),
  name: yup.string().required('Tên tour không được để trống'),
  address: yup.string().required('Địa chỉ  không được để trống'),
  code: yup.string().required('Mã tour không được để trống'),
  province_id: yup.object().required('Tỉnh/ Thành phố không được để trống'),
  district_id: yup.object().required('Quận/ Huyện không được để trống'),
  village_id: yup.object().required('khu vực  không được để trống'),
  regions_id: yup.object().required('Khu vực không được để trống'),
  people: yup.string().required('Số người không được để trống'),
  cost: yup.string().required('Dịch vụ tính phí không được để trống'),
})

const schemaEdit = yup.object().shape({
  contact_phone: yup.string(),
  code: yup.string(),
  contact_name: yup.string().required('Tên người liên hệ không được để trống'),
  name: yup.string().required('Tên tour không được để trống'),
  address: yup.string().required('Địa chỉ  không được để trống'),
  province_id: yup.object().required('Tỉnh/ Thành phố không được để trống'),
  district_id: yup.object().required('Quận/ Huyện không được để trống'),
  village_id: yup.object().required('khu vực  không được để trống'),
  regions_id: yup.object().required('Khu vực không được để trống'),
  people: yup.string().required('Số người không được để trống'),
  cost: yup.string().required('Dịch vụ tính phí không được để trống'),
})

let schema = schemaAdd

function AddUpdateDetailTourScreen(props) {
  if (props?.match?.params?.id) {
    schema = schemaEdit
  }
  const { register, handleSubmit, errors, clearErrors, reset, watch, control } = useForm({
    resolver: yupResolver(schema),
  })

  const [isLoadingAddUpdate, setIsLoadingAddUpdate] = useState(true)
  const [isError, setIsError] = useState(false)
  const [editTour, setEditTour] = useState(false)
  const [contentHtml, setContentHtml] = useState('')
  const [scheduleHtml, setScheduleHtml] = useState('')
  const [defaultValues, setDefaultValues] = useState({})
  const [listProvince, setListProvince] = useState([])
  const [listRegion, setListRegion] = useState([])
  const [listDistrict, setListDistrict] = useState([])
  const [listVillage, setListVillage] = useState([])
  // const [listRoomType, setListRoomType] = useState([])
  const [tourId, setTourId] = useState('')
  const [listImage, setListImage] = useState(
    Array(8)
      .fill({})
      .map((item, index) => ({ id: '', fileList: [], buffer: null, url: '' }))
  )

  const [video, setVideo] = useState({
    videoUrlLocal: '',
    video: '',
  })

  useEffect(() => {
    const { id } = props.match.params
    getListRegions()
    getListProvince()
    if (id) {
      setEditTour(true)
      getTourDetail(id)
    } else {
      setIsLoadingAddUpdate(false)
    }
    // getListDistrict()
    // getListVillage()
  }, [])

  useEffect(() => {
    if (watch('province_id')) {
      getListDistrict(watch('province_id')?.code)
    }
  }, [watch('province_id')])

  useEffect(() => {
    if (watch('district_id')) {
      getListVillage(watch('district_id')?.value)
    }
  }, [watch('district_id')])

  const getTourDetail = async (id) => {
    try {
      const tourDetailApi = await TourApi.getTourDetail({ id })
      setTourId(id)
      getListDistrict(tourDetailApi.data.province?.code)
      // getListVillage(tourDetailApi.data.district?.id)
      const newInitialValues = {
        name: tourDetailApi.data.name,
        address: tourDetailApi.data.address,
        district_id: {
          value: tourDetailApi.data.district?.id,
          label: tourDetailApi.data.district?.name,
        },
        province_id: {
          value: tourDetailApi.data.province?.id,
          label: tourDetailApi.data.province?.name,
        },
        // service_category_id: {
        //   value: tourDetailApi.data.service_category_id,
        //   label: tourDetailApi.data.service_category_name,
        // },
        village_id: {
          value: tourDetailApi.data.village?.id,
          label: tourDetailApi.data.village?.name,
        },
        regions_id: {
          value: tourDetailApi.data.region?.id,
          label: tourDetailApi.data.region?.name,
        },
        people: tourDetailApi.data.people,
        cost: tourDetailApi.data.cost,
        contact_phone: tourDetailApi.data.contact_phone,
        contact_name: tourDetailApi.data.contact_name,
        code: tourDetailApi.data.code,
      }

      if (tourDetailApi.data.service_images.length) {
        tourDetailApi.data.service_images.forEach((item, index) => {
          if (item.type === MEDIA_TYPE.IMAGE) {
            item.uid = item.id
            item.status = 'done'
            item.url = item.path

            delete item.type

            listImage[index].fileList.push(item)
            listImage[index].url = item.path
            listImage[index].id = item.id
          } else {
            setVideo({
              videoUrlLocal: item.path,
              video: '',
            })
          }
        })
      }
      setContentHtml(tourDetailApi.data.content)
      setScheduleHtml(tourDetailApi.data.schedule)
      setDefaultValues(newInitialValues)
      setIsLoadingAddUpdate(false)
    } catch (error) {
      setIsLoadingAddUpdate(false)
      setIsError(true)
      console.log(error)
    }
  }

  const getListRegions = async () => {
    try {
      const listRegion = await FilterApi.getListRegions()
      let options = listRegion.data.map((region) => ({
        value: region.id,
        label: region.name,
      }))
      setListRegion(options)
    } catch (error) {
      console.log(error)
    }
  }

  const getListProvince = async () => {
    try {
      const listProvince = await FilterApi.getListProvince()
      let options = listProvince.data.map((province) => ({
        value: province.id,
        label: province.name,
        code: province.code,
      }))
      setListProvince(options)
    } catch (error) {
      console.log(error)
    }
  }

  const getListDistrict = async (province_id) => {
    try {
      if (province_id) {
        const listDistrict = await FilterApi.getListDistrict({ province_id })
        let options = listDistrict.data.map((district) => ({
          value: district.id,
          label: district.name,
          code: district.code,
        }))
        setListDistrict(options)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const getListVillage = async (district_id) => {
    try {
      const listVillage = await FilterApi.getListVillage({ district_id })
      let options = listVillage.data.map((village) => ({
        value: village.id,
        label: village.name,
        code: village.code,
      }))
      setListVillage(options)
    } catch (error) {
      console.log(error)
    }
  }

  const handleChange = (fieldName, value) => {
    if (fieldName === 'contentHtml') {
      setContentHtml(value)
      return
    }
    setScheduleHtml(value)
  }

  const handleChangeMultiImg = (file, index) => {
    if (editTour) {
      if (listImage[index].fileList.length) {
        listImage[index].fileList.splice(0, 1)
        listImage[index].url = ''
      }
    }

    if (file[0]?.status === 'error') {
      delete file[0].error
      file[0].status = 'done'
    }

    const newImages = [...listImage]
    newImages[index].buffer = file[0] || ''

    setListImage(newImages)
  }

  const handleChangeVideo = (event) => {
    if (!event.target.files[0]) {
      return
    }

    if (!ACCEPT_TYPE.VIDEO.includes(event.target.files[0].type)) {
      alert('Định dạng video không được hỗ trợ. Vui lòng chọn video khác.')
      return
    }

    setVideo({
      videoUrlLocal: (window.URL || window.webkitURL).createObjectURL(event.target.files[0]),
      video: event.target.files[0],
    })
  }

  const onSubmit = async (data) => {
    if (!contentHtml || !scheduleHtml) {
      swal({
        title: 'Vui lòng nhập Nội dung html!',
        icon: 'error',
      })
      return
    }

    try {
      setIsLoadingAddUpdate(true)
      let resizeListImage = await handleMultiImg(listImage.map((image) => image.buffer))
      let cloneData = { ...data }
      cloneData.province_id = data.province_id.value
      cloneData.district_id = data.district_id.value
      cloneData.village_id = data.village_id.value
      cloneData.regions_id = data.regions_id.value
      // cloneData.service_category_id = data.service_category_id.value
      cloneData.content = contentHtml
      cloneData.schedule = scheduleHtml
      cloneData.image = []

      for (let key in resizeListImage) {
        cloneData.image.push(resizeListImage[key])
      }

      if (video.video) {
        // cloneData.image.push(video)
        cloneData.video = video.video
      }

      if (!editTour) {
        const payload = createFormData(cloneData)
        await TourApi.createTour(payload)
        notifySuccess(STRING.addSuccess)
      } else {
        let newArrImageIsDeleted = []
        listImage.forEach((image) => {
          if (image.hasOwnProperty('url') && !image?.url && typeof image?.id === 'number') {
            newArrImageIsDeleted.push(image?.id)
          }
        })

        cloneData.remove = newArrImageIsDeleted
        cloneData.id = tourId
        const payload = createFormData(cloneData)
        await TourApi.updateTour(payload)
        notifySuccess(STRING.editSuccess)
      }
      props.history.goBack()
    } catch (error) {
      setDefaultValues(data)
      console.log(error)
      setIsLoadingAddUpdate(false)
      notifyFail(STRING.Fail)
    }
  }

  const renderHeader = () => {
    return <HeaderPage context={props} titleHeader={editTour ? STRING.editTour : STRING.addTour} />
  }

  const renderMultiImage = () => {
    return (
      <UploadMultiImageTour editTour={editTour} listImage={listImage} handleChangeMultiImg={handleChangeMultiImg} />
    )
  }

  const renderVideo = () => {
    return <UploadVideoTour videoUrl={video.videoUrlLocal} handleChangeVideo={handleChangeVideo} />
  }

  const renderZone = () => {
    return (
      <FormGroup row>
        <Col md="3" lg="2">
          <Label for="exampleEmail">{STRING.address} (*)</Label>
        </Col>
        <Col md={8} lg={9}>
          <Row className="pl-2">
            <Col sm className="pl-0">
              <Controller
                name="province_id"
                control={control}
                rules={{ required: true }}
                defaultValue={defaultValues.province_id}
                placeholder={STRING.province}
                isSearchable={true}
                isClearable={true}
                options={listProvince}
                as={Select}
              />
            </Col>
            <Col sm>
              <Controller
                name="district_id"
                control={control}
                rules={{ required: true }}
                defaultValue={defaultValues.district_id}
                placeholder={STRING.district}
                isSearchable={true}
                isClearable={true}
                options={listDistrict}
                as={Select}
              />
            </Col>
            <Col sm>
              <Controller
                name="village_id"
                control={control}
                rules={{ required: true }}
                defaultValue={defaultValues.village_id}
                placeholder={STRING.ward}
                isSearchable={true}
                isClearable={true}
                options={listVillage}
                as={Select}
              />
            </Col>
          </Row>
        </Col>
      </FormGroup>
    )
  }

  const renderEditor = () => {
    return (
      <Row>
        <Col xs="12">
          <h5>{STRING.content}</h5>
        </Col>
        <Col
          xs="12"
          className="text-center  d-flex justify-content-center  mx-auto m-3 pt-4 pb-5 px-3 table--shadow"
          style={{ overflow: 'auto' }}
        >
          <Editor
            handleChangeContentHtml={handleChange}
            contentHtml={contentHtml}
            contentHtmlName={'contentHtml'}
            height={300}
          />
        </Col>
      </Row>
    )
  }

  const renderEditorSchedule = () => {
    return (
      <Row>
        <Col xs="12">
          <h5>Thông tin lịch trình</h5>
        </Col>
        <Col
          xs="12"
          className="text-center  d-flex justify-content-center  mx-auto m-3 pt-4 pb-5 px-3 table--shadow"
          style={{ overflow: 'auto' }}
        >
          <Editor
            handleChangeContentHtml={handleChange}
            contentHtml={scheduleHtml}
            contentHtmlName={'scheduleHtml'}
            height={300}
          />
        </Col>
      </Row>
    )
  }

  const renderBody = () => {
    return (
      <Row className="p-2">
        <form onSubmit={handleSubmit(onSubmit)} className="col-12 box--shadow p-3">
          <FormGroup row>
            <Col md={3} lg={2}>
              <Label for="exampleEmail">{STRING.tourCode} (*)</Label>
            </Col>
            <Col md={8} lg={9}>
              <input
                placeholder={STRING.tourCode}
                type="text"
                // disabled={editTour}
                className={errors.code?.message ? 'form-control is-invalid' : 'form-control'}
                name="code"
                defaultValue={defaultValues.code}
                ref={register({ required: true })}
              />
              {errors.code?.message && <span className="invalid-feedback">{errors.code?.message}</span>}
            </Col>
          </FormGroup>

          <FormGroup row>
            <Col md={3} lg={2}>
              <Label for="exampleEmail">{STRING.tourName} (*)</Label>
            </Col>
            <Col md={8} lg={9}>
              <input
                placeholder={STRING.tourName}
                className={errors.name?.message ? 'form-control is-invalid' : 'form-control'}
                type="text"
                name="name"
                defaultValue={defaultValues.name}
                ref={register({ required: true })}
              />
              {errors.name?.message && <span className="invalid-feedback">{errors.name?.message}</span>}
            </Col>
          </FormGroup>

          <FormGroup row>
            <Col md={3} lg={2}>
              <Label for="exampleEmail">{STRING.contactPerson} (*)</Label>
            </Col>
            <Col md={8} lg={9}>
              <Row className="pl-2">
                <Col md="4" className="pl-0">
                  <input
                    placeholder={STRING.contactPerson}
                    className={errors.contact_name?.message ? 'form-control is-invalid' : 'form-control'}
                    type="tel"
                    defaultValue={defaultValues.contact_name}
                    name="contact_name"
                    ref={register({ required: true })}
                  />
                  {errors.contact_name?.message && (
                    <span className="invalid-feedback">{errors.contact_name?.message}</span>
                  )}
                </Col>
                <Col md="8" className="row pr-0">
                  <Col md={5} className="text-center">
                    <Label for="exampleEmail">{STRING.phoneNumber} (*)</Label>
                  </Col>
                  <Col md="7" className="pr-0">
                    <input
                      placeholder={STRING.phoneNumber}
                      className={errors.contact_phone?.message ? 'form-control is-invalid' : 'form-control'}
                      type="tel"
                      defaultValue={defaultValues.contact_phone}
                      name="contact_phone"
                      ref={register({ required: true })}
                    />
                    {errors.contact_phone?.message && (
                      <span className="invalid-feedback">{errors.contact_phone?.message}</span>
                    )}
                  </Col>
                </Col>
              </Row>
            </Col>
          </FormGroup>

          {renderZone()}

          <FormGroup row>
            <Col md="3" lg="2">
              <Label for="exampleEmail">{STRING.addressDetail}</Label>
            </Col>
            <Col md={8} lg={9}>
              <input
                placeholder={STRING.addressDetail}
                className={errors.address?.message ? 'form-control is-invalid' : 'form-control'}
                type="text"
                defaultValue={defaultValues.address}
                name="address"
                ref={register({ required: true })}
              />
              {errors.address?.message && <span className="invalid-feedback">{errors.address?.message}</span>}
            </Col>
          </FormGroup>

          <FormGroup row>
            <Col md={3} lg={2}>
              <Label for="exampleEmail">{STRING.zone} (*)</Label>
            </Col>
            <Col md={8} lg={9}>
              <Row className="pl-2">
                <Col md="4" className="pl-0">
                  <Controller
                    name="regions_id"
                    control={control}
                    rules={{ required: true }}
                    placeholder={'Chọn khu vực'}
                    defaultValue={defaultValues.regions_id}
                    isSearchable={true}
                    isClearable={true}
                    options={listRegion}
                    as={Select}
                  />
                  {errors.regions_id?.message && <span className="invalid-feedback">Khu vực không được để trống</span>}
                </Col>
                <Col md="8" className="row pr-0">
                  <Col md={5} className="text-center">
                    <Label for="exampleEmail">Số người (*)</Label>
                  </Col>
                  <Col md="7" className="pr-0">
                    <input
                      placeholder={'Số người'}
                      className={errors.people?.message ? 'form-control is-invalid' : 'form-control'}
                      type="text"
                      name="people"
                      defaultValue={defaultValues.people}
                      ref={register({ required: true })}
                    />
                    {errors.people?.message && <span className="invalid-feedback">{errors.people?.message}</span>}
                  </Col>
                </Col>
              </Row>
            </Col>
          </FormGroup>

          <FormGroup row>
            <Col md="3" lg="2">
              <Label for="exampleEmail">{STRING.serviceCharge}</Label>
            </Col>
            <Col md={8} lg={9}>
              <input
                placeholder={STRING.serviceCharge}
                className={errors.cost?.message ? 'form-control is-invalid' : 'form-control'}
                type="text"
                name="cost"
                defaultValue={defaultValues.cost}
                ref={register({ required: true })}
              />
              {errors.cost?.message && <span className="invalid-feedback">{errors.cost?.message}</span>}
            </Col>
          </FormGroup>

          {renderMultiImage()}
          {renderVideo()}
          {renderEditor()}
          {renderEditorSchedule()}
          <Col className="text-center responsive--button__editor">
            <Button color="danger">{STRING.cancel}</Button>
            <input type="submit" value={STRING.save} className="btn btn-success" />
          </Col>
        </form>
      </Row>
    )
  }

  return (
    <ScreenWrapper
      renderHeader={renderHeader}
      titleHeader={'test'}
      isError={isError}
      isLoadingAddUpdate={isLoadingAddUpdate}
    >
      {renderBody()}
    </ScreenWrapper>
  )
}

export default AddUpdateDetailTourScreen
