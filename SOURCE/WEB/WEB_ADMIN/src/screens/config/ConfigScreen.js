import ButtonType from 'components/ButtonType'
import ConfirmModal from 'components/ConfirmModal'
import EmptyData from 'components/EmptyData'
import Footer from 'components/Footer'
import HeaderPage from 'components/HeaderPage'
import PaginationComponent from 'components/PaginationComponent'
import ScreenWrapper from 'components/ScreenWrapper'
import { LABEL_BUTTON_ADD, LABLE_BUTTON_UPDATE, NUMBER, STRING, TYPE_INPUT, ACCEPT_TYPE } from 'constants/Constant'
import * as ConfigApi from 'network/ConfigApi'
import * as FilterApi from 'network/FilterApi'
import React, { useEffect, useState } from 'react'
import { FormControl } from 'react-bootstrap'
import { Button, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row, Table } from 'reactstrap'
import formatNumber from 'utils/formatNumber'
import formatPrice from 'utils/formatPrice'
import { notifyFail, notifySuccess } from 'utils/notify'
import { Image } from 'antd'
import ModalComponent from 'components/ModalComponent'
import { resizeFile } from 'utils/resize/resizeFile'
import { createFormData } from 'utils/createFormData'
function ConfigScreen(props) {
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  const [tabActivity, setTabActivity] = useState({
    isSystemParameter: true,
    isSampleMessage: false,
    isRegion: false,
  })

  const [isModal, setIsModal] = useState(false)
  const [checkAll, setCheckAll] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [isEditRegion, setIsEditRegion] = useState(false)
  const [confirmModal, setConfirmModal] = useState(false)
  const [showFooter, setShowFooter] = useState(false)
  const [sampleMessageId, setSampleMessageId] = useState('')
  const [systemParameter, setSystemParameter] = useState([])
  const [listRegion, setListRegion] = useState([])
  const [paging, setPaging] = useState({})
  const [sampleMessageList, setSampleMessageList] = useState([])
  const [messageOptionList, setMessageOptionList] = useState([])
  const [sampleMessage, setSampleMessage] = useState('')
  const [region, setRegion] = useState({})

  useEffect(() => {
    try {
      getMessageOption()
      getSampleMessage()
      getListRegion()
      getSystemParameter()
    } catch (error) {
      setIsLoading(false)
      setIsError(true)
    }
  }, [])

  const getListRegion = async () => {
    const res = await FilterApi.getListRegions()
    setListRegion(res.data)
  }

  const getSystemParameter = async () => {
    const res = await ConfigApi.getConfig()
    setSystemParameter(
      res.data?.map((parameter, index) => {
        if (index === 2) return parameter
        parameter.value = formatNumber(parameter.value?.toString() || '0')
        return parameter
      })
    )
    setIsLoading(false)
    setIsError(false)
  }

  const getSampleMessage = async (page) => {
    const res = await ConfigApi.getListMessage({ page })
    setSampleMessageList(res.data)
    setPaging(res.paging)
    setIsLoading(false)
    setIsError(false)
  }

  const getMessageOption = async () => {
    const res = await ConfigApi.getListMessageOption()
    setMessageOptionList(
      res.data?.map((messageOption) => {
        messageOption.isActive = false
        return messageOption
      })
    )
  }

  const updateSystemParameter = async () => {
    let checkParameter = systemParameter.findIndex((parameter) => {
      if (!parameter.value) {
        return parameter
      }
    })

    if (checkParameter !== -1) {
      notifyFail('Vui lòng nhập đầy đủ thông tin!')
      return
    }

    try {
      let payload = systemParameter?.map((parameter, index) => {
        if (index === 2) return parameter
        parameter.value = parseInt(formatPrice(parameter.value))
        return parameter
      })
      setIsLoading(true)
      await ConfigApi.updateConfig(payload)
      getSystemParameter()
      notifySuccess(STRING.updateSuccess)
    } catch (error) {
      notifySuccess(STRING.updateFail)
      setIsLoading(false)
    }
  }

  const createOrUpdateSampleMessage = async () => {
    if (!sampleMessage) {
      notifyFail('Vui lòng nhập nội dung tin nhắn mẫu!')
      return
    }

    try {
      setIsLoading(true)
      if (sampleMessageId) {
        const payload = {
          id: sampleMessageId,
          content: sampleMessage,
        }
        await ConfigApi.updateSampleMessage(payload)
        resetSampleOptionList()
        setSampleMessageId('')
        notifySuccess(STRING.updateSuccess)
      } else {
        await ConfigApi.createSampleMessage({ content: sampleMessage })
        resetSampleOptionList()
        notifySuccess(STRING.addSuccess)
      }
      getSampleMessage()
      toggle()
    } catch (error) {
      notifySuccess(STRING.Fail)
      setIsLoading(false)
    }
  }

  const updateRegion = async () => {
    try {
      const payload = createFormData(region)
      setIsLoading(true)
      await FilterApi.updateRegion(payload)
      getListRegion()
      setIsLoading(false)
      setIsEditRegion(false)
      notifySuccess(STRING.updateSuccess)
    } catch (error) {
      notifySuccess(STRING.Fail)
      setIsLoading(false)
    }
  }

  const resetSampleOptionList = () => {
    setMessageOptionList(
      messageOptionList?.map((messageOption) => {
        messageOption.isActive = false
        return messageOption
      })
    )
    setSampleMessage('')
    setSampleMessageId('')
  }

  const toggle = () => {
    setIsModal(!isModal)
    if (isModal) resetSampleOptionList()
  }

  const onClickSwitchTab = (link) => {
    if (link === '#system-parameters') {
      setTabActivity({
        isSystemParameter: true,
        isSampleMessage: false,
      })
    } else if (link === '#region') {
      setTabActivity({
        isSystemParameter: false,
        isSampleMessage: false,
        isRegion: true,
      })
    } else {
      setTabActivity({
        isSystemParameter: false,
        isSampleMessage: true,
        isRegion: false,
      })
    }
  }

  const ItemTab = ({ title, taggedLink, isActive, onClick }) => {
    return (
      <li className="nav-item">
        <a
          className={`nav-link ${isActive ? 'active' : ''}`}
          onClick={() => onClick(taggedLink)}
          href={taggedLink}
          data-toggle="tab"
        >
          {title}
        </a>
      </li>
    )
  }

  const checkingFooter = (showFooter) => {
    return (
      <React.Fragment>
        <Footer
          delete={() => {
            setConfirmModal(true)
          }}
          checkAll={checkAll}
          // handleCheckAll={() => handleCheckAll()}
          showFooter={showFooter}
          hasEdit={isEdit}
          handleOnEdit={() => {
            toggle()
          }}
        ></Footer>
      </React.Fragment>
    )
  }

  const handleChangeSystemParameter = (indexOfSystemParameter, newValue) => {
    let newSystemParameter = [...systemParameter]
    newSystemParameter[indexOfSystemParameter].value = newValue
    setSystemParameter(newSystemParameter)
  }

  const renderModalAddEdit = () => {
    return (
      <>
        <Modal isOpen={isModal} toggle={toggle} centered>
          <ModalHeader toggle={toggle} style={{ color: 'white' }}>
            {sampleMessageId ? STRING.editSampleMessage : STRING.addSampleMessage}
          </ModalHeader>
          <ModalBody>
            <Row>
              <Label for="exampleText">{STRING.content}</Label>
              <Input
                type="textarea"
                name="text"
                rows="5"
                className="mb-3"
                value={sampleMessage}
                onChange={(e) => setSampleMessage(e.target.value)}
              />
              {messageOptionList?.map((item, index) => (
                <div
                  key={index}
                  className={`px-3 py-2  border border-1 rounded mr-2 mb-2 cursor ${item?.isActive && 'bg-info'}`}
                  onClick={() => {
                    let newMessageOptionList = [...messageOptionList]
                    newMessageOptionList[index].isActive = true
                    setSampleMessage(sampleMessage + item.value)
                    setMessageOptionList(newMessageOptionList)
                  }}
                >
                  {item.content}
                </div>
              ))}
            </Row>
          </ModalBody>
          <ModalFooter>
            <Button type="submit" color="primary" onClick={createOrUpdateSampleMessage}>
              {STRING.save}
            </Button>{' '}
            <Button color="secondary" onClick={toggle}>
              {STRING.skip}
            </Button>
            <Button color="danger" onClick={resetSampleOptionList}>
              Reset nội dung
            </Button>
          </ModalFooter>
        </Modal>
      </>
    )
  }

  const handleUploadImage = async (fileName, urlName, event) => {
    if (!event.target.files[0]) {
      return
    }
    if (!ACCEPT_TYPE.IMAGE.includes(event.target.files[0].type)) {
      alert('Định dạng ảnh không được hỗ trợ. Vui lòng chọn ảnh khác.')
      return
    }

    const file = event.target.files[0]

    const image = await resizeFile(file)
    setRegion({
      ...region,
      [fileName]: image,
      [urlName]: (window.URL || window.webkitURL).createObjectURL(file),
    })
  }

  const renderModalEditRegion = () => {
    let allField = [
      {
        type: TYPE_INPUT.text,
        titleName: 'Tên khu vực',
        value: region.name,
        detail: true,
      },
      {
        type: TYPE_INPUT.file_front,
        titleName: `Hình ảnh`,
        value: region.images,
        valueName: 'images',
        url: region.url,
        urlName: 'url',
      },
      {
        type: TYPE_INPUT.text_description,
        titleName: 'Nội dung',
        value: region.content,
        valueName: 'content',
        rows: 7,
      },
    ]

    return (
      <ModalComponent
        allField={allField}
        title={'Sửa khu vực'}
        checkValidateValue={false}
        handleInputModal={(fieldName, value) =>
          setRegion({
            ...region,
            [fieldName]: value || '',
          })
        }
        checkValidateError={{}}
        handleIdCard={handleUploadImage}
        isOpen={isEditRegion}
        handleBlur={null}
        addUpdate={updateRegion}
        onHide={() => {
          setIsEditRegion(false)
          setRegion({})
        }}
      />
    )
  }

  const SampleMessageTable = () => {
    const titleHeader = [
      {
        header: STRING.numericalOrder,
      },
      {
        header: STRING.content,
      },
      {
        header: STRING.action,
      },
    ]
    return (
      <div
        className={`tab-pane fade col-12 row mx-auto ${tabActivity.isSampleMessage ? 'active show' : ''} mb-2 py-2`}
        id="sample-message"
      >
        <div className="d-flex justify-content-between">
          <h3>{STRING.sampleMessage}</h3>
          <ButtonType
            typeButton={LABEL_BUTTON_ADD}
            isOpen={() => {
              setIsModal(true)
            }}
          />
        </div>
        <div className="pt-4 pb-5 px-2">
          <Table bordered striped>
            <thead>
              <tr>
                {titleHeader?.map((item, index) =>
                  item.header === 'checkbox' ? (
                    <th key={index}>
                      <input type="checkbox" className="mt-3 cursor" checked={checkAll} />
                    </th>
                  ) : (
                    <th key={index}>{item.header}</th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {sampleMessageList.length ? (
                sampleMessageList.map((value, index) => (
                  <tr key={index}>
                    <td>{index + NUMBER.page_limit * (paging.page - 1) + 1}</td>
                    <td>{value?.content || '--'}</td>
                    <td className="width2btn text-center">
                      <i
                        className="btnEdit far fa-edit mr-0"
                        style={{ color: '#dc3545' }}
                        onClick={() => {
                          setSampleMessageId(value.id)
                          setSampleMessage(value.content)
                          toggle()
                        }}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <EmptyData />
              )}
            </tbody>
          </Table>
          {renderPagination()}
        </div>
      </div>
    )
  }

  const Region = () => {
    const titleHeader = [
      {
        header: STRING.numericalOrder,
      },
      {
        header: 'Tên khu vực',
      },
      {
        header: STRING.content,
      },
      {
        header: STRING.image,
      },
    ]
    return (
      <div
        className={`tab-pane fade col-12 row mx-auto ${tabActivity.isRegion ? 'active show' : ''} mb-2 py-2`}
        id="region"
      >
        <div className="d-flex justify-content-between">
          <h3>{STRING.area}</h3>
        </div>
        <div className="pt-4 pb-5 px-2">
          <Table bordered striped>
            <thead>
              <tr>
                {titleHeader?.map((item, index) => (
                  <th key={index}>{item.header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {listRegion.length ? (
                listRegion.map((value, index) => (
                  <tr key={index}>
                    <td>{index + NUMBER.page_limit * (paging.page - 1) + 1}</td>
                    <td>{value?.name || '--'}</td>
                    <td>{value?.content || '--'}</td>
                    <td>{value?.url ? <Image style={{ width: 104, height: 78 }} src={value?.url} /> : 'Trống'}</td>
                    <td className="width2btn text-center">
                      <i
                        className="btnEdit far fa-edit mr-0"
                        style={{ color: '#dc3545' }}
                        onClick={() => {
                          setRegion({
                            ...value,
                            images: value.url,
                          })
                          setIsEditRegion(true)
                        }}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <EmptyData />
              )}
            </tbody>
          </Table>
          {renderPagination()}
        </div>
      </div>
    )
  }

  const renderPagination = () => {
    if (!isLoading) {
      return (
        <>
          {paging?.count > NUMBER.page_limit && (
            <PaginationComponent
              activePage={paging?.page}
              itemCountPerPage={paging.limit}
              totalItemsCount={paging.count}
              action={getSampleMessage}
            />
          )}
        </>
      )
    }
  }

  const renderHeader = () => {
    return <HeaderPage titleHeader={STRING.config}></HeaderPage>
  }

  return (
    <ScreenWrapper
      titleHeader={STRING.config}
      isLoading={isLoading}
      isError={isError}
      renderFooter={() => checkingFooter(showFooter)}
      renderHeader={renderHeader}
    >
      <div className="card">
        <div className="card-header p-2">
          <ul className="nav nav-pills">
            <ItemTab
              title={STRING.systemParameters}
              taggedLink="#system-parameters"
              isActive={tabActivity.isSystemParameter}
              onClick={() => onClickSwitchTab('#system-parameters')}
            />
            <ItemTab
              title={STRING.sampleMessage}
              taggedLink="#sample-message"
              isActive={tabActivity.isSampleMessage}
              onClick={() => onClickSwitchTab('#sample-message')}
            />
            <ItemTab
              title={STRING.area}
              taggedLink="#region"
              isActive={tabActivity.isRegion}
              onClick={() => onClickSwitchTab('#region')}
            />
          </ul>
        </div>
        {renderModalAddEdit()}

        <ConfirmModal isOpen={confirmModal} onHide={() => setConfirmModal(false)} title={STRING.delete} />
        <div className="card-body py-1">
          <div className="tab-content">
            {/* Config Tab Start */}
            <div
              className={`tab-pane col-12 row mx-auto ${tabActivity.isSystemParameter ? 'active' : ''} mb-2 py-2`}
              id="config"
            >
              <div className="d-flex justify-content-between">
                <h3>{STRING.systemParameters}</h3>
                <ButtonType typeButton={LABLE_BUTTON_UPDATE} isOpen={updateSystemParameter} />
              </div>
              <div className="row">
                <div className="row col-md-12  rounded mr-3 mb-1 p-3">
                  {/* border border-1 */}
                  <div className="row col-md-12 d-flex align-items-center mb-3">
                    <div className="col-12 col-md-2">
                      <span>Cộng điểm giới thiệu app</span>
                    </div>
                    <div className="col-12 col-md-7">
                      <FormControl
                        type="text"
                        className="m-0"
                        value={systemParameter[0]?.value || ''}
                        placeholder={'Số điểm'}
                        onChange={(e) => {
                          if (e.target.value && parseInt(formatPrice(e.target.value)) > 1e6) return
                          handleChangeSystemParameter(0, formatNumber(e.target.value))
                        }}
                      ></FormControl>
                    </div>
                  </div>
                  <div className="row col-md-12 d-flex align-items-center mb-3">
                    <div className="col-12 col-md-2">
                      <span>Cộng điểm mã giới thiệu</span>
                    </div>
                    <div className="col-12 col-md-7">
                      <FormControl
                        type="text"
                        className="m-0"
                        value={systemParameter[1]?.value || ''}
                        placeholder={'Số điểm'}
                        onChange={(e) => {
                          if (e.target.value && parseInt(formatPrice(e.target.value)) > 1e6) return
                          handleChangeSystemParameter(1, formatNumber(e.target.value))
                        }}
                      ></FormControl>
                    </div>
                  </div>
                  <div className="row col-md-12 d-flex align-items-center mb-3">
                    <div className="col-12 col-md-2">
                      <span>Mức độ cộng điểm giảm dần mã giới thiệu (%)</span>
                    </div>
                    <div className="col-12 col-md-7">
                      <FormControl
                        type="number"
                        className="m-0"
                        value={systemParameter[2]?.value || ''}
                        placeholder="Số điểm"
                        max={100}
                        min={0}
                        onChange={(e) => {
                          if (e.target.value > 100) return
                          handleChangeSystemParameter(2, e.target.value)
                        }}
                      ></FormControl>
                    </div>
                  </div>

                  <div className="row col-md-12 d-flex align-items-center mb-3">
                    <div className="col-12 col-md-2">
                      <span>Phần trăm khi khách hàng hoàn thành đơn (%)</span>
                    </div>
                    <div className="col-12 col-md-7">
                      <FormControl
                        type="number"
                        className="m-0"
                        value={systemParameter[3]?.value || ''}
                        placeholder="Phần trăm"
                        max={100}
                        min={0}
                        onChange={(e) => {
                          if (e.target.value > 100) return
                          handleChangeSystemParameter(3, e.target.value)
                        }}
                      ></FormControl>
                    </div>
                  </div>

                  {/* <div className="row col-md-12 d-flex align-items-center mb-3">
                    <div className="col-md-5">
                      <span>{STRING.insurancePaymentTime} (Ngày)</span>
                    </div>
                    <div className="col-md-7">
                      <FormControl
                        type="number"
                        className="m-0"
                        value={configData.insurancePaymentTime}
                        placeholder={STRING.insurancePaymentTime}
                        onChange={(e) => setConfigData({ ...configData, insurancePaymentTime: e.target.value })}
                      ></FormControl>
                    </div>
                  </div>
                  <div className="row col-md-12 d-flex align-items-center mb-3">
                    <div className="col-md-5">
                      <span>{STRING.instructionalVideo}</span>
                    </div>
                    <div className="col-md-7">
                      <FormControl
                        // type="textarea"
                        as="textarea"
                        className="m-0"
                        value={configData.instructionalVideo}
                        placeholder={STRING.instructionalVideo}
                        onChange={(e) => setConfigData({ ...configData, instructionalVideo: e.target.value })}
                      ></FormControl>
                    </div>
                  </div>
                  <div className="row col-md-12 d-flex align-items-center mb-3">
                    <div className="col-md-5">
                      <span>OTP</span>
                    </div>
                    <div className="col-md-7">
                      <FormControl
                        type="number"
                        className="m-0"
                        value={configData.otp}
                        placeholder="OTP"
                        onChange={(e) => setConfigData({ ...configData, otp: e.target.value })}
                      ></FormControl>
                    </div>
                  </div> */}
                </div>
                {/* --------------------------------------------------------------------------------- */}
              </div>
            </div>
            {/* Config Tab End */}
            {renderModalEditRegion()}
            <SampleMessageTable />
            <Region />
          </div>
        </div>
      </div>
    </ScreenWrapper>
  )
}

ConfigScreen.propTypes = {}

export default ConfigScreen
