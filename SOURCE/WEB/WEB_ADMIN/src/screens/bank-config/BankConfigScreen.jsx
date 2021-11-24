import React, { Component, Suspense } from 'react'
import { Row, Col, FormControl } from 'react-bootstrap'
import { createBank, deleteBank, getListBank, updateBank } from 'constants/Api'
import Loading from 'components/Loading'
import {
  STRING,
  LABEL_BUTTON_SEARCH,
  LABEL_BUTTON_ADD,
  LABEL_BUTTON_CLEAR_SEARCH,
  TYPE_INPUT,
  NUMBER,
  STATUS,
} from 'constants/Constant'
// import DatePickerCustom from 'components/DatePickerCustom'
import ConfirmModal from 'components/ConfirmModal'
import ScreenWrapper from 'components/ScreenWrapper'
// import TableData from 'components/TableData'
import ButtonType from 'components/ButtonType'
// import LoadingAction from 'components/LoadingAction'
import Error from 'components/Error'
import LoadingData from 'components/LoadingData'
import PaginationComponent from 'components/PaginationComponent'
import ModalComponent from 'components/ModalComponent'
import HeaderPage from 'components/HeaderPage'
import { validateForm } from 'utils/helper'
import 'styles/UserScreen.css'
// import { get } from 'js-cookie'

