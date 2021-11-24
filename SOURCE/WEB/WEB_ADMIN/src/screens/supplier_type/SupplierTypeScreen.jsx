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
import { LABEL_BUTTON_CLEAR_SEARCH, LABEL_BUTTON_SEARCH, NUMBER, STATUS, STRING, TYPE_INPUT } from 'constants/Constant'
import * as ProviderTypeApi from 'network/ProviderTypeApi'
import React, { Component, Suspense } from 'react'
import { Col, FormControl, Row, Table } from 'react-bootstrap'
import { withRouter } from 'react-router-dom'
import { toDateString, validateForm } from 'utils/helper'
import { notifyFail, notifySuccess } from 'utils/notify'
import './SupplierType.css'

class SupplierTypeScreen extends Component {
  constructor(props) {
    super(props)
    this.state = {
      [STRING.fromDate]: '',
      [STRING.toDate]: '',
      valueSearch: '',
      status: '',
      checkAll: false,
      providerTypeId: '',
      isError: false,
      listProviderType: [],
      isLoading: true,
      conFirmModal: false,
      activePage: 1,
      isExist: false,
      check: [],
      createSupplierType: false,
      editSupplierType: false,
      hasEdit: false,
      paging: '',
      modal: {
        nameType: '',
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
          header: STRING.supplierName,
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

  async componentDidMount() {
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
      const res = await ProviderTypeApi.getListProviderType(payload)
      this.setState({
        ...this.state,
        listProviderType: res?.data.map((providerType) => {
          providerType.isSelected = false
          return providerType
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

  addUpdateSupplierType = async () => {
    const { createSupplierType, providerTypeId } = this.state
    const { nameType, status } = this.state.modal
    try {
      const payload = {
        name: nameType,
      }
      this.setState({
        isLoading: true,
      })

      if (createSupplierType) {
        payload.is_active = 1
        await ProviderTypeApi.createProviderType(payload)
        this.setState(
          {
            createSupplierType: false,
            modal: {
              nameType: '',
              status: '',
            },
          },
          () => this.getData()
        )
        notifySuccess(STRING.addSuccess)
      } else {
        payload.id = providerTypeId
        payload.is_active = status
        await ProviderTypeApi.updateProviderType(payload)
        this.setState(
          {
            editSupplierType: false,
            modal: {
              nameType: '',
              status: '',
            },
          },
          () => this.getData()
        )
        notifySuccess(STRING.editSuccess)
      }
    } catch (error) {
      this.setState({
        createSupplierType: false,
        isLoading: false,
      })
      notifyFail(STRING.Fail)
    }
  }

  handleEdit = () => {
    const { listProviderType } = this.state
    const providerType = listProviderType.find((provider) => provider.isSelected)
    this.setState({
      providerTypeId: providerType?.id,
      modal: {
        nameType: providerType?.name,
        status: providerType?.is_active,
      },
      editSupplierType: true,
    })
  }

  getListSelected = () => {
    const { listProviderType } = this.state
    let payload = []
    listProviderType.forEach((item) => {
      if (item.isSelected) payload.push(item.id)
    })

    return payload
  }

  deleteProviderType = async () => {
    const { listProviderType } = this.state
    const payload = this.getListSelected()
    this.setState({
      isLoading: true,
    })

    try {
      await ProviderTypeApi.deleteProviderType({ listID: payload })
      if (payload.length === listProviderType.length) {
        this.setState(
          {
            activePage: 1,
            isLoading: false,
            conFirmModal: false,
          },
          () => this.getData(),
          notifySuccess(STRING.deleteSuccess)
        )
      } else {
        this.setState(
          {
            isLoading: false,
            conFirmModal: false,
          },
          () => this.getData(),
          notifySuccess(STRING.deleteSuccess)
        )
      }
    } catch (error) {
      this.setState({
        isLoading: false,
        conFirmModal: false,
      })
      notifyFail(STRING.deleteFail)
    }
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
    const { checkAll, listProviderType } = this.state
    let newListProviderType = [...listProviderType]
    let newCheckAll = false
    let newHasEdit = false

    if (!value?.isSelected && checkAll) {
      newCheckAll = !checkAll
    }

    newListProviderType[index].isSelected = !value?.isSelected

    if (this.countNumberOfElementIsChecked(newListProviderType) === 1) {
      newHasEdit = true
    }

    if (this.countNumberOfElementIsChecked(newListProviderType) === listProviderType.length) {
      newCheckAll = true
    }

    this.setState({ ...this.state, listProviderType: newListProviderType, checkAll: newCheckAll, hasEdit: newHasEdit })
  }

  handleCheckAll = () => {
    const { checkAll, listProviderType } = this.state
    let newHasEdit = false
    let newListProviderType = listProviderType.map((provider) => {
      provider.isSelected = !checkAll
      return provider
    })

    if (this.countNumberOfElementIsChecked(newListProviderType) === 1) {
      newHasEdit = true
    }

    this.setState({
      ...this.state,
      listProviderType: newListProviderType,
      checkAll: !checkAll,
      hasEdit: newHasEdit,
    })
  }

  handleChange = (fieldName, value) => {
    this.setState({
      ...this.state,
      [fieldName]: value || '',
    })
  }

  handleChangeSelect = (fieldName, value) => {
    this.setState(
      {
        ...this.state,
        [fieldName]: value || '',
        isLoading: true,
      },
      () => this.getData()
    )
  }

  handleChangePage = (page) => {
    this.setState(
      {
        ...this.state,
        activePage: page,
        isLoading: true,
      },
      () => this.getData()
    )
  }

  handleKeyPress = (e) => {
    if (e.charCode === 13) {
      this.search()
    }
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

  handleBlur = (nameKey, titleName) => {
    validateForm(this, this.state.modal[nameKey], nameKey, titleName)
  }

  checkValidateValue = () => {
    const { nameType } = this.state.modal
    if (this.state.createSupplierType) {
      if (nameType) {
        return false
      }
      return true
    }
  }

  countNumberOfElementIsChecked = (arrCheck) => {
    return arrCheck.filter((item) => item.isSelected === true).length
  }

  renderHeader = () => {
    return (
      <HeaderPage
        titleHeader={STRING.supplierTypeFull}
        titleButton={STRING.addSupplierType}
        onClickButton={() => this.setState({ createSupplierType: true })}
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
            <option value="" defaultValue>
              {STRING.status}
            </option>

            <option value={STATUS.approve}>{STRING.active}</option>
            <option value={STATUS.stopWorking}>{STRING.stopWorking}</option>
          </FormControl>
        </Col>
        <Col sm={6}>{this.renderButton()}</Col>
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
    const { createSupplierType, editSupplierType } = this.state
    const { nameType, status } = this.state.modal
    const { nameTypeError } = this.state.validateError
    const allField = [
      {
        type: TYPE_INPUT.text,
        titleName: STRING.nameType,
        valueName: 'nameType',
        value: nameType,
        error: nameTypeError,
        nameError: 'nameTypeError',
      },
    ]
    if (editSupplierType) {
      allField.push({
        type: TYPE_INPUT.select,
        titleName: STRING.status,
        valueName: 'status',
        value: status,
        list: [
          { id: 1, name: 'hoạt động' },
          { id: 2, name: 'Ngừng hoạt động' },
        ],
      })
    }

    return (
      <ModalComponent
        allField={allField}
        title={createSupplierType ? STRING.addSupplierTypeFull : STRING.edItSupplierTypeFull}
        checkValidateValue={this.checkValidateValue()}
        handleInputModal={this.handleInputModal}
        isOpen={createSupplierType || editSupplierType}
        addUpdate={this.addUpdateSupplierType}
        checkValidateError={this.state.validateError}
        handleBlur={this.handleBlur}
        onHide={() =>
          this.setState({
            ...this.state,
            createSupplierType: false,
            editSupplierType: false,
            modal: {
              nameType: '',
              status: '',
            },
            validateError: {
              nameTypeError: '',
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
          action={this.deleteProviderType}
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
    const { listProviderType } = this.state

    return (
      <tbody>
        {listProviderType?.length ? (
          listProviderType?.map((value, index) => {
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
    const { isLoading, isError, listProviderType } = this.state
    let showFooter
    if (!isLoading) {
      showFooter = listProviderType?.findIndex((item) => item.isSelected) >= 0
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

export default withRouter(SupplierTypeScreen)
