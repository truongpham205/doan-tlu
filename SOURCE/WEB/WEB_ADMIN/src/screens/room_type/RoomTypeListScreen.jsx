// import TableData from 'components/TableData'
import ButtonType from 'components/ButtonType'
import ConfirmModal from 'components/ConfirmModal'
import EmptyData from 'components/EmptyData'
import Footer from 'components/Footer'
import HeaderPage from 'components/HeaderPage'
import Loading from 'components/Loading'
import ModalComponent from 'components/ModalComponent'
import PaginationComponent from 'components/PaginationComponent'
import ScreenWrapper from 'components/ScreenWrapper'
import TableLoading from 'components/TableLoading'
import {
  ACCEPT_TYPE,
  LABEL_BUTTON_CLEAR_SEARCH,
  LABEL_BUTTON_SEARCH,
  NUMBER,
  STATUS,
  STRING,
  TYPE_INPUT,
} from 'constants/Constant'
import * as RoomTypeApi from 'network/RoomTypeApi'
import React, { Component, Suspense } from 'react'
// import { browserHistory } from 'react-router'
import { Col, FormControl, Row, Table } from 'react-bootstrap'
import { withRouter } from 'react-router-dom'
import { createFormData } from 'utils/createFormData'
import { toDateString, validateForm } from 'utils/helper'
import { notifyFail, notifySuccess } from 'utils/notify'
import { resizeFile } from 'utils/resize/resizeFile'
import './style.css'
// import reactotron from 'reactotron-react-js'
class RoomTypeListScreen extends Component {
  constructor(props) {
    super(props)
    this.state = {
      [STRING.fromDate]: '',
      [STRING.toDate]: '',
      valueSearch: '',
      status: '',
      checkAll: false,
      roomTypeId: '',
      isError: false,
      listRoomType: [],
      listRoomTypeOrigin: [],
      isLoading: true,
      conFirmModal: false,
      activePage: 1,
      isExist: false,
      check: [],
      createRoomType: false,
      editRoomType: false,
      hasEdit: false,
      paging: '',
      iconUrl: '',
      modal: {
        nameType: '',
        illustration: '',
        status: '',
      },
      validateError: {
        nameTypeError: '',
        statusError: '',
      },
      tableHeader: [
        {
          header: STRING.numericalOrder,
        },
        {
          header: 'Tên loại phòng',
        },
        {
          header: STRING.status,
        },
        {
          header: STRING.createDate,
        },
        {
          header: 'checkbox',
        },
      ],
    }
  }

  componentDidMount() {
    this.getData()
  }

  getData = async () => {
    const { valueSearch, [STRING.fromDate]: fromDate, [STRING.toDate]: toDate, status, activePage } = this.state
    const payload = {
      search: valueSearch,
      is_active: parseInt(status) || '',
      // fromDate: fromDate ? new Date(fromDate) : '',
      // toDate: toDate ? new Date(toDate) : new Date(Date.now()),
      page: activePage,
    }
    try {
      const res = await RoomTypeApi.getListRoomType(payload)
      this.setState({
        ...this.state,
        listRoomType: res?.data.map((roomType) => {
          roomType.isSelected = false
          return roomType
        }),
        isLoading: false,
        paging: res?.paging,
      })
    } catch (error) {
      this.setState({
        ...this.state,
        isLoading: false,
        isError: true,
      })
    }
  }

  addUpdateRoomType = async () => {
    const { createRoomType, roomTypeId } = this.state
    const { nameType, illustration, status } = this.state.modal
    try {
      const payload = {
        name: nameType,
        image: illustration,
        is_active: createRoomType ? 1 : status,
      }

      this.setState({
        isLoading: true,
      })

      if (createRoomType) {
        const convertFormData = createFormData(payload)
        await RoomTypeApi.createRoomType(convertFormData)
        this.setState(
          {
            createRoomType: false,
            modal: {
              nameType: '',
              status: '',
              illustration: '',
            },
          },
          () => this.getData()
        )
        notifySuccess(STRING.addSuccess)
        return
      } else {
        payload.id = roomTypeId
        const convertFormData = createFormData(payload)
        await RoomTypeApi.updateRoomType(convertFormData)
        this.setState(
          {
            editRoomType: false,
            modal: {
              nameType: '',
              status: '',
              illustration: '',
            },
          },
          () => this.getData()
        )
      }
      notifySuccess(STRING.editSuccess)
    } catch (error) {
      this.setState({
        createRoomType: false,
        isLoading: false,
      })
      notifyFail(STRING.Fail)
    }
  }

