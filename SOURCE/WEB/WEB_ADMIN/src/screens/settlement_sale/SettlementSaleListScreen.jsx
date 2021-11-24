import { Space, Spin } from 'antd'
import ButtonType from 'components/ButtonType'
import ConfirmModal from 'components/ConfirmModal'
import DatePickerCustom from 'components/DatePickerCustom'
import EmptyData from 'components/EmptyData'
import Footer from 'components/Footer'
import HeaderPage from 'components/HeaderPage'
import Loading from 'components/Loading'
import PaginationComponent from 'components/PaginationComponent'
import ScreenWrapper from 'components/ScreenWrapper'
import {
  LABEL_BUTTON_CLEAR_SEARCH,
  LABEL_BUTTON_SEARCH,
  NUMBER,
  ROUTER,
  STRING,
  SETTLEMENT_SALE_STATUS,
} from 'constants/Constant'
import * as SaleApi from 'network/SaleApi'
import * as StatisticApi from 'network/StatisticApi'
import React, { Component, Suspense } from 'react'
import { Button, Col, FormControl, Modal, Row, Table } from 'react-bootstrap'
import { withRouter } from 'react-router-dom'
import formatMoney from 'utils/formatMoney'
import formatNumber from 'utils/formatNumber'
import { getDateForSearch, toDateString, validateForm } from 'utils/helper'
import { notifyFail, notifySuccess } from 'utils/notify'
import './style.css'
class SettlementSaleListScreen extends Component {
  constructor(props) {
    super(props)
    this.state = {
      [STRING.fromDate]: '',
      [STRING.toDate]: '',
      valueSearch: '',
      status: '',
      checkAll: false,
      userId: '',
      isError: false,
      listSaleStatistic: [],
      listSettlementSale: [],
      isLoading: true,
      conFirmModal: false,
      activePage: 1,
      isExist: false,
      check: [],
      createSupplierType: false,
      editSupplierType: false,
      isLoadingData: false,
      showModal: false,
      paging: {},
      totalPrice: '',
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
          header: STRING.fullName,
        },
        {
          header: 'Số đơn hàng',
        },

        {
          header: 'Tổng thu được',
        },
        {
          header: 'Hoa hồng',
        },
        {
          header: 'Thời gian',
        },
        {
          header: 'Quyết toán',
        },
        {
          header: 'Ngày quyết toán',
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
      is_payment: status ? parseInt(status) : '',
      fromDate: fromDate ? getDateForSearch(fromDate) : '',
      toDate: toDate ? getDateForSearch(toDate) : '',
      page: activePage,
    }

    try {
      const res = await SaleApi.getListSalary(payload)
      this.setState({
        ...this.state,
        listSaleStatistic: res?.data?.salaries?.map((saleStatistic) => {
          saleStatistic.isSelected = false
          return saleStatistic
        }),
        payment: res?.data?.payment ? formatMoney(res?.data?.payment) : formatMoney(0, true),
        unPay: res?.data?.unpay ? formatMoney(res?.data?.unpay) : formatMoney(0, true),
        paging: res?.paging,
        isLoading: false,
      })
    } catch (error) {
      this.setState({
        isLoading: false,
        isError: true,
      })
    }
  }

  getDetail = (id) => {
    this.props.history.push(ROUTER.SETTLEMENT_SALE_DETAIL + '/' + id)
  }

  getListSettlementSale = async () => {
    const { [STRING.toDate]: toDate } = this.state
    if (!toDate) {
      notifyFail('Vui lòng chọn thời gian quyết toán!')
      return
    }
    const payload = {
      toDate: toDate ? getDateForSearch(toDate) : '',
    }
    this.setState({
      isLoadingData: true,
    })
    try {
      const res = await StatisticApi.getListSaleStatistic(payload)
      this.setState({
        listSettlementSale: res?.data,
        isLoadingData: false,
      })
    } catch (error) {
      this.setState({
        isLoading: false,
      })
    }
  }

  confirmSettlementSale = async () => {
    const { [STRING.toDate]: toDate, listSettlementSale } = this.state
    const payload = {
      toDate: toDate ? getDateForSearch(toDate) : '',
      listID: listSettlementSale?.map((settlementSale) => settlementSale?.id),
    }
    try {
      this.setState({
        isLoading: true,
      })
      const res = await SaleApi.createSalary(payload)
      this.setState(
        {
          listSettlementSale: res?.data,
          showModal: false,
          isLoading: false,
          [STRING.toDate]: '',
        },
        () => this.getData()
      )
      notifySuccess('Quyết toán thành công!')
    } catch (error) {
      this.setState({
        isLoading: false,
      })
      notifyFail('Quyết toán thất bại!')
    }
  }

