// import TableData from 'components/TableData'
import ButtonType from 'components/ButtonType'
import ConfirmModal from 'components/ConfirmModal'
import DatePickerCustom from 'components/DatePickerCustom'
import EmptyData from 'components/EmptyData'
import Footer from 'components/Footer'
// import LoadingAction from 'components/LoadingAction'
// import Error from 'components/Error'
import HeaderPage from 'components/HeaderPage'
import Loading from 'components/Loading'
import PaginationComponent from 'components/PaginationComponent'
import ScreenWrapper from 'components/ScreenWrapper'
import SelectField from 'components/SelectField'
// import 'styles/UserScreen.css'
// import { Link } from 'react-router-dom'
// import { changeStatusUser } from 'constants/Api'
import { LABEL_BUTTON_CLEAR_SEARCH, LABEL_BUTTON_SEARCH, NUMBER, STRING, ROUTER } from 'constants/Constant'
import * as ProviderTypeApi from 'network/ProviderTypeApi'
import * as StatisticApi from 'network/StatisticApi'
import * as OrderApi from 'network/OrderApi'
import React, { Component, Suspense } from 'react'
// import { browserHistory } from 'react-router'
import { Col, Row } from 'react-bootstrap'
import { withRouter } from 'react-router-dom'
import formatMoney from 'utils/formatMoney'
import formatNumber from 'utils/formatNumber'
import { getDateForSearch, validateForm } from 'utils/helper'
import { Table, Pagination } from 'antd'
import './style.css'
// import reactotron from 'reactotron-react-js'
class ProviderSalesListScreen extends Component {
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
      listProviderStatistic: [],
      isLoading: true,
      conFirmModal: false,
      activePage: 1,
      isExist: false,
      check: [],
      createSupplierType: false,
      editSupplierType: false,
      paging: {},
      listProviderType: [],
      providerTypeId: '',
      totalPrice: '',
      orderOverview: {},
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
          header: 'Tổng giá bán',
        },

        {
          header: 'Tổng giá đã chốt',
        },
        {
          header: 'Tổng giá đã cọc',
        },
        {
          header: 'Loại nhà cung cấp',
        },
      ],
      paging: {
        current: 1,
        total: 0,
        pageSize: 0,
      },
    }
  }

  componentDidMount() {
    this.getListProviderType()
    this.getData()
    this.getOrderOverview()
  }

  getData = async () => {
    const {
      valueSearch,
      [STRING.fromDate]: fromDate,
      [STRING.toDate]: toDate,
      status,
      activePage,
      paging,
      providerTypeId,
    } = this.state
    const payload = {
      search: valueSearch,
      provider_type_id: providerTypeId?.value || '',
      fromDate: fromDate ? getDateForSearch(fromDate) : '',
      toDate: toDate ? getDateForSearch(toDate) : '',
      page: paging?.current || 1,
    }

    try {
      const res = await StatisticApi.getListProviderStatistic(payload)
      this.setState({
        ...this.state,
        listProviderStatistic: res?.data.map((providerStatistic, index) => {
          const newProviderStatistic = {}
          newProviderStatistic.id = providerStatistic.id
          newProviderStatistic.key = index + NUMBER.page_limit * (res.paging.page - 1) + 1
          newProviderStatistic.full_name = providerStatistic.full_name
          newProviderStatistic.number_of_order =
            formatNumber(providerStatistic?.countOrder?.toString()) || STRING.notUpdate
          newProviderStatistic.total_price = formatMoney(providerStatistic?.totalPrice3) || STRING.notUpdate
          newProviderStatistic.total_decision_price = formatMoney(providerStatistic?.totalAmount3) || STRING.notUpdate
          newProviderStatistic.total_deposit = formatMoney(providerStatistic?.totalAmount4) || STRING.notUpdate
          newProviderStatistic.provider_type_name = providerStatistic.provider_type_name
          const moneyLeft = providerStatistic?.totalAmount3 - (providerStatistic?.totalAmount4 +providerStatistic?.totalAmount5)
          newProviderStatistic.moneyLeft = moneyLeft >=0 ? formatMoney(moneyLeft) : formatMoney(0)

          return newProviderStatistic
        }),
        totalPrice: formatMoney(res.totalPrice),
        paging: {
          total: res.paging?.count,
          current: res.paging?.page,
          pageSize: res.paging?.limit,
        },
        isLoading: false,
      })
    } catch (error) {
      this.setState({
        isLoading: false,
        isError: true,
      })
    }
  }

  getOrderOverview = async () => {
    try {
      const payload = {}
      const res = await OrderApi.orderOverview(payload)
      console.log(res)
      this.setState({
        orderOverview: res.data,
      })
    } catch (error) {
      console.log(error)
    }
  }

  getListProviderType = async () => {
    try {
      const listProviderType = await ProviderTypeApi.getListProviderType()
      let options = listProviderType.data.map((providerType) => ({
        value: providerType.id,
        label: providerType.name,
      }))
      this.setState({
        listProviderType: options,
      })
    } catch (error) {
      console.log(error)
    }
  }

  getListSelected = () => {
    const { listProviderStatistic } = this.state
    let payload = []
    listProviderStatistic.forEach((item) => {
      if (item.isSelected) payload.push(item.id)
    })

    return payload
  }

  search = () => {
    const { paging } = this.state
    this.setState(
      {
        isLoading: true,
        paging: {
          ...paging,
          current: 1,
        },
      },
      () => this.getData()
    )
  }

  clearSearch = () => {
    this.setState(
      {
        [STRING.fromDate]: '',
        [STRING.toDate]: '',
        valueSearch: '',
        providerTypeId: '',
        isLoading: true,
      },
      () => this.getData()
    )
  }

  handleCheckBox = (value, index) => {
    const { checkAll, listProviderStatistic } = this.state
    let newListProviderStatistic = [...listProviderStatistic]
    let newCheckAll
    let count = 0

    if (!value?.isSelected && checkAll) {
      newCheckAll = !checkAll
    }

    newListProviderStatistic[index].isSelected = !value?.isSelected

    if (newListProviderStatistic.length) {
      listProviderStatistic.forEach((providerStatistic) => {
        if (providerStatistic.isSelected) {
          count++
        }
      })
    }

    if (count === listProviderStatistic.length) {
      newCheckAll = true
    }
    this.setState({ ...this.state, listProviderStatistic: newListProviderStatistic, checkAll: newCheckAll })
  }

  handleChange = (fieldName, value) => {
    this.setState({
      ...this.state,
      [fieldName]: value || '',
    })
  }

  handleChangeSelect = (fieldName, value) => {
    const { paging } = this.state
    this.setState(
      {
        [fieldName]: value || '',
        isLoading: true,
        paging: {
          ...paging,
          current: 1,
        },
      },
      () => this.getData()
    )
  }

  handleChangePage = (page) => {
    const { paging } = this.state
    this.setState(
      {
        isLoading: true,
        paging: {
          ...paging,
          current: page,
        },
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
    const { checkAll, listProviderStatistic } = this.state

    let newListProviderStatistic = listProviderStatistic.map((providerStatistic) => {
      providerStatistic.isSelected = !checkAll
      return providerStatistic
    })

    this.setState({
      ...this.state,
      listProviderStatistic: newListProviderStatistic,
      checkAll: !checkAll,
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
    return <HeaderPage titleHeader={STRING.partnerSalesStatistics}></HeaderPage>
  }

  renderField = () => {
    const {
      valueSearch,
      status,
      [STRING.fromDate]: fromDate,
      [STRING.toDate]: toDate,
      listProviderType,
      providerTypeId,
    } = this.state
    return (
      <>
        <Row className="mx-0 box--shadow px-3 pt-3 pb-1">
          <Col sm="12" md="6" lg="3" className=" responsive__inputField">
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
          <Col sm="12" md="6" lg="3" className="responsive__inputField mb-2">
            <SelectField
              options={listProviderType}
              placeholder={STRING.supplierTypeFull}
              selectedOption={providerTypeId}
              valueName={'providerTypeId'}
              onSelectChange={this.handleChangeSelect}
            />
          </Col>
          <Col sm="12" md="6" lg="3" className="responsive__inputField">
            <DatePickerCustom
              className={`date-picker form-control`}
              dateFormat="dd/MM/yyyy"
              placeholderText={STRING.fromDate}
              handleChange={this.handleChange}
              selected={fromDate}
              maxDate={new Date(toDate)}
            />
          </Col>
          <Col sm="12" md="6" lg="3" className="responsive__inputField">
            <DatePickerCustom
              className={`date-picker form-control`}
              dateFormat="dd/MM/yyyy"
              placeholderText={STRING.toDate}
              handleChange={this.handleChange}
              selected={toDate}
              minDate={new Date(fromDate)}
            />
          </Col>
          <Col xs="12">{this.renderButton()}</Col>
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
    const { totalPrice } = this.state

    return (
      <>
        <div className="pt-3 pb-5 px-3 mt-4 table--shadow">
          <div className="mb-2 mx-1 text-right">
            {totalPrice && (
              <span style={{ fontSize: 18, color: '#28a745', fontWeight: 600 }}>Doanh số: {`${totalPrice || ''}`}</span>
            )}
          </div>
          {this.renderTable()}
          {this.renderPagination()}
        </div>
      </>
    )
  }

  renderBody = () => {
    const { orderOverview } = this.state
    return (
      <>
        {this.renderField()}
        <div className="col-12 py-3 row box--shadow mx-auto my-3">
          <h4 className="d-block text-primary pl-4 mb-1" style={{ width: '100%' }}>
            Tổng quan
          </h4>
          <div className=" col-12 col-md-6  px-3 py-2">
            <div className="col-12  row px-2 py-0">
              <div className="col-5">
                <p>Tổng tiền</p>
              </div>
              <div className="col-7">
                <p>
                  <strong>{formatMoney(orderOverview.total_price)}</strong>
                </p>
              </div>
              <div className="col-5">
                <p>Số tiền đã thanh toán</p>
              </div>
              <div className="col-7">
                <p>
                  <strong>{formatMoney(orderOverview.amount_finished)}</strong>
                </p>
              </div>

              <div className="col-5">
                <p>Số tiền chưa thanh toán</p>
              </div>
              <div className="col-7">
                <p>
                  <strong>{formatMoney(orderOverview.remain)}</strong>
                </p>
              </div>
            </div>
          </div>
          <div className=" col-12 col-md-6  px-3 py-2">
            <div className="col-12  row px-2 py-0">
              <div className="col-5">
                <p>Tổng số đơn hàng</p>
              </div>
              <div className="col-7">
                <p>
                  <strong>{formatNumber(orderOverview?.total_order?.toString())}</strong>
                </p>
              </div>

              <div className="col-5">
                <p>Tổng số đơn đã hoàn thành</p>
              </div>
              <div className="col-7">
                <p>
                  <strong>{formatNumber(orderOverview?.finished?.toString())}</strong>
                </p>
              </div>

              <div className="col-5">
                <p>Tổng số đơn chưa hoàn thành</p>
              </div>
              <div className="col-7">
                <strong>{formatNumber(orderOverview?.not_finish?.toString())}</strong>
              </div>

              <div className="col-5">
                <p>Tổng số đơn chưa xác nhận</p>
              </div>
              <div className="col-7">
                <strong>{formatNumber(orderOverview?.not_assigned?.toString())}</strong>
              </div>
            </div>
          </div>
        </div>
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
      </>
    )
  }

  renderTable = () => {
    const { tableHeader, checkAll, listProviderStatistic, paging, isLoading } = this.state
    const columns = [
      {
        title: STRING.numericalOrder,
        dataIndex: 'key',
      },
      {
        title: STRING.fullName,
        dataIndex: 'full_name',
      },
      {
        title: 'Số đơn hàng',
        dataIndex: 'number_of_order',
      },

      {
        title: 'Tổng giá mua',
        dataIndex: 'total_price',
      },
      {
        title: 'Tổng giá đã cọc',
        dataIndex: 'total_deposit',
      },
      // {
      //   title: 'Tổng giá đã chốt',
      //   dataIndex: 'total_decision_price',
      // },
      {
          title: 'Tổng tiền còn',
          dataIndex: 'moneyLeft',
        },
      {
        title: 'Loại nhà cung cấp',
        dataIndex: 'provider_type_name',
      },
    ]

    return (
      <>
        <div
          style={{
            boxShadow: 'rgba(0, 0, 0, 0.05) 0px 0px 0px 1px',
          }}
        >
          <Table
            onRow={(record, rowIndex) => {
              return {
                onClick: (event) => {
                  this.props.history.push(ROUTER.PROVIDER_SALE_LIST + `/${record.id}`)
                }, // click row
              }
            }}
            bordered
            dataSource={listProviderStatistic || []}
            columns={columns}
            isLoading={isLoading}
            scroll={{ y: 450, x: 992 }}
            pagination={false}
            style={{ cursor: 'pointer' }}
          />
        </div>
        <div className="py-3">
          {paging.total > NUMBER.page_limit && (
            <Pagination
              defaultCurrent={paging.current || 1}
              total={paging.total}
              defaultPageSize={paging.pageSize}
              responsive={true}
              onChange={(page) => {
                this.setState(
                  {
                    isLoading: true,
                    paging: {
                      ...paging,
                      current: page,
                    },
                  },
                  () => this.getData()
                )
              }}
            />
          )}
        </div>
      </>
    )
    // return (
    //   <>
    //     <Table striped responsive bordered>
    //       <thead>
    //         <tr>
    //           {tableHeader?.map((item, index) =>
    //             item.header === 'checkbox' ? (
    //               <th key={index}>
    //                 <input type="checkbox" className="mt-3 cursor" checked={checkAll} onChange={this.handleCheckAll} />
    //               </th>
    //             ) : (
    //               <th key={index}>{item.header}</th>
    //             )
    //           )}
    //         </tr>
    //       </thead>
    //       <Suspense fallback={<Loading />}>{this.renderTableData()}</Suspense>
    //     </Table>
    //   </>
    // )
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
    const { listProviderStatistic } = this.state

    return (
      <tbody>
        {listProviderStatistic?.length ? (
          listProviderStatistic?.map((value, index) => {
            return (
              <tr
                key={index}
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  this.props.history.push(ROUTER.PROVIDER_SALE_LIST + `/${value.id}`)
                }}
              >
                <td>{index + NUMBER.page_limit * (this.state.activePage - 1) + 1}</td>
                <td>{value?.full_name || '--'}</td>
                <td>{formatNumber(value?.countOrder?.toString()) || STRING.notUpdate}</td>
                <td>{formatMoney(value?.totalPrice3) || STRING.notUpdate}</td>
                <td>{formatMoney(value?.totalAmount3) || STRING.notUpdate}</td>
                <td>{formatMoney(value?.totalAmount4) || STRING.notUpdate}</td>
                <td>{value?.provider_type_name || '--'}</td>
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
    const { isLoading, isError, listProviderStatistic } = this.state
    let showFooter
    if (!isLoading) {
      showFooter = listProviderStatistic.findIndex((item) => item.isSelected) >= 0
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

export default withRouter(ProviderSalesListScreen)