  getListSelected = () => {
    const { listRoomType } = this.state
    let payload = []
    listRoomType.forEach((item) => {
      if (item.isSelected) payload.push(item.id)
    })

    return payload
  }

  deleteRoomType = async () => {
    const { listRoomType } = this.state
    const payload = this.getListSelected()
    this.setState({
      isLoading: true,
    })

    try {
      await RoomTypeApi.deleteRoomType({ listID: payload })
      if (payload.length === listRoomType.length) {
        this.setState(
          {
            activePage: 1,
            isLoading: false,
            conFirmModal: false,
          },
          () => this.getData()
        )
      } else {
        this.setState(
          {
            isLoading: false,
            conFirmModal: false,
          },
          () => this.getData()
        )
      }
      notifySuccess(STRING.deleteSuccess)
    } catch (error) {
      this.setState({
        isLoading: false,
        conFirmModal: false,
      })
      notifyFail(STRING.deleteFail)
    }
  }

  handleEdit = () => {
    const { listRoomType } = this.state
    const roomType = listRoomType.find((provider) => provider.isSelected)
    this.setState({
      roomTypeId: roomType?.id,
      iconUrl: roomType?.image,
      modal: {
        nameType: roomType?.name,
        status: roomType?.is_active,
        illustration: '',
      },
      editRoomType: true,
    })
  }

  search = () => {
    this.setState(
      {
        isLoading: true,
        activePage: 1,
      },
      () => this.getData()
    )
  }

  clearSearch = () => {
    this.setState(
      {
        valueSearch: '',
        status: '',
        isLoading: true,
      },
      () => this.getData()
    )
  }

  handleCheckBox = (value, index) => {
    const { checkAll, listRoomType } = this.state
    let newListRoomType = [...listRoomType]
    let newCheckAll = false
    let newHasEdit = false

    if (!value?.isSelected && checkAll) {
      newCheckAll = !checkAll
    }

    newListRoomType[index].isSelected = !value?.isSelected

    let count = this.countNumberOfElementIsChecked(newListRoomType)

    if (count === 1) {
      newHasEdit = true
    }

    if (count === listRoomType.length) {
      newCheckAll = true
    }
    this.setState({ listRoomType: newListRoomType, checkAll: newCheckAll, hasEdit: newHasEdit })
  }

  countNumberOfElementIsChecked = (arrCheck) => {
    return arrCheck.filter((item) => item.isSelected === true).length
  }

  handleChange = (fieldName, value) => {
    this.setState({
      [fieldName]: value || '',
    })
  }

  handleChangeSelect = (fieldName, value) => {
    this.setState(
      {
        [fieldName]: value || '',
        isLoading: true,
        activePage: 1,
      },
      () => this.getData()
    )
  }

  handleChangePage = (page) => {
    this.setState(
      {
        isLoading: true,
        activePage: page,
      },
      () => this.getData()
    )
  }

  handleKeyPress = (e) => {
    if (e.charCode === 13) {
      this.search()
    }
  }

  handleCheckAll = () => {
    const { checkAll, listRoomType } = this.state
    let newHasEdit = false
    let newListRoomType = listRoomType.map((roomType) => {
      roomType.isSelected = !checkAll
      return roomType
    })
    if (this.countNumberOfElementIsChecked(newListRoomType) === 1) {
      newHasEdit = true
    }

    this.setState({
      listRoomType: newListRoomType,
      checkAll: !checkAll,
      hasEdit: newHasEdit,
    })
  }

