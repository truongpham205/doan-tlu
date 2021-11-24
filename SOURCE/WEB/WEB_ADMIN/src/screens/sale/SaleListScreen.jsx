// import TableData from 'components/TableData'
import ButtonType from 'components/ButtonType'
import ConfirmModal from 'components/ConfirmModal'
import EmptyData from 'components/EmptyData'
import Footer from 'components/Footer'
// import LoadingAction from 'components/LoadingAction'
// import Error from 'components/Error'
import HeaderPage from 'components/HeaderPage'
import Loading from 'components/Loading'
import PaginationComponent from 'components/PaginationComponent'
import ScreenWrapper from 'components/ScreenWrapper'
import TableLoading from 'components/TableLoading'
import { LABEL_BUTTON_CLEAR_SEARCH, LABEL_BUTTON_SEARCH, NUMBER, ROLE, ROUTER, STRING } from 'constants/Constant'
import * as SaleApi from 'network/SaleApi'
import React, { Component, Suspense } from 'react'
// import { browserHistory } from 'react-router'
import { Col, Row, Table } from 'react-bootstrap'
import { withRouter } from 'react-router-dom'
import formatMoney from 'utils/formatMoney'
import { toDateString } from 'utils/helper'
import { notifyFail, notifySuccess } from 'utils/notify'
import './style.css'
// import reactotron from 'reactotron-react-js'
class SaleListScreen extends Component {
  constructor(props) {
    super(props)
    this.state = {
      [STRING.fromDate]: '',
      [STRING.toDate]: '',
      search: '',
      status: '',
      checkAll: false,
      saleId: '',
      isError: false,
      listSale: [],
      isLoading: true,
      conFirmModal: false,
      hasEdit: false,
      activePage: 1,
      isExist: false,
      check: [],
      paging: '',
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
          header: STRING.sales,
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
    const { search, [STRING.fromDate]: fromDate, [STRING.toDate]: toDate, status, activePage } = this.state
    const payload = {
      search,
      page: activePage,
    }

    try {
      const res = await SaleApi.getListSale(payload)
      this.setState({
        ...this.state,
        listSale: res?.data.map((sale) => {
          sale.isSelected = false
          return sale
        }),
        isLoading: false,
        paging: res?.paging,
      })
    } catch (error) {
      this.setState({
        isLoading: false,
        isError: true,
      })
    }
  }

  handleEdit = () => {
    const { listSale } = this.state
    let sale = listSale.find((sale) => sale.isSelected)
    this.props.history.push(ROUTER.EDIT_SALE + `/${sale.id}`)
  }

  getListSelected = () => {
    const { listSale } = this.state
    let payload = []
    listSale.forEach((item) => {
      if (item.isSelected) payload.push(item.id)
    })

    return payload
  }

  deleteSale = async () => {
    const { listSale } = this.state
    const payload = this.getListSelected()

    this.setState({
      isLoading: true,
    })
    try {
      await SaleApi.deleteSale({ listID: payload })
      if (payload.length === listSale.length) {
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
        isLoading: true,
        search: '',
      },
      () => this.getData()
    )
  }

  handleCheckBox = (value, index) => {
    const { checkAll, listSale } = this.state
    let newListSale = [...listSale]
    let newCheckAll = false
    let newHasEdit = false

    if (!value?.isSelected && checkAll) {
      newCheckAll = !checkAll
    }

    newListSale[index].isSelected = !value?.isSelected

    if (this.countNumberOfElementIsChecked(newListSale) === 1) {
      newHasEdit = true
    }

    if (this.countNumberOfElementIsChecked(newListSale) === listSale.length) {
      newCheckAll = true
    }
    this.setState({ listSale: newListSale, checkAll: newCheckAll, hasEdit: newHasEdit })
  }

  handleCheckAll = () => {
    const { checkAll, listSale } = this.state
    let newHasEdit = false
    let newListSale = listSale.map((sale) => {
      sale.isSelected = !checkAll
      return sale
    })

    if (this.countNumberOfElementIsChecked(newListSale) === 1) {
      newHasEdit = true
    }

    this.setState({
      listSale: newListSale,
      checkAll: !checkAll,
      hasEdit: newHasEdit,
    })
  }

  handleChange = (fieldName, value) => {
    this.setState({
      [fieldName]: value || '',
    })
  }

  handleChangePage = (page) => {
    this.setState(
      {
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

  countNumberOfElementIsChecked = (arrCheck) => {
    return arrCheck.filter((item) => item.isSelected === true).length
  }

  renderHeader = () => {
    return (
      <HeaderPage
        titleHeader={STRING.sale}
        titleButton={STRING.addSale}
        onClickButton={() => this.props.history.push(ROUTER.ADD_SALE)}
      ></HeaderPage>
    )
  }

  renderField = () => {
    const { search } = this.state
    return (
      <Row className="mx-0 box--shadow p-3 d-flex justify-content-between">
        <Col sm="12" md="6" className="pl-0 responsive__inputField">
          <input
            onKeyPress={this.handleKeyPress}
            type="text"
            className="form-control"
            autoComplete="off"
            placeholder="Tên hoặc số điện thoại sale"
            value={search}
            onChange={(e) => this.handleChange('search', e.target.value)}
          />
        </Col>
        {/* <Col sm="3" className="responsive__inputField pl-0">
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
            <option value={STATUS.reject}>{STRING.isLocked}</option>
          </FormControl>
        </Col> */}
        <Col sm="12" md="6" className="pl-0 responsive__inputField">
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
          action={this.deleteSale}
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
    const { listSale } = this.state
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    let isAdmin = userInfo?.role_id === ROLE.ADMIN
    const navigateSaleDetail = (id) => {
      if (isAdmin) {
        this.props.history.push(ROUTER.SALE + `/${id}`)
      }
    }
    return (
      <tbody>
        {listSale?.length ? (
          listSale?.map((value, index) => {
            return (
              <tr key={index}>
                <td>{index + NUMBER.page_limit * (this.state.activePage - 1) + 1}</td>
                <td className={isAdmin ? 'cursor' : ''} onClick={() => navigateSaleDetail(value.id)}>
                  {value?.full_name || '--'}
                </td>
                <td className={isAdmin ? 'cursor' : ''} onClick={() => navigateSaleDetail(value.id)}>
                  {value?.phone || '--'}
                </td>
                <td className={isAdmin ? 'cursor' : ''} onClick={() => navigateSaleDetail(value.id)}>
                  {value?.email || '--'}
                </td>
                <td className={isAdmin ? 'cursor' : ''} onClick={() => navigateSaleDetail(value.id)}>
                  {formatMoney(value?.revenue.toString())}
                </td>
                <td className={isAdmin ? 'cursor' : ''} onClick={() => navigateSaleDetail(value.id)}>
                  {toDateString(value?.created_at) || '--'}
                </td>
                <td>
                  <input
                    type="checkbox"
                    className={isAdmin ? 'cursor' : ''}
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
    const { isLoading, isError, listSale } = this.state
    let showFooter
    if (!isLoading) {
      showFooter = listSale.findIndex((item) => item.isSelected) >= 0
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

export default withRouter(SaleListScreen)
