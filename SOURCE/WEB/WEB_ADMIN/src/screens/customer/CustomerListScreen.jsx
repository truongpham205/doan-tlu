import React, { Component, Suspense } from 'react'
import { connect } from 'react-redux'
// import { browserHistory } from 'react-router'
import { Row, Col, FormControl, Table, Button } from 'react-bootstrap'
import { Empty } from 'antd'
import LoadingData from 'components/LoadingData'
import SelectField from 'components/SelectField'
import Loading from 'components/Loading'
import { STRING, LABEL_BUTTON_SEARCH, LABEL_BUTTON_CLEAR_SEARCH, ROUTER, NUMBER, STATUS } from 'constants/Constant'
import DatePickerCustom from 'components/DatePickerCustom'
import ConfirmModal from 'components/ConfirmModal'
import TableLoading from 'components/TableLoading'
// import TableData from 'components/TableData'
import ButtonType from 'components/ButtonType'
// import LoadingAction from 'components/LoadingAction'
// import Error from 'components/Error'
import HeaderPage from 'components/HeaderPage'
import PaginationComponent from 'components/PaginationComponent'
import ScreenWrapper from 'components/ScreenWrapper'
// import 'styles/UserScreen.css'
// import { Link } from 'react-router-dom'
import { withRouter } from 'react-router-dom'
import { toDateString } from 'utils/helper'
import * as CustomerApi from 'network/CustomerApi'
import * as FilterApi from 'network/FilterApi'

import { notifyFail, notifySuccess } from 'utils/notify'
import { getUsers } from 'redux/reducers/CustomerSlice'
import Footer from 'components/Footer'
import './style.css'
import EmptyData from 'components/EmptyData'
// import reactotron from 'reactotron-react-js'
class CustomerListScreen extends Component {
  constructor(props) {
    super(props)
    this.state = {
      [STRING.fromDate]: '',
      [STRING.toDate]: '',
      valueSearch: '',
      status: '',
      checkAll: false,
      customerId: '',
      isError: false,
      listCustomer: [],
      isLoading: true,
      conFirmModal: false,
      activePage: 1,
      isExist: false,
      paging: '',
      province_id: '',
      listProvince: [],
      tableHeader: [
        {
          header: STRING.numericalOrder,
        },
        {
          header: STRING.fullName,
        },
        // {
        //   header: STRING.store,
        // },

        {
          header: STRING.phoneNumber,
        },
        {
          header: STRING.email,
        },
        {
          header: STRING.address,
        },
        {
          header: STRING.status,
        },
        // {
        //   header: STRING.createDate,
        // },
        {
          header: 'checkbox',
        },
      ],
    }
  }

  componentDidMount() {
    this.getListProvince()
    this.getData()
  }

  getListProvince = async () => {
    try {
      const listProvinceApi = await FilterApi.getListProvince()
      this.setState({
        listProvince: listProvinceApi.data.map((province) => ({
          value: province.id,
          label: province.name,
        })),
      })
    } catch (error) {
      console.log(error)
    }
  }

