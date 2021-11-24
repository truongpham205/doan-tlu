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
import {
  LABEL_BUTTON_CLEAR_SEARCH,
  LABEL_BUTTON_SEARCH,
  NUMBER,
  ROUTER,
  STRING,
  USER_HISTORY_LIST,
  USER_HISTORY_TYPE,
} from 'constants/Constant'
import * as CustomerApi from 'network/CustomerApi'
import React, { Component, Suspense } from 'react'
// import { browserHistory } from 'react-router'
import { Col, FormControl, Row, Table } from 'react-bootstrap'
import { withRouter } from 'react-router-dom'
import formatNumber from 'utils/formatNumber'
import { toDateString } from 'utils/helper'
import './AccumulationHistory.css'
// import reactotron from 'reactotron-react-js'
class AccumulationHistoryListScreen extends Component {
  constructor(props) {
    super(props)
    this.state = {
      valueSearch: '',
      status: '',
      checkAll: false,
      isError: false,
      accumulationHistoryList: [],
      isLoading: true,
      conFirmModal: false,
      activePage: 1,
      isExist: false,
      paging: '',
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
          header: STRING.phoneNumber,
        },

        {
          header: STRING.accumulationType,
        },
        {
          header: STRING.score,
        },
        {
          header: STRING.accumulationDate,
        },
      ],
    }
  }

  componentDidMount() {
    this.getData()
  }

  getData = async () => {
    const { valueSearch, status, activePage } = this.state
    const payload = {
      search: valueSearch,
      status: status ? parseInt(status) : '',
      page: activePage,
    }

    try {
      const res = await CustomerApi.getPointHistory(payload)
      this.setState({
        accumulationHistoryList: res?.data.map((accumulation) => {
          accumulation.isSelected = false
          return accumulation
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

  getListSelected = () => {
    const { accumulationHistoryList } = this.state
    let payload = []
    accumulationHistoryList.forEach((item) => {
      if (item.isSelected) payload.push(item.id)
    })

    return payload
  }

  deleteAccumulationHistory = async () => {
    const { accumulationHistoryList } = this.state
    const payload = this.getListSelected()
    this.setState({
      isLoading: true,
    })

    // try {
    //   await changeStatusUser({ id: payload })
    //   if (payload.length === listUser.length) {
    //     this.setState(
    //       {
    //         ...this.state,
    //         activePage: 1,
    //         loadingAction: false,
    //         conFirmModal: false,
    //       },
    //       () => this.getData(),
    //       notifySuccess(STRING.deleteSuccess)
    //     )
    //   } else {
    //     this.setState(
    //       {
    //         ...this.state,
    //         loadingAction: false,
    //         conFirmModal: false,
    //       },
    //       () => this.getData(),
    //       notifySuccess(STRING.deleteSuccess)
    //     )
    //   }
    // } catch (error) {
    //   this.setState({
    //     ...this.state,
    //     loadingAction: false,
    //     conFirmModal: false,
    //     isError: true,
    //   })
    //   notifyFail(STRING.deleteFail)
    // }
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
    const { checkAll, accumulationHistoryList } = this.state
    let newAccumulationList = [...accumulationHistoryList]
    let newCheckAll
    let count = 0

    if (!value?.isSelected && checkAll) {
      newCheckAll = !checkAll
    }

    newAccumulationList[index].isSelected = !value?.isSelected

    if (newAccumulationList.length) {
      newAccumulationList.forEach((accumulation) => {
        if (accumulation.isSelected) {
          count++
        }
      })
    }

    if (count === accumulationHistoryList.length) {
      newCheckAll = true
    }
    this.setState({ ...this.state, accumulationHistoryList: newAccumulationList, checkAll: newCheckAll })
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
        activePage: page,
        isLoading: 1,
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
    const { checkAll, accumulationHistoryList } = this.state

    let newAccumulationList = accumulationHistoryList.map((accumulation) => {
      accumulation.isSelected = !checkAll
      return accumulation
    })

    this.setState({
      accumulationHistoryList: newAccumulationList,
      checkAll: !checkAll,
    })
  }

  renderHeader = () => {
    return <HeaderPage titleHeader={STRING.accumulationHistory}></HeaderPage>
  }

  renderField = () => {
    const { valueSearch, status, supplierTypeOption, provinceOption } = this.state
    return (
      <Row className="mx-0 box--shadow p-3">
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
              {STRING.accumulationType}
            </option>

            {USER_HISTORY_LIST?.map((accumulation, index) => (
              <option value={accumulation.id} key={index}>
                {accumulation.name}
              </option>
            ))}
          </FormControl>
        </Col>
        <Col sm="6" className="responsive__inputField text-right">
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
      <>
        <ButtonType typeButton={LABEL_BUTTON_SEARCH} isOpen={this.search} />
        <ButtonType typeButton={LABEL_BUTTON_CLEAR_SEARCH} isOpen={this.clearSearch} style={{ marginRight: 0 }} />
      </>
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
              conFirmModal: false,
            })
          }
          title="xóa"
          action={this.deleteAccumulationHistory}
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
    const { accumulationHistoryList } = this.state
    const getAccumulationType = (type) => {
      switch (type) {
        case USER_HISTORY_TYPE.PROFIT:
          return 'Cộng điểm (hoàn thành đơn)'
        case USER_HISTORY_TYPE.USE_POINT:
          return 'Dùng điểm'
        case USER_HISTORY_TYPE.ROLL_BACK:
          return 'Trả lại điểm'
        case USER_HISTORY_TYPE.PAYMENT:
          return 'Trừ điểm (quyết toán)'
        case USER_HISTORY_TYPE.INVITE:
          return 'Cộng điểm (giới thiệu app)'
        default:
          return '--'
      }
    }
    return (
      <tbody>
        {accumulationHistoryList?.length ? (
          accumulationHistoryList?.map((value, index) => {
            return (
              <tr
                key={index}
                onClick={() => this.props.history.push(`${ROUTER.USER}/${value?.user_id}`)}
                className="cursor"
              >
                <td>{index + NUMBER.page_limit * (this.state.activePage - 1) + 1}</td>
                <td>{value?.user?.full_name || '--'}</td>
                <td>{value?.user?.phone || '--'}</td>
                <td>{getAccumulationType(value?.type || 0) || '--'}</td>
                <td>{formatNumber(value?.point?.toString() || '0') || '--'}</td>
                <td>{toDateString(value?.created_at) || '--'}</td>
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
    const { isLoading, isError, accumulationHistoryList } = this.state
    let showFooter
    if (!isLoading) {
      showFooter = accumulationHistoryList.findIndex((item) => item.isSelected) >= 0
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

export default withRouter(AccumulationHistoryListScreen)
