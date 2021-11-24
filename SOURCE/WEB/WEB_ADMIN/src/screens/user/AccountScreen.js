import React, { Component, Suspense } from 'react'
import { connect } from 'react-redux'
import { Row, Col, FormControl } from 'react-bootstrap'
import { createAccount, updateAccount, deleteAccount, getListRole, getListAccount } from 'constants/Api'
import { getListAccountAction, getListOverView } from 'redux/actions'
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
class AccountScreen extends Component {
  constructor(props) {
    super(props)
    this.state = {
      [STRING.fromDate]: '',
      [STRING.toDate]: '',
      valueSearch: '',
      isLoading: true,
      isError: false,
      userId: '',
      check: [],
      hasEdit: false,
      checkAll: false,
      accountType: '',
      accountList: [],
      paging: {},
      modal: {
        userName: '',
        fullName: '',
        phoneNumber: '',
        role: '',
        email: '',
        passWord: '',
        confirmPassWord: '',
      },
      validateError: {
        fullNameError: '',
        userNameError: '',
        phoneNumberError: '',
        emailError: '',
        role: '',
        passWordError: '',
        confirmPassWordError: '',
      },
      selected: [],
      roleList: [],
      status: '',
      conFirmModal: false,
      activePage: 1,
      isExist: false,
      createAccount: false,
      editAccount: false,
      tableHeader: [
        {
          header: STRING.numericalOrder,
        },
        {
          header: STRING.fullName,
        },
        {
          header: STRING.phoneNumber,
        },
        {
          header: STRING.email,
        },
        {
          header: STRING.role,
        },
        {
          header: 'checkbox',
        },
      ],
    }
  }

  componentDidMount() {
    this.getListRoleFunc()
    this.getData()
  }