import { notifyFail, notifySuccess } from 'utils/notify'
import Footer from 'components/Footer'
import EmptyData from 'components/EmptyData'
// import reactotron from 'reactotron-react-js'
class BankConfigScreen extends Component {
  constructor(props) {
    super(props)
    this.state = {
      [STRING.fromDate]: '',
      [STRING.toDate]: '',
      valueSearch: '',
      isLoading: true,
      isError: false,
      bankId: '',
      check: [],
      hasEdit: false,
      checkAll: false,
      bankList: [],
      paging: {},
      modal: {
        name: '',
        seri_number: '',
        account: '',
      },
      validateError: {
        nameError: '',
        seri_numberError: '',
        accountError: '',
      },
      selected: [],
      status: '',
      conFirmModal: false,
      activePage: 1,
      isExist: false,
      createBank: false,
      editBank: false,
      tableHeader: [
        {
          header: STRING.numericalOrder,
        },
        {
          header: 'Tên ngân hàng',
        },
        {
          header: 'Số tài khoản',
        },
        {
          header: 'Tên chủ tài khoản',
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
    const { valueSearch } = this.state
    const payload = {
      search: valueSearch,
    }
    try {
      const bankListApi = await getListBank(payload)
      this.setState({
        bankList: bankListApi?.data.map((item) => {
          item.isSelected = false
          return item
        }),
        paging: bankListApi.paging,
        isError: false,
        isLoading: false,
      })
    } catch (error) {
      console.log(error)
      this.setState({
        isLoading: false,
      })
    }
  }

  addUpdateBank = async () => {
    this.setState({
      isLoading: true,
    })
    try {
      if (this.state.createBank) {
        await createBank(this.state.modal)
        notifySuccess(STRING.addSuccess)
      } else {
        const payload = { ...this.state.modal }
        payload.id = this.state.bankId
        await updateBank(payload)
        notifySuccess(STRING.editSuccess)
      }
      this.setState(
        {
          editBank: false,
          createBank: false,
          modal: {
            name: '',
            seri_number: '',
            account: '',
          },
          checkAll: false,
        },
        () => this.getData()
      )
    } catch (error) {
      console.log(error)
      if (this.state.createBank) {
        notifyFail(STRING.addFail)
      } else {
        notifyFail(STRING.editFail)
      }
      this.setState({
        isLoading: false,
      })
    }
  }

  deleteBank = async () => {
    const { bankList } = this.state
    let payload = bankList.map((item) => {
      if (item.isSelected) {
        return item.id
      }
    })

    this.setState({
      isLoading: true,
    })

    try {
      await deleteBank({ listID: payload })
      if (payload.length === bankList.length) {
        this.setState(
          {
            activePage: 1,
            isLoading: false,
            conFirmModal: false,
          },
          () => this.getData()
        )
        notifySuccess(STRING.deleteSuccess)
      } else {
        this.setState(
          {
            isLoading: false,
            conFirmModal: false,
          },
          () => this.getData()
        )
        notifySuccess(STRING.deleteSuccess)
      }
    } catch (error) {
      this.setState({
        isLoading: false,
        conFirmModal: false,
      })
      notifyFail(STRING.deleteFail)
      console.log(error)
    }
  }

  search = () => {
    try {
      this.setState(
        {
          isLoading: true,
          activePage: 1,
        },
        () => this.getData()
      )
    } catch (error) {
      console.log(error)
      this.setState({
        isLoading: true,
      })
    }
  }

  clearSearch = () => {
    this.setState(
      {
        valueSearch: '',
        isLoading: true,
      },
      () => this.getData()
    )
  }

  handleChange = (fieldName, value) => {
    this.setState({
      [fieldName]: value || '',
    })
  }

  handleEdit = () => {
    const { bankList } = this.state

    if (this.countNumberOfElementIsChecked(bankList) > 1) {
      notifyFail('Vui lòng chỉ chọn một giá trị để sửa!')
      return
    }

    let value = bankList.find((item) => item.isSelected === true)
    this.setState({
      editBank: true,
      bankId: value.id,
      modal: {
        name: value.name,
        seri_number: value.seri_number,
        account: value.account,
      },
    })
  }

  handleInputModal = (fieldName, value) => {
    this.setState({
      modal: {
        ...this.state.modal,
        [fieldName]: value || '',
      },
    })
  }

  checkValidateValue = () => {
    const { name, seri_number, account } = this.state.modal
    if (name && seri_number && account) return false
    return true
  }

  handleBlur = (nameKey, titleName, value) => {
    // if (nameKey === 'phoneNumber' && value) {
    //   validateForm(this, value, nameKey, titleName)
    //   return
    // }
    validateForm(this, this.state.modal[nameKey], nameKey, titleName)
  }

  handleChangeSelect = (fieldName, value) => {
    this.setState(
      {
        [fieldName]: value || '',
        activePage: 1,
        isLoading: true,
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
      this.setState(
        {
          isLoading: true,
        },
        () => this.getData()
      )
    }
  }

  countNumberOfElementIsChecked = (arrCheck) => {
    return arrCheck.filter((item) => item.isSelected === true).length
  }

  handleCheckAll = () => {
    const { checkAll, bankList } = this.state
    let newHasEdit = false
    let newBankList = bankList.map((bank) => {
      bank.isSelected = !checkAll
      return bank
    })

    if (this.countNumberOfElementIsChecked(newBankList) === 1) {
      newHasEdit = true
    }

    this.setState({
      bankList: newBankList,
      hasEdit: newHasEdit,
      checkAll: !checkAll,
    })
  }

  handleCheckBox = (value, index) => {
    const { checkAll, bankList } = this.state
    let newBankList = [...bankList]
    let newCheckAll = false
    let newHasEdit = false

    if (!value?.isSelected && checkAll) {
      newCheckAll = !checkAll
    }

    newBankList[index].isSelected = !value?.isSelected

    if (this.countNumberOfElementIsChecked(newBankList) === 1) {
      newHasEdit = true
    }

    if (this.countNumberOfElementIsChecked(newBankList) === bankList.length) {
      newCheckAll = true
    }

    this.setState({ ...this.state, bankList: newBankList, checkAll: newCheckAll, hasEdit: newHasEdit })
  }

  resetModal = () => {
    this.setState({
      editBank: false,
      createBank: false,
      modal: {
        name: '',
        seri_number: '',
        account: '',
      },
    })
  }

  renderHeader = () => {
    return (
      <HeaderPage
        titleHeader={'Cấu hình ngân hàng'}
        titleButton={'Thêm ngân hàng'}
        onClickButton={() =>
          this.setState({
            createBank: true,
          })
        }
      ></HeaderPage>
    )
  }

  renderField = () => {
    const { valueSearch } = this.state
    return (
      <Row className="mx-0 box--shadow pt-4 pb-3 px-2">
        <Col md="4" className="responsive__inputField">
          <input
            onKeyPress={this.handleKeyPress}
            type="text"
            className="form-control"
            autoComplete="off"
            placeholder={STRING.typeName}
            value={valueSearch}
            onChange={(e) => this.handleChange('valueSearch', e.target.value)}
          />
        </Col>
        <Col md="8">{this.renderButton()}</Col>
      </Row>
    )
  }

  renderPagination = () => {
    let { isLoading, paging, activePage } = this.state
    if (!isLoading) {
      return (
        <>
          {paging?.count > NUMBER.page_limit && (
            <PaginationComponent
              activePage={activePage}
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
          <ButtonType typeButton={LABEL_BUTTON_CLEAR_SEARCH} isOpen={this.clearSearch} />
        </Col>
      </Row>
    )
  }

  renderBody = () => {
    const { name, seri_number, account } = this.state.modal
    const { nameError, seri_numberError, accountError } = this.state.validateError
    const { createBank, editBank } = this.state

    const addField = [
      {
        type: TYPE_INPUT.text,
        titleName: 'Tên ngân hàng',
        value: name,
        error: nameError,
        valueName: 'name',
        errorName: 'nameError',
      },
      {
        type: TYPE_INPUT.phoneNumber,
        titleName: 'Số tài khoản',
        value: seri_number,
        error: seri_numberError,
        valueName: 'seri_number',
        errorName: 'seri_numberError',
      },
      {
        type: TYPE_INPUT.text,
        titleName: 'Tên Chủ tài khoản',
        value: account,
        error: accountError,
        valueName: 'account',
        errorName: 'accountError',
      },
    ]

    return (
      <>
        {this.renderField()}
        <ConfirmModal
          isOpen={this.state.conFirmModal}
          onHide={() =>
            this.setState({
              conFirmModal: false,
            })
          }
          title={STRING.delete}
          action={this.deleteBank}
        />
        {
          <ModalComponent
            allField={addField}
            title={createBank ? 'Thêm ngân hàng' : 'Sửa ngân hàng'}
            checkValidateError={this.state.validateError}
            checkValidateValue={this.checkValidateValue()}
            handleInputModal={this.handleInputModal}
            isOpen={createBank || editBank}
            handleBlur={this.handleBlur}
            addUpdate={this.addUpdateBank}
            onHide={this.resetModal}
          />
        }
        <div className="pt-4 pb-5 px-3 mt-4 table--shadow">
          {this.renderTable()}
          {this.renderPagination()}
        </div>
      </>
    )
  }

  renderTable = () => {
    const { tableHeader, checkAll } = this.state

    return (
      <>
        <table id="example2" className="table table-bordered table-striped table-responsive-md ">
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
          {this.renderTableData()}
        </table>
      </>
    )
  }
  renderTableData = () => {
    const { bankList } = this.state
    return (
      <tbody>
        {bankList.length ? (
          bankList.map((value, index) => (
            <tr key={index}>
              <td>{index + NUMBER.page_limit * (this.state.activePage - 1) + 1}</td>
              <td>{value?.name || '--'}</td>
              <td>{value?.seri_number || '--'}</td>
              <td>{value?.account || '--'}</td>
              <td className="width2btn">
                <input
                  type="checkbox"
                  className="cursor"
                  checked={value.isSelected}
                  onChange={() => this.handleCheckBox(value, index)}
                />
              </td>
            </tr>
          ))
        ) : (
          <EmptyData />
        )}
      </tbody>
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

  render() {
    const { isError, bankList, isLoading } = this.state
    let showFooter
    if (!isLoading) {
      showFooter = bankList.findIndex((item) => item.isSelected === true) >= 0
    }

    return (
      <ScreenWrapper
        titleHeader={'Cấu hình ngân hàng'}
        isLoading={isLoading}
        context={this.props}
        isError={isError}
        renderFooter={() => this.renderFooter(showFooter)}
        renderHeader={this.renderHeader}
      >
        {this.renderBody()}
      </ScreenWrapper>
    )
  }
}

export default BankConfigScreen
