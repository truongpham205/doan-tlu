import { PEOPLE, STRING, ACCEPT_TYPE } from '@constants/Constant'
import { ErrorMessage } from '@hookform/error-message'
import React, { useState } from 'react'
import { Button, FormControl, Modal, Table } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { Image } from 'antd'
import orderApi from '@networks/orderApi'
import swal from 'sweetalert'
import { createFormData } from '@utils/createFormData'

export const ModalDetailCustomer = (props) => {
  const { isShowModal, closeModal, orderDetail, setLoading, getOrderDetail } = props
  const { register, errors, handleSubmit, reset } = useForm({
    criteriaMode: 'all',
  })

  const {
    register: registerEdit,
    errors: errorsEdit,
    handleSubmit: handleSubmitEdit,
  } = useForm({
    criteriaMode: 'all',
  })

  const [typeMember, setTypeMember] = useState(1)
  const [isLeader, setIsLeader] = useState(0)
  const [frontIdcard, setFrontIdcard] = useState()
  const [frontIdcardDisplay, setFrontIdcardDisplay] = useState('')
  const [backIdcard, setBackIdcard] = useState()
  const [backIdcardDisplay, setBackIdcardDisplay] = useState('')
  const [listMember, setListMember] = useState([]) //danh sách thành viên nhưng chưa lưu
  const [showModalEditMember, setShowModalEditMember] = useState(false)
  const [memberInfo, setMemberInfo] = useState() //thông tin thành viên muốn chỉnh sửa

  const countAdultsMember = () => {
    //đếm số lượng người lớn trong danh sách
    let count = 0
    listMember?.length > 0 &&
      listMember.map((customer) => {
        if (Number(customer.type) === 1) {
          count++
        }
      })
    return count
  }

  const countChildrenMember = () => {
    //đếm số lượng trẻ em trong danh sách
    let count = 0
    listMember?.length > 0 &&
      listMember.map((customer) => {
        if (Number(customer.type) === 2) {
          count++
        }
      })
    return count
  }

  const checkExistLeader = () => {
    let count = 0
    listMember?.length > 0 &&
      listMember.map((customer) => {
        if (Number(customer.is_leader) === 1) {
          count++
        }
      })
    return count
  }

  const resetDataAddNewMember = () => {
    setFrontIdcard()
    setFrontIdcardDisplay('')
    setBackIdcard()
    setBackIdcardDisplay('')
    setTypeMember(1)
    setIsLeader(0)
  }

  const addMember = (data) => {
    if (Number(data.is_leader) === 1) {
      if (!frontIdcard || !backIdcard || !data.identify) {
        swal(
          'Thất bại',
          'Trưởng đoàn yêu cầu nhập đầy đủ thông tin bao gồm CMND và ảnh bao gồm cả mặt trước và mặt sau',
          'error'
        )
        return
      }
    }
    listMember.push({
      name: data.nameCustomer,
      identify: data.identify,
      order_id: orderDetail.id,
      type: data.typeMember,
      year: data.year,
      old: data.old,
      font_id: frontIdcard || '',
      back_id: backIdcard || '',
      is_leader: data.is_leader,
      id: Date.now(),
      font_id_display: frontIdcardDisplay || '',
      back_id_display: backIdcardDisplay || '',
    })
    setListMember(listMember)
    reset()
    resetDataAddNewMember()
  }

  const createOrderCustomer = async () => {
    setLoading(true)
    try {
      if (countAdultsMember() === Number(orderDetail.adult) && countChildrenMember() === Number(orderDetail.children)) {
        //validate danh sách thành viên
        if (listMember?.length > 0 && checkExistLeader() == 1) {
          //validate có ít nhất 1 trường đoàn
          await Promise.all(
            listMember.map(async (customer) => {
              const formData = createFormData({
                id: 0,
                order_id: customer.order_id,
                name: customer.name,
                identify: customer.identify || '',
                type: customer.type,
                old: Number(customer.old),
                year: Number(customer.year),
                font_id: customer.font_id || '',
                back_id: customer.back_id || '',
                is_leader: Number(customer.is_leader),
              })
              await orderApi.createOrderCustomer(formData)
            })
          )
          setLoading(false)
          swal('Thành công', 'Cập nhật danh sách thành viên thành công', 'success').then(() => {
            closeModal()
            getOrderDetail(orderDetail.id)
          })
        } else {
          setLoading(false)
          swal('Thất bại', 'Danh sách thành viên bao gồm 1 trưởng đoàn', 'error')
        }
      } else {
        setLoading(false)
        swal(
          'Thất bại',
          `Danh sách thành viên không đúng, bao gồm ${orderDetail?.adult || 0} người lớn, ${
            orderDetail?.children || 0
          } trẻ em`,
          'error'
        )
      }
    } catch (err) {
      setLoading(false)
      swal('Thất bại', `${err.msg}`, 'error')
    }
  }

  const handleChangeImageFrontIdCard = async (event) => {
    if (event.target.files[0] && !ACCEPT_TYPE.IMAGE.includes(event.target.files[0].type)) {
      alert('Định dạng ảnh không được hỗ trợ. Vui lòng chọn ảnh khác.')
      return
    }
    setFrontIdcardDisplay(
      event.target.files[0] && (window.URL || window.webkitURL).createObjectURL(event.target.files[0])
    )
    setFrontIdcard(event.target.files[0])
  }

  const handleChangeImageBackIdCard = (event) => {
    if (event.target.files[0] && !ACCEPT_TYPE.IMAGE.includes(event.target.files[0].type)) {
      alert('Định dạng ảnh không được hỗ trợ. Vui lòng chọn ảnh khác.')
      return
    }
    setBackIdcardDisplay(
      event.target.files[0] && (window.URL || window.webkitURL).createObjectURL(event.target.files[0])
    )
    setBackIdcard(event.target.files[0])
  }

  const handleRemoveFrontIdCardImage = () => {
    setFrontIdcardDisplay()
    setFrontIdcard()
  }

  const handleRemoveBackIdCardImage = () => {
    setBackIdcardDisplay()
    setBackIdcard()
  }

  const editMember = (data) => {
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

    const index = listMember?.length && listMember?.findIndex((value) => value.id === memberInfo.id)
    listMember.splice(index, 1, {
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
      font_id_display: memberInfo.font_id_display || '',
      back_id_display: memberInfo.back_id_display || '',
    })
    setShowModalEditMember(false)
  }

  const deleteMember = (id) => {
    const arrayTemp = [...listMember]
    const index = listMember?.length && listMember?.findIndex((item) => item.id == id)
    arrayTemp.splice(index, 1)
    setListMember(arrayTemp)
  }

  const renderModalAddMember = () => {
    return (
      <Modal
        show={isShowModal}
        onHide={closeModal}
        dialogClassName="modal-90w"
        aria-labelledby="example-custom-modal-styling-title"
        centered
        className="pb-0"
        size="xl"
        scrollable={true}
      >
        <Modal.Header closeButton>
          <h5 className="m-0">Cập nhật danh sách thành viên</h5>
        </Modal.Header>
        <Modal.Body className="custom-body">
          <form action="#" method="post" onSubmit={handleSubmit(addMember)}>
            <div className="row">
              {Number(typeMember) === 1 && (
                <>
                  <div className="col-xl-6 col-md-12 mt-2 d-flex justify-content-center p-0">
                    {frontIdcardDisplay ? (
                      <div>
                        <Image src={frontIdcardDisplay} className="image-uploaded" />
                        <button onClick={handleRemoveFrontIdCardImage}>Xóa ảnh</button>
                      </div>
                    ) : (
                      <label htmlFor="font_id" style={{ cursor: 'pointer' }}>
                        <div className="upload-image">
                          <i className="fas fa-camera" style={{ fontSize: '2rem' }}></i>
                          <p className="icon-add">Ảnh mặt trước CMND</p>
                        </div>
                      </label>
                    )}

                    <FormControl
                      type="file"
                      id="font_id"
                      accept=".jpg,.jpeg,.png"
                      hidden
                      onChange={handleChangeImageFrontIdCard}
                      // value={memberInfo.name}
                      // onChange={(e) => setMemberInfo({ ...memberInfo, name: e.target.value })}
                    />
                  </div>
                  <div className="col-xl-6 col-md-12 mt-2 d-flex justify-content-center p-0">
                    {backIdcardDisplay ? (
                      <div>
                        <Image src={backIdcardDisplay} className="image-uploaded" />
                        <button onClick={handleRemoveBackIdCardImage}>Xóa ảnh</button>
                      </div>
                    ) : (
                      <label htmlFor="back_id" style={{ cursor: 'pointer' }}>
                        <div className="upload-image">
                          <i className="fas fa-camera" style={{ fontSize: '2rem' }}></i>
                          <p className="icon-add">Ảnh mặt sau CMND</p>
                        </div>
                      </label>
                    )}

                    <FormControl
                      type="file"
                      id="back_id"
                      accept=".jpg,.jpeg,.png"
                      hidden
                      onChange={handleChangeImageBackIdCard}
                      // value={memberInfo.name}
                      // onChange={(e) => setMemberInfo({ ...memberInfo, name: e.target.value })}
                    />
                  </div>
                </>
              )}
              <div className="col-md-4 col-sm-6 col-xs-12 mt-2">
                <FormControl
                  type="text"
                  name="nameCustomer"
                  placeholder="Nhập tên thành viên"
                  ref={register({
                    required: 'Vui lòng nhập đầy đủ thông tin',
                  })}
                  //   value={memberInfo.name}
                  //   onChange={(e) => setMemberInfo({ ...memberInfo, name: e.target.value })}
                />
                <ErrorMessage
                  errors={errors}
                  name="nameCustomer"
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
              <div className="col-md-4 col-sm-6 col-xs-12 mt-2">
                <FormControl
                  as="select"
                  name="typeMember"
                  ref={register({
                    required: 'This is required.',
                  })}
                  onChange={(e) => setTypeMember(e.target.value)}

                  //   onChange={(e) => {
                  //     setIsAdult(e.target.value)
                  //     setMemberInfo({ ...memberInfo, typeMember: e.target.value })
                  //   }}
                  //   value={memberInfo.typeMember}
                >
                  <option value={PEOPLE.ADULTS}>{STRING.adults}</option>
                  <option value={PEOPLE.CHILD}>{STRING.children}</option>
                </FormControl>
                <ErrorMessage
                  errors={errors}
                  name="typeMember"
                  render={({ messages }) =>
                    messages && Object.entries(messages).map(([type, message]) => <p key={type}>{message}</p>)
                  }
                />
              </div>
              {Number(typeMember) === 1 && (
                <div className="col-md-4 col-sm-6 col-xs-12 mt-2">
                  <FormControl
                    type="text"
                    name="identify"
                    placeholder="Nhập CMND/CCCD"
                    ref={register({})}
                    // value={memberInfo.identify}
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

              <div className="col-md-4 col-sm-6 col-xs-12 mt-2">
                <FormControl
                  type="number"
                  name="old"
                  placeholder="Nhập tuổi"
                  ref={register({
                    required: 'Vui lòng nhập đầy đủ thông tin',
                  })}
                  //   value={memberInfo.old}
                  //   onChange={(e) => setMemberInfo({ ...memberInfo, old: e.target.value })}
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
              <div className="col-md-4 col-sm-6 col-xs-12 mt-2">
                <FormControl
                  type="number"
                  name="year"
                  placeholder="Nhập năm sinh"
                  ref={register({
                    required: 'Vui lòng nhập đầy đủ thông tin',
                  })}
                  //   value={memberInfo.year}
                  //   onChange={(e) => setMemberInfo({ ...memberInfo, year: e.target.value })}
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
              <div className="col-md-4 col-sm-6 col-xs-12 mt-2">
                <FormControl
                  as="select"
                  name="is_leader"
                  ref={register({
                    required: 'This is required.',
                  })}
                  onChange={(e) => setIsLeader(e.target.value)}
                  //   onChange={(e) => {
                  //     setIsAdult(e.target.value)
                  //     setMemberInfo({ ...memberInfo, is_leader: e.target.value })
                  //   }}
                  //   value={memberInfo.is_leader}
                >
                  <option value={0}>Thành viên</option>
                  <option value={1}>Trưởng đoàn</option>
                </FormControl>
                <ErrorMessage
                  errors={errors}
                  name="is_leader"
                  render={({ messages }) =>
                    messages && Object.entries(messages).map(([type, message]) => <p key={type}>{message}</p>)
                  }
                />
              </div>
              <div className="col-md-4 col-sm-6 col-xs-12 mt-2">
                <Button type="submit" variant="success">
                  Thêm
                </Button>
              </div>
            </div>
          </form>

          <div style={{ marginTop: 12 }}>Yêu cầu chỉ định 1 trưởng đoàn với đầy đủ thông tin</div>

          <div style={{ marginTop: 12, fontWeight: 700 }}>
            <span>{`${orderDetail?.adult || 0} người lớn, ${orderDetail?.children || 0} trẻ em`}</span>
          </div>

          <div className="mt-3">
            <Table striped hover responsive className="text-center" bordered>
              <thead style={{ color: '#0ABE35', backgroundColor: '#eeeeee' }}>
                <tr>
                  <th>STT</th>
                  <th>Họ và tên</th>
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
                {listMember?.length >= 0 &&
                  listMember?.map((value, index) => (
                    <tr key={index}>
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
                        {value?.font_id_display && (
                          <Image
                            src={value?.font_id_display}
                            alt="Ảnh mặt trước"
                            style={{ height: 'auto', width: '200px', margin: 'auto' }}
                          ></Image>
                        )}
                        {/* </div>
                        <div>
                          {value?.back_id_display && (
                            <Image
                              src={value?.back_id_display}
                              alt="Ảnh mặt sau"
                              style={{ height: 'auto', width: '200px', margin: 'auto' }}
                            ></Image>
                          )}
                        </div> */}
                      </td>
                      <td style={{ verticalAlign: 'middle' }}>
                        {value?.back_id_display && (
                          <Image
                            src={value?.back_id_display}
                            alt="Ảnh mặt sau"
                            style={{ height: 'auto', width: '200px', margin: 'auto' }}
                          ></Image>
                        )}
                      </td>
                      <td style={{ verticalAlign: 'middle' }}>
                        {Number(value?.type) === 1 ? STRING.adults : STRING.children}
                      </td>
                      <td style={{ verticalAlign: 'middle' }}>
                        <div className="button-table" style={{ display: 'flex' }}>
                          {/* {value.id !== 0 && ( */}
                          <>
                            <div
                              className="table-icon-edit ml-1 mr-1"
                              onClick={() => {
                                setMemberInfo(value)
                                setShowModalEditMember(true)
                              }}
                            >
                              <i className="fas fa-pencil-alt"></i>
                            </div>

                            <div
                              className="table-icon-delete ml-1 mr-1"
                              onClick={() => {
                                deleteMember(value.id)
                              }}
                            >
                              <i className="fas fa-times"></i>
                            </div>
                          </>
                          {/* )} */}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </Table>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="row d-flex justify-content-center">
            <Button variant="success" className="mr-2" onClick={() => createOrderCustomer()}>
              Cập nhật
            </Button>
            <Button variant="danger" onClick={closeModal}>
              Đóng
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    )
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
        <form action="#" method="post" onSubmit={handleSubmitEdit(editMember)} style={{ width: '100%' }}>
          <Modal.Header closeButton>
            <h5 className="m-0">Sửa thông tin thành viên</h5>
          </Modal.Header>
          <Modal.Body className="custom-body">
            <div className="row">
              {Number(memberInfo?.type) === 1 && (
                <>
                  <div className="col-xl-6 col-md-12 mt-2 d-flex justify-content-center p-0">
                    {memberInfo?.font_id_display ? (
                      <div>
                        <Image src={memberInfo?.font_id_display} className="image-uploaded" />
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
                    {memberInfo?.back_id_display ? (
                      <div>
                        <Image src={memberInfo?.back_id_display} className="image-uploaded" />
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

              <div className="col-sm-12 mt-3">
                <strong>Họ và tên</strong>
                <FormControl
                  type="text"
                  placeholder="Nhập tên thành viên"
                  defaultValue={memberInfo?.name}
                  name="name"
                  ref={registerEdit({
                    required: 'Vui lòng nhập đầy đủ thông tin',
                  })}
                  // value={memberInfo?.name}
                  // onChange={(e) => setMemberInfo({ ...memberInfo, name: e.target.value })}
                />
                <ErrorMessage
                  errors={errorsEdit}
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
                  ref={registerEdit({
                    required: 'This is required.',
                  })}
                >
                  <option value={0}>Thành viên</option>
                  <option value={1}>Trưởng đoàn</option>
                </FormControl>
                <ErrorMessage
                  errors={errorsEdit}
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
              </div>
              {Number(memberInfo?.type) === 1 && (
                <div className="col-sm-12 mt-3">
                  <strong>CMND</strong>
                  <FormControl
                    type="text"
                    placeholder="Nhập CMND/CCCD"
                    defaultValue={memberInfo?.identify}
                    name="identify"
                    ref={registerEdit({})}
                    // value={memberInfo?.identify}
                    // onChange={(e) => setMemberInfo({ ...memberInfo, identify: e.target.value })}
                  />
                  <ErrorMessage
                    errors={errorsEdit}
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
                  ref={registerEdit({
                    required: 'Vui lòng nhập đầy đủ thông tin',
                  })}
                />
                <ErrorMessage
                  errors={errorsEdit}
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
                  ref={registerEdit({
                    required: 'Vui lòng nhập đầy đủ thông tin',
                  })}
                  // value={memberInfo?.year}
                  // onChange={(e) => setMemberInfo({ ...memberInfo, year: e.target.value })}
                />
                <ErrorMessage
                  errors={errorsEdit}
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

  return (
    <>
      {renderModalEditMember()}
      {renderModalAddMember()}
    </>
  )
}