  handleInputModal = (fieldName, value) => {
    this.setState({
      ...this.state,
      modal: {
        ...this.state.modal,
        [fieldName]: value || '',
      },
    })
  }

  handleIdCard = async (fileName, event) => {
    if (!event.target.files[0]) return
    if (!ACCEPT_TYPE.IMAGE.includes(event.target.files[0].type)) {
      alert(STRING.requiredVideoFormat)
      return
    }

    const image = await resizeFile(event.target.files[0])

    this.setState({
      ...this.state,
      modal: {
        ...this.state.modal,
        [fileName]: image,
      },
    })
  }

  handleBlur = (nameKey, titleName) => {
    validateForm(this, this.state.modal[nameKey], nameKey, titleName)
  }

  checkValidateValue = () => {
    const { nameType, status, illustration } = this.state.modal
    if (this.state.createRoomType) {
      if (nameType && illustration) {
        return false
      }
    } else {
      if (nameType && status) {
        return false
      }
    }
    return true
  }

  renderHeader = () => {
    return (
      <HeaderPage
        titleHeader={STRING.roomType}
        titleButton={STRING.addRoomType}
        onClickButton={() => this.setState({ createRoomType: true })}
      ></HeaderPage>
    )
  }

  renderField = () => {
    const { districtOption, wardOption, valueSearch, status, supplierTypeOption, provinceOption } = this.state
    return (
      <Row className="mx-0 box--shadow p-3">
        <Col sm="3" className="pl-0 responsive__inputField">
          <input
            onKeyPress={this.handleKeyPress}
            type="text"
            className="form-control"
            autoComplete="off"
            placeholder={STRING.nameType}
            value={valueSearch}
            onChange={(e) => this.handleChange('valueSearch', e.target.value)}
          />
        </Col>
        <Col sm="3" className="responsive__inputField pl-0">
          <FormControl
            as="select"
            aria-describedby="basic-addon1"
            value={status}
            onChange={(e) => this.handleChangeSelect('status', e.target.value)}
          >
            <option value="" defaultValue disabled>
              {STRING.status}
            </option>

            <option value={STATUS.approve}>{STRING.active}</option>
            <option value={STATUS.stopWorking}>{STRING.stopWorking}</option>
          </FormControl>
        </Col>
        <Col sm="6" className="responsive__inputField">
          {this.renderButton()}
        </Col>
      </Row>
    )
  }

  renderPagination = () => {
    const { isLoading, paging } = this.state
    if (!isLoading) {
      return (
        <>
          {paging?.count > NUMBER.page_limit && (
            <PaginationComponent
              activePage={this.state.activePage}
              itemCountPerPage={paging.limit}
              totalItemsCount={paging.count}
              action={this.handleChangePage}
            />
          )}
        </>
      )
    }
  }

  renderButton = () => {
    return (
      <Row className="px-0">
        <Col className="button-wrapper pr-1">
          <ButtonType typeButton={LABEL_BUTTON_SEARCH} isOpen={this.search} />
          <ButtonType typeButton={LABEL_BUTTON_CLEAR_SEARCH} isOpen={this.clearSearch} style={{ marginRight: 3 }} />
        </Col>
      </Row>
    )
  }

  renderData = () => {
    const { isLoading } = this.state

    if (isLoading) {
      return (
        <>
          <TableLoading />
        </>
      )
    } else {
      return (
        <div className="pt-4 pb-5 px-3 mt-4 table--shadow">
          {this.renderTable()}
          {this.renderPagination()}
        </div>
      )
    }
  }