  getData = async () => {
    const { accountType, valueSearch } = this.state
    const payload = {
      search: valueSearch,
      role_id: accountType ? parseInt(accountType) : '',
    }
    try {
      const accountListApi = await getListAccount(payload)
      this.setState({
        accountList: accountListApi?.data.map((item) => {
          item.isSelected = false
          return item
        }),
        paging: accountListApi.paging,
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

  getListRoleFunc = async () => {
    const payload = { is_show: 1 }
    try {
      const roleListApi = await getListRole(payload)
      this.setState({
        roleList: roleListApi.data,
      })
    } catch (error) {
      console.log(error)
      this.setState({
        isError: true,
      })
    }
  }

  addUpdateAccount = async () => {
    const { fullName, email, phoneNumber, role, passWord, confirmPassWord } = this.state.modal

    const payload = {
      full_name: fullName,
      email,
      phone: phoneNumber,
      password: passWord,
      role_id: role ? parseInt(role) : '',
      // image: '',
      // province_id: '',
      // identify: '',
      // address: '',
      // gender: '',
      // dob: '',
    }
    // const payloadUpdate = {
    //   id: this.state.userId,
    //   full_name: fullName,
    //   email,
    //   phone_number: phoneNumber,
    //   role_id: role ? parseInt(role) : '',
    //   // image: '',
    //   // province_id: '',
    //   // identify: '',
    //   // address: '',
    //   // gender: '',
    //   // dob: '',
    // }
    this.setState({
      isLoading: true,
    })
    try {
      if (this.state.createAccount) {
        if (confirmPassWord !== passWord) {
          notifyFail('mật khẩu không trùng khớp!')
          this.setState({
            isLoading: false,
          })
          return
        }
        await createAccount(payload)
        notifySuccess(STRING.addSuccess)
      } else {
        payload.id = this.state.userId
        await updateAccount(payload)
        notifySuccess(STRING.editSuccess)
      }
      this.setState(
        {
          editAccount: false,
          createAccount: false,
          modal: {
            userName: '',
            fullName: '',
            phoneNumber: '',
            role: '',
            email: '',
            passWord: '',
            confirmPassWord: '',
          },
        },
        () => this.getData()
      )
    } catch (error) {
      console.log(error)
      if (this.state.createAccount) {
        notifyFail(STRING.addFail)
      } else {
        notifyFail(STRING.editFail)
      }
      this.setState({
        isLoading: false,
      })
    }
  }

  deleteAccount = async () => {
    const { accountList } = this.state
    let payload = accountList.map((item, index) => {
      if (item.isSelected) {
        return item.id
      }
    })

    this.setState({
      isLoading: true,
    })

    try {
      await deleteAccount({ listID: payload })
      if (payload.length === accountList.length) {
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
        accountType: '',
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
    const { accountList } = this.state

    if (this.countNumberOfElementIsChecked(accountList) > 1) {
      notifyFail('Vui lòng chỉ chọn một giá trị để sửa!')
      return
    }

    let value = accountList.find((item) => item.isSelected === true)

    // let roleApi = [
    //   {
    //     label: value?.role.name,
    //     value: value?.role.id,
    //   },
    // ]

    this.setState({
      editAccount: true,
      userId: value.id,
      modal: {
        ...this.state.modal,
        fullName: value.full_name,
        // userName: value.username,
        email: value.email,
        phoneNumber: value.phone,
        role: value?.role.id,
      },
    })
  }

  handleInputModal = (fieldName, value) => {
    if (fieldName === 'userName') {
      this.setState({
        modal: {
          ...this.state.modal,
          [fieldName]: value.replace(/\s/g, ''),
        },
      })
      return
    }

    this.setState({
      modal: {
        ...this.state.modal,
        [fieldName]: value || '',
      },
    })
  }

  checkValidateValue = () => {
    const { fullName, phoneNumber, role, passWord, confirmPassWord } = this.state.modal
    if (this.state.createAccount) {
      if (fullName && phoneNumber && role && passWord && confirmPassWord) {
        return false
      }
      return true
    } else {
      if (fullName && phoneNumber && role) {
        return false
      }
      return true
    }
  }

  handleBlur = (nameKey, titleName, value) => {
    if (nameKey === 'phoneNumber' && value) {
      validateForm(this, value, nameKey, titleName)
      return
    }
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
    const { checkAll, accountList } = this.state
    let newHasEdit = false
    let newAccountList = accountList.map((account) => {
      account.isSelected = !checkAll
      return account
    })

    if (this.countNumberOfElementIsChecked(newAccountList) === 1) {
      newHasEdit = true
    }

    this.setState({
      accountList: newAccountList,
      hasEdit: newHasEdit,
      checkAll: !checkAll,
    })
  }

  handleCheckBox = (value, index) => {
    const { checkAll, accountList } = this.state
    let newAccountList = [...accountList]
    let newCheckAll = false
    let newHasEdit = false

    if (!value?.isSelected && checkAll) {
      newCheckAll = !checkAll
    }

    newAccountList[index].isSelected = !value?.isSelected

    if (this.countNumberOfElementIsChecked(newAccountList) === 1) {
      newHasEdit = true
    }

    if (this.countNumberOfElementIsChecked(newAccountList) === accountList.length) {
      newCheckAll = true
    }

    this.setState({ ...this.state, accountList: newAccountList, checkAll: newCheckAll, hasEdit: newHasEdit })
  }

  renderHeader = () => {
    return (
      <HeaderPage
        titleHeader={STRING.account}
        titleButton={STRING.addAccount}
        onClickButton={() =>
          this.setState({
            createAccount: true,
          })
        }
      ></HeaderPage>
    )
  }

  renderField = () => {
    const { valueSearch, accountType, roleList } = this.state
    return (
      <Row className="mx-0 box--shadow pt-4 pb-3 px-2">
        <Col md="4" className="responsive__inputField">
          <input
            onKeyPress={this.handleKeyPress}
            type="text"
            className="form-control"
            autoComplete="off"
            placeholder={STRING.typeName + ' , ' + STRING.phoneNumber}
            value={valueSearch}
            onChange={(e) => this.handleChange('valueSearch', e.target.value)}
          />
        </Col>
        <Col md="4" className="responsive__inputField ">
          <FormControl
            as="select"
            aria-describedby="basic-addon1"
            value={accountType}
            onChange={(e) => this.handleChangeSelect('accountType', e.target.value)}
          >
            <option value="" defaultValue>
              {STRING.accountType}
            </option>

            {(roleList || []).map((role, index) => (
              <option value={role.id} key={index}>
                {role.name}
              </option>
            ))}
          </FormControl>
        </Col>
        <Col xs="12">{this.renderButton()}</Col>
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
    const { fullName, userName, phoneNumber, role, email, passWord, confirmPassWord } = this.state.modal
    const {
      fullNameError,
      // userNameError,
      emailError,
      phoneNumberError,
      passWordError,
      confirmPassWordError,
    } = this.state.validateError
    const { createAccount, editAccount, selected, roleList } = this.state

    const addField = [
      {
        type: TYPE_INPUT.text,
        titleName: STRING.fullName,
        value: fullName,
        error: fullNameError,
        valueName: 'fullName',
        errorName: 'fullNameError',
      },
      // {
      //   type: TYPE_INPUT.text,
      //   titleName: STRING.userName,
      //   value: userName,
      //   error: userNameError,
      //   valueName: 'userName',
      //   errorName: 'userNameError',
      // },
      {
        type: TYPE_INPUT.phoneNumber,
        titleName: STRING.phoneNumber,
        value: phoneNumber,
        error: phoneNumberError,
        valueName: 'phoneNumber',
        errorName: 'phoneNumberError',
      },
      {
        type: TYPE_INPUT.email,
        titleName: STRING.email,
        value: email,
        error: emailError,
        valueName: 'email',
        errorName: 'emailError',
      },

      {
        type: TYPE_INPUT.select,
        titleName: STRING.role,
        value: role,
        valueName: 'role',
        list: roleList,
        error: '',
        detail: editAccount,
      },
      {
        type: TYPE_INPUT.passWord,
        titleName: STRING.passWord,
        value: passWord,
        error: passWordError,
        valueName: 'passWord',
        errorName: 'passWordError',
      },
      {
        type: TYPE_INPUT.passWord,
        titleName: STRING.confirmPassWord,
        value: confirmPassWord,
        valueName: 'confirmPassWord',
        error: confirmPassWordError,
        errorName: 'confirmPassWordError',
      },
    ]

    let editField = [...addField]

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
          action={this.deleteAccount}
        />
        {
          <ModalComponent
            allField={createAccount ? addField : editField.splice(0, addField.length - 2)}
            image_url=""
            title={createAccount ? STRING.addAccount : STRING.editAccount}
            // listMultiselect={selected}
            checkValidateError={this.state.validateError}
            checkValidateValue={this.checkValidateValue()}
            handleInputModal={this.handleInputModal}
            isOpen={createAccount || editAccount}
            handleBlur={this.handleBlur}
            addUpdate={this.addUpdateAccount}
            onHide={() =>
              this.setState({
                createAccount: false,
                editAccount: false,
                modal: {
                  userName: '',
                  fullName: '',
                  phoneNumber: '',
                  role: [],
                  passWord: '',
                },
                validateError: {
                  userNameError: '',
                  phoneNumberError: '',
                  passWordError: '',
                  confirmPassWordError: '',
                },
              })
            }
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
    const { accountList } = this.state
    return (
      <tbody>
        {accountList.length ? (
          accountList.map((value, index) => (
            <tr key={index}>
              <td>{index + NUMBER.page_limit * (this.state.activePage - 1) + 1}</td>
              <td>{value?.full_name || '--'}</td>
              <td>{value?.phone || '--'}</td>
              <td>{value?.email || '--'}</td>

              <td>{value?.role?.name}</td>

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
    const { isError, accountList, isLoading } = this.state
    let showFooter
    if (!isLoading) {
      showFooter = accountList.findIndex((item) => item.isSelected === true) >= 0
    }

    return (
      <ScreenWrapper
        titleHeader={STRING.account}
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
const mapStateToProps = (state) => ({
  listAccountState: state.listAccountReducer,
})

const mapDispatchToProps = {
  getListAccountAction,
  getListOverView,
}
export default connect(mapStateToProps, mapDispatchToProps)(AccountScreen)