  getListSelected = () => {
    const { listSaleStatistic } = this.state
    let payload = []
    listSaleStatistic.forEach((item) => {
      if (item.isSelected) payload.push(item.id)
    })

    return payload
  }

  deleteSaleStatistic = async () => {
    const { listSaleStatistic } = this.state
    const payload = this.getListSelected()
    this.setState({
      isLoading: true,
    })

    try {
      await SaleApi.deleteSalary({ listID: payload })
      if (payload.length === listSaleStatistic.length) {
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
        isLoading: true,
        [STRING.fromDate]: '',
        [STRING.toDate]: '',
        valueSearch: '',
        status: '',
      },
      () => this.getData()
    )
  }

  handleCheckBox = (value, index) => {
    const { checkAll, listSaleStatistic } = this.state
    let newListSaleStatistic = [...listSaleStatistic]
    let newCheckAll
    let count = 0

    if (!value?.isSelected && checkAll) {
      newCheckAll = !checkAll
    }

    newListSaleStatistic[index].isSelected = !value?.isSelected

    if (newListSaleStatistic.length) {
      listSaleStatistic.forEach((saleStatistic) => {
        if (saleStatistic.isSelected) {
          count++
        }
      })
    }

    if (count === listSaleStatistic.length) {
      newCheckAll = true
    }
    this.setState({ listSaleStatistic: newListSaleStatistic, checkAll: newCheckAll })
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
    const { checkAll, listSaleStatistic } = this.state

    let newListSaleStatistic = listSaleStatistic.map((saleStatistic) => {
      saleStatistic.isSelected = !checkAll
      return saleStatistic
    })

    this.setState({
      listSaleStatistic: newListSaleStatistic,
      checkAll: !checkAll,
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

  handleBlur = (nameKey, titleName) => {
    validateForm(this, this.state.modal[nameKey], nameKey, titleName)
  }

  checkValidateValue = () => {
    const { nameType, status } = this.state.modal
    if (this.state.createSupplierType) {
      if (nameType && status) {
        return false
      }
      return true
    }
  }

  renderHeader = () => {
    return (
      <HeaderPage titleHeader={STRING.saleSalesStatistics}>
        <Button variant="primary" onClick={() => this.setState({ showModal: true })}>
          Quyết toán
        </Button>
      </HeaderPage>
    )
  }

  renderField = () => {
    const { valueSearch, status, [STRING.fromDate]: fromDate, [STRING.toDate]: toDate } = this.state
    return (
      <>
        <Row className="mx-0 box--shadow px-3 pt-3 pb-1">
          <Col sm="3" className="pl-0 responsive__inputField">
            <input
              onKeyPress={this.handleKeyPress}
              type="text"
              className="form-control"
              autoComplete="off"
              placeholder={'Tên hoặc số điện thoại khách hàng'}
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

              <option value="1">{'Đã quyết toán'}</option>
              <option value="0">{'Chưa quyết toán'}</option>
            </FormControl>
          </Col>
          <Col sm className="responsive__inputField">
            <DatePickerCustom
              className={`date-picker form-control`}
              dateFormat="dd/MM/yyyy"
              placeholderText={STRING.fromDate}
              handleChange={this.handleChange}
              selected={fromDate}
              maxDate={new Date(toDate)}
            />
          </Col>
          <Col sm className="pr-0 responsive__inputField">
            <DatePickerCustom
              className={`date-picker form-control`}
              dateFormat="dd/MM/yyyy"
              placeholderText={STRING.toDate}
              handleChange={this.handleChange}
              selected={toDate}
              minDate={new Date(fromDate)}
            />
          </Col>
          <Col xs="12" className="pr-1">
            {this.renderButton()}
          </Col>
        </Row>
      </>
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
          <ButtonType typeButton={LABEL_BUTTON_CLEAR_SEARCH} isOpen={this.clearSearch} style={{ marginRight: 0 }} />
        </Col>
      </Row>
    )
  }

  renderData = () => {
    const { payment, unPay } = this.state

    return (
      <>
        <div className="pt-3 pb-5 px-3 mt-4 table--shadow">
          <div className="mb-2 mx-1 text-left">
            <span className="settlementSale" style={{ fontSize: 18, color: '#28a745', fontWeight: 600 }}>
              Đã quyết toán: {`${payment}`}
            </span>
            <span style={{ fontSize: 18, color: '#dc3545', fontWeight: 600 }} className="notSettlementSale">
              Chưa quyết toán: {`${unPay}`}
            </span>
          </div>
          {this.renderTable()}
          {this.renderPagination()}
        </div>
      </>
    )
  }

  renderBody = () => {
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
          title="xóa"
          action={this.deleteSaleStatistic}
        />
        {this.renderData()}
        {this.renderModal()}
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

  renderTableModal = () => {
    const { tableHeader } = this.state
    let newTableHeader = [...tableHeader]
    newTableHeader.pop()
    newTableHeader.pop()
    newTableHeader.pop()
    return (
      <>
        <Table striped responsive bordered>
          <thead>
            <tr>
              {newTableHeader?.map((item, index) => (
                <th key={index}>{item.header}</th>
              ))}
            </tr>
          </thead>
          <Suspense fallback={<Loading />}>{this.renderDataTableModal()}</Suspense>
        </Table>
      </>
    )
  }
  renderDataTableModal = () => {
    const { listSettlementSale, isLoadingData } = this.state
    if (isLoadingData) {
      return (
        <tbody>
          <tr>
            <td colspan={6}>
              <Space size="middle">
                <Spin size="large" />
              </Space>
            </td>
          </tr>
        </tbody>
      )
    }

    return (
      <tbody>
        {listSettlementSale?.length ? (
          listSettlementSale?.map((value, index) => {
            return (
              <tr key={index}>
                <td>{index + NUMBER.page_limit * (this.state.activePage - 1) + 1}</td>
                <td>{value?.full_name || '--'}</td>
                <td>{formatNumber(value?.countOrder?.toString()) || '--'}</td>
                <td>{formatMoney(value?.totalPrice || 0)}</td>
                <td>{formatMoney(value?.totalProfit || 0)}</td>
                <td>
                  {value?.minDate ? toDateString(value?.minDate) : STRING.notUpdate}
                  {` - `}
                  {value?.maxDate ? toDateString(value?.maxDate) : STRING.notUpdate}
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

  renderFooter = (showFooter) => {
    const { checkAll } = this.state
    return (
      <React.Fragment>
        <Footer
          delete={() => {
            this.setState({ conFirmModal: true })
          }}
          checkAll={checkAll}
          handleCheckAll={this.handleCheckAll}
          showFooter={showFooter}
        ></Footer>
      </React.Fragment>
    )
  }

  renderTableData = () => {
    const { listSaleStatistic } = this.state
    return (
      <tbody>
        {listSaleStatistic?.length ? (
          listSaleStatistic?.map((value, index) => {
            return (
              <tr key={index}>
                <td className="cursor">{index + NUMBER.page_limit * (this.state.activePage - 1) + 1}</td>
                <td className="cursor" onClick={() => this.getDetail(value?.id)}>
                  {value?.sale_name || '--'}
                </td>
                <td className="cursor" onClick={() => this.getDetail(value?.id)}>
                  {formatNumber(value?.total_order?.toString()) || '--'}
                </td>
                <td className="cursor" onClick={() => this.getDetail(value?.id)}>
                  {formatMoney(value?.total_price || 0) || '--'}
                </td>
                <td className="cursor" onClick={() => this.getDetail(value?.id)}>
                  {formatMoney(value?.total_profit || 0) || '--'}
                </td>
                <td className="cursor" onClick={() => this.getDetail(value?.id)}>
                  {value?.start_at ? toDateString(value?.start_at) : STRING.notUpdate}
                  {` - `}
                  {value?.end_at ? toDateString(value?.end_at) : STRING.notUpdate}
                </td>
                <td className="cursor" onClick={() => this.getDetail(value?.id)}>
                  {value?.is_payment === SETTLEMENT_SALE_STATUS.SETTLEMENT ? 'Đã quyết toán' : 'Chưa quyết toán'}
                </td>
                <td className="cursor" onClick={() => this.getDetail(value?.id)}>
                  {value?.payment_at ? toDateString(value?.payment_at) : STRING.notUpdate}
                </td>
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

  handleClose = () => {
    this.setState({
      showModal: false,
      [STRING.toDate]: '',
    })
  }

  renderModal = () => {
    const { showModal, [STRING.toDate]: toDate } = this.state
    return (
      <Modal size={'xl'} dialogClassName="modal-100w" show={showModal} onHide={this.handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ color: 'white' }}>{STRING.settlementSale}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md="4">Quyết toán đến ngày</Col>
            <Col md="6">
              <DatePickerCustom
                className={`date-picker form-control`}
                dateFormat="dd/MM/yyyy"
                placeholderText={STRING.toDate}
                handleChange={this.handleChange}
                selected={toDate}
                // maxDate={new Date(toDate)}
              />
            </Col>
            <Col md="2">
              <Button variant="success" onClick={this.getListSettlementSale}>
                Lọc
              </Button>
            </Col>
          </Row>
          <Row>{this.renderTableModal()}</Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={this.handleClose}>
            Hủy
          </Button>
          <Button variant="primary" onClick={this.confirmSettlementSale}>
            Xác nhận
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }

  render() {
    const { isLoading, isError, listSaleStatistic } = this.state
    let showFooter
    if (!isLoading) {
      showFooter = listSaleStatistic.findIndex((item) => item.isSelected) >= 0
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

export default withRouter(SettlementSaleListScreen)