  getData = async () => {
    const { valueSearch, status, activePage, province_id } = this.state
    const payload = {
      search: valueSearch,
      is_active: parseInt(status) || '',
      // fromDate: fromDate ? new Date(fromDate) : '',
      // toDate: toDate ? new Date(toDate) : new Date(Date.now()),
      page: activePage,
      province_id: province_id.value,
    }
    try {
      const res = await CustomerApi.getListCustomer(payload)
      this.setState({
        ...this.state,
        listCustomer: res?.data.map((customer) => {
          customer.isSelected = false
          return customer
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

  getListSelected = () => {
    const { listCustomer } = this.state
    let payload = []
    listCustomer.forEach((item) => {
      if (item.isSelected) payload.push(item.id)
    })

    return payload
  }

  deleteCustomer = async () => {
    const { listCustomer } = this.state
    const payload = this.getListSelected()
    this.setState({
      isLoading: true,
    })

    try {
      await CustomerApi.deleteCustomer({ listID: payload })
      if (payload.length === listCustomer.length) {
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
        province_id: '',
        isLoading: true,
      },
      () => this.getData()
    )
  }

  handleCheckBox = (value, index) => {
    const { checkAll, listCustomer } = this.state
    let newListCustomer = [...listCustomer]
    let newCheckAll
    let count = 0

    if (!value?.isSelected && checkAll) {
      newCheckAll = !checkAll
    }

    newListCustomer[index].isSelected = !value?.isSelected

    if (newListCustomer.length) {
      listCustomer.forEach((customer) => {
        if (customer.isSelected) {
          count++
        }
      })
    }

    if (count === listCustomer.length) {
      newCheckAll = true
    }
    this.setState({ ...this.state, listCustomer: newListCustomer, checkAll: newCheckAll })
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
        activePage: 1,
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

  handleCheckAll = () => {
    const { checkAll, listCustomer } = this.state

    let newListCustomer = listCustomer.map((customer) => {
      customer.isSelected = !checkAll
      return customer
    })

    this.setState({
      ...this.state,
      listCustomer: newListCustomer,
      checkAll: !checkAll,
    })
  }

  renderHeader = () => {
    return <HeaderPage titleHeader={STRING.customer}></HeaderPage>
  }

  renderField = () => {
    const { valueSearch, status, province_id, listProvince } = this.state
    return (
      <div className="mx-0 box--shadow px-3 pt-3 pb-2">
        <Row>
          <Col sm="12" md="4" className="pl-0 responsive__inputField">
            <input
              onKeyPress={this.handleKeyPress}
              type="text"
              className="form-control"
              autoComplete="off"
              placeholder="Nhập tên, số điện thoại khách hàng"
              value={valueSearch}
              onChange={(e) => this.handleChange('valueSearch', e.target.value)}
            />
          </Col>
          <Col sm="12" md="4" className="pl-0 responsive__inputField mb-2">
            <SelectField
              options={listProvince}
              placeholder={STRING.province}
              selectedOption={province_id}
              valueName={'province_id'}
              onSelectChange={this.handleChangeSelect}
            />
          </Col>
          <Col sm="12" md="4" className="responsive__inputField pl-0">
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
        </Row>
        <Row className="text-right px-1">{this.renderButton()}</Row>
      </div>
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
      <Col className="button-wrapper pr-1">
        <ButtonType typeButton={LABEL_BUTTON_SEARCH} isOpen={this.getData} />
        <ButtonType typeButton={LABEL_BUTTON_CLEAR_SEARCH} isOpen={this.clearSearch} style={{ marginRight: 0 }} />
      </Col>
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

  renderBody = () => {
    return (
      <>
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
          action={this.deleteCustomer}
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
    const { checkAll } = this.state
    return (
      <React.Fragment>
        <Footer
          delete={() => {
            this.setState({ ...this.state, conFirmModal: true })
          }}
          checkAll={checkAll}
          handleCheckAll={this.handleCheckAll}
          showFooter={showFooter}
        ></Footer>
      </React.Fragment>
    )
  }

  renderTableData = () => {
    const { listCustomer } = this.state

    return (
      <tbody>
        {listCustomer?.length ? (
          listCustomer?.map((value, index) => {
            return (
              <tr key={index}>
                <td onClick={() => this.props.history.push(ROUTER.USER + '/' + value.id)}>
                  {index + NUMBER.page_limit * (this.state.activePage - 1) + 1}
                </td>
                <td className="cursor" onClick={() => this.props.history.push(ROUTER.USER + '/' + value.id)}>
                  {value?.full_name || '--'}
                </td>
                {/* <td className="cursor" onClick={() => this.props.history.push(ROUTER.USER + '/' + value.id)}>
                  {value?.store_name || '--'}
                </td> */}
                <td className="cursor" onClick={() => this.props.history.push(ROUTER.USER + '/' + value.id)}>
                  {value?.phone || '--'}
                </td>
                <td className="cursor" onClick={() => this.props.history.push(ROUTER.USER + '/' + value.id)}>
                  {value?.email || '--'}
                </td>
                <td className="cursor" onClick={() => this.props.history.push(ROUTER.USER + '/' + value.id)}>
                  {value?.address || '--'}
                </td>
                <td className="cursor" onClick={() => this.props.history.push(ROUTER.USER + '/' + value.id)}>
                  {value?.is_active === 1 ? STRING.active : STRING.isLocked || '--'}
                </td>
                {/* <td className="cursor" onClick={() => this.props.history.push(ROUTER.USER + '/' + value.id)}>
                  {toDateString(value?.created_at) || '--'}
                </td> */}
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
    const { isLoading, isError, listCustomer } = this.state
    let showFooter
    if (!isLoading) {
      showFooter = listCustomer.findIndex((item) => item.isSelected) >= 0
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

export default withRouter(CustomerListScreen)