  renderModal = () => {
    const { createRoomType, editRoomType, iconUrl } = this.state
    const { nameType, status, illustration } = this.state.modal
    const { nameTypeError } = this.state.validateError
    let allField = [
      {
        type: TYPE_INPUT.text,
        titleName: STRING.nameType,
        valueName: 'nameType',
        value: nameType,
        error: nameTypeError,
        nameError: 'nameTypeError',
      },

      {
        type: TYPE_INPUT.illustration,
        titleName: STRING.avatar,
        url: iconUrl,
        value: illustration,
        edit: editRoomType,
        valueName: 'illustration',
      },
    ]

    let editField = [
      ...allField,
      {
        type: TYPE_INPUT.select,
        titleName: STRING.status,
        valueName: 'status',
        value: status,
        list: [
          { id: 1, name: 'hoạt động' },
          { id: 2, name: 'Ngừng hoạt động' },
        ],
      },
    ]

    return (
      <ModalComponent
        allField={createRoomType ? allField : editField}
        title={createRoomType ? STRING.addRoomType : STRING.editRoomType}
        checkValidateValue={this.checkValidateValue()}
        handleInputModal={this.handleInputModal}
        isOpen={createRoomType || editRoomType}
        addUpdate={this.addUpdateRoomType}
        checkValidateError={this.state.validateError}
        handleIdCard={this.handleIdCard}
        handleBlur={this.handleBlur}
        onHide={() =>
          this.setState({
            createRoomType: false,
            editRoomType: false,
            iconUrl: '',
            modal: {
              nameType: '',
              status: '',
              illustration: '',
            },
            validateError: {
              nameTypeError: '',
              statusError: '',
            },
          })
        }
      />
    )
  }

  renderBody = () => {
    return (
      <>
        {this.renderModal()}
        {this.renderField()}
        <ConfirmModal
          isOpen={this.state.conFirmModal}
          onHide={() =>
            this.setState({
              ...this.state,
              conFirmModal: false,
            })
          }
          title="xóa"
          action={this.deleteRoomType}
        />
        {this.renderData()}
      </>
    )
  }

  renderTable = () => {
    const { tableHeader, checkAll } = this.state
    return (
      <>
        <Table striped responsive bordered>
          <thead>
            <tr>
              {tableHeader?.map((item, index) =>
                item.header === 'checkbox' ? (
                  <th key={index}>
                    <input type="checkbox" className="mt-3 cursor" checked={checkAll} onChange={this.handleCheckAll} />
                  </th>
                ) : (
                  <th key={index}>{item.header}</th>
                )
              )}
            </tr>
          </thead>
          <Suspense fallback={<Loading />}>{this.renderTableData()}</Suspense>
        </Table>
      </>
    )
  }

  renderFooter = (showFooter) => {
    const { checkAll, hasEdit } = this.state
    return (
      <React.Fragment>
        <Footer
          delete={() => {
            this.setState({ ...this.state, conFirmModal: true })
          }}
          checkAll={checkAll}
          handleCheckAll={this.handleCheckAll}
          showFooter={showFooter}
          hasEdit={hasEdit}
          handleOnEdit={this.handleEdit}
        ></Footer>
      </React.Fragment>
    )
  }

  renderTableData = () => {
    const { listRoomType } = this.state

    return (
      <tbody>
        {listRoomType?.length ? (
          listRoomType?.map((value, index) => {
            return (
              <tr key={index}>
                <td>{index + NUMBER.page_limit * (this.state.activePage - 1) + 1}</td>
                <td>{value?.name || '--'}</td>
                <td>{value?.is_active === STATUS.stopWorking ? STRING.stopWorking : STRING.active}</td>
                <td>{toDateString(value?.created_at) || '--'}</td>
                <td>
                  <input
                    type="checkbox"
                    className="cursor"
                    checked={value?.isSelected}
                    onChange={() => this.handleCheckBox(value, index)}
                  />
                </td>
              </tr>
            )
          })
        ) : (
          <EmptyData />
        )}
      </tbody>
    )
  }

  render() {
    const { isLoading, isError, listRoomType } = this.state
    let showFooter
    if (!isLoading) {
      showFooter = listRoomType?.findIndex((item) => item.isSelected) >= 0
    }
    return (
      <ScreenWrapper
        titleHeader={STRING.customer}
        isLoading={isLoading}
        isError={isError}
        renderFooter={() => this.renderFooter(showFooter)}
        renderHeader={this.renderHeader}
      >
        {this.renderBody()}
      </ScreenWrapper>
    )
  }
}

export default withRouter(RoomTypeListScreen)
