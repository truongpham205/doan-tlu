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
import SelectField from 'components/SelectField'
import TableLoading from 'components/TableLoading'
import { LABEL_BUTTON_CLEAR_SEARCH, LABEL_BUTTON_SEARCH, NUMBER, ROUTER, STRING, STATUS } from 'constants/Constant'
import * as FilterApi from 'network/FilterApi'
import * as ProviderApi from 'network/ProviderApi'
import * as ProviderTypeApi from 'network/ProviderTypeApi'
import React, { Component, Suspense } from 'react'
// import { browserHistory } from 'react-router'
import { Col, Row, Table, FormControl } from 'react-bootstrap'
import { withRouter } from 'react-router-dom'
import { notifyFail, notifySuccess } from 'utils/notify'
// import './style.css'
// import reactotron from 'reactotron-react-js'

class AccountProviderListScreen extends Component {
  constructor(props) {
    super(props)
    this.state = {
      [STRING.fromDate]: '',
      [STRING.toDate]: '',
      search: '',
      status: '',
      checkAll: false,
      providerId: '',
      isError: false,
      listProvider: [],
      listProvince: [],
      listDistrict: [],
      listProviderType: [],
      isLoading: true,
      conFirmModal: false,
      activePage: 1,
      isExist: false,
      check: [],
      paging: '',
      province_id: '',
      district_id: '',
      provider_type_id: '',
      tableHeader: [
        {
          header: STRING.numericalOrder,
        },
        {
          header: STRING.supplierName,
        },
        {
          header: STRING.phoneNumber,
        },

        {
          header: STRING.email,
        },
        // {
        //   header: 'Tên Loại nhà cung cấp',
        // },
        {
          header: STRING.status,
        },
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

  getData = async () => {
    const { search, status, activePage } = this.state
    const payload = {
      search,
      is_active: status,
      page: activePage,
    }

    try {
      const res = await ProviderApi.getListManager(payload)
      this.setState({
        listProvider: res?.data.map((provider) => {
          provider.isSelected = false
          return provider
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

  getListProvince = async () => {
    try {
      const listProvince = await FilterApi.getListProvince()
      let options = listProvince.data.map((province) => ({
        value: province.id,
        label: province.name,
        code: province.code,
      }))
      this.setState({
        ...this.state,
        listProvince: options,
      })
    } catch (error) {
      console.log(error)
    }
  }

  getListDistrict = async (province_id) => {
    try {
      const listDistrict = await FilterApi.getListDistrict({ province_id })
      let options = listDistrict.data.map((district) => ({
        value: district.id,
        label: district.name,
        code: district.code,
      }))
      this.setState({
        ...this.state,
        listDistrict: options,
      })
    } catch (error) {
      console.log(error)
    }
  }

  getListSelected = () => {
    const { listProvider } = this.state
    let payload = []
    listProvider.forEach((item) => {
      if (item.isSelected) payload.push(item.id)
    })

    return payload
  }

  deleteProvider = async () => {
    const { listProvider } = this.state
    const payload = this.getListSelected()
    this.setState({
      isLoading: true,
    })
    try {
      await ProviderApi.deleteManager({ listID: payload })
      if (payload.length === listProvider.length) {
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

  handleEdit = () => {
    const { listProvider } = this.state
    const providerIsChecked = listProvider.findIndex((provider) => provider.isSelected)
    this.props.history.push(ROUTER.EDIT_SUPPLIER + `/${listProvider[providerIsChecked]?.id}`)
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
        search: '',
        status: '',
        province_id: '',
        district_id: '',
        provider_type_id: '',
        isLoading: true,
      },
      () => this.getData()
    )
  }

  handleCheckBox = (value, index) => {
    const { checkAll, listProvider } = this.state

    let newListProvider = [...listProvider]
    let newCheckAll = false
    let newHasEdit = false

    if (!value?.isSelected && checkAll) {
      newCheckAll = !checkAll
    }

    newListProvider[index].isSelected = !value?.isSelected

    if (this.countNumberOfElementIsChecked(newListProvider) === 1) {
      newHasEdit = true
    }

    if (this.countNumberOfElementIsChecked(newListProvider) === listProvider.length) {
      newCheckAll = true
    }
    this.setState({ ...this.state, listProvider: newListProvider, checkAll: newCheckAll, hasEdit: newHasEdit })
  }

  handleCheckAll = () => {
    const { checkAll, listProvider } = this.state
    let newHasEdit = false
    let newListProvider = listProvider.map((provider) => {
      provider.isSelected = !checkAll
      return provider
    })

    if (this.countNumberOfElementIsChecked(newListProvider) === 1) {
      newHasEdit = true
    }

    this.setState({
      ...this.state,
      listProvider: newListProvider,
      checkAll: !checkAll,
      hasEdit: newHasEdit,
    })
  }

  countNumberOfElementIsChecked = (arrCheck) => {
    return arrCheck.filter((item) => item.isSelected === true).length
  }

  handleChange = (fieldName, value) => {
    this.setState({
      ...this.state,
      [fieldName]: value || '',
    })
  }

  handleChangeSelect = (fieldName, value) => {
    if (fieldName === 'province_id') {
      this.setState(
        {
          ...this.state,
          [fieldName]: value || '',
          isLoading: true,
          activePage: 1,
        },
        () => {
          this.getListDistrict(value?.code)
          this.getData()
        }
      )
      return
    }

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

  renderHeader = () => {
    return (
      <HeaderPage
        titleHeader={STRING.supplier}
        titleButton={STRING.addSupplier}
        onClickButton={() => this.props.history.push(ROUTER.ADD_SUPPLIER)}
      ></HeaderPage>
    )
  }

  renderField = () => {
    const { listProvince, listDistrict, search, status, listProviderType, provider_type_id, province_id, district_id } =
      this.state
    return (
      <Row className="mx-0 box--shadow p-3">
        <Col sm="12" md="6" lg="4" className="pl-0 responsive__inputField">
          <input
            onKeyPress={this.handleKeyPress}
            type="text"
            className="form-control"
            autoComplete="off"
            placeholder="Nhập tên, số điện thoại"
            value={search}
            onChange={(e) => this.handleChange('search', e.target.value)}
          />
        </Col>
        <Col sm="12" md="6" lg="4" className="responsive__inputField pl-0">
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
            <option value={STATUS.reject}>Ngừng hoạt động</option>
          </FormControl>
        </Col>
        {this.renderButton()}
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
      <Col className="button-wrapper pr-1">
        <ButtonType typeButton={LABEL_BUTTON_SEARCH} isOpen={this.search} />
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
          action={this.deleteProvider}
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
    const { listProvider } = this.state

    return (
      <tbody>
        {listProvider?.length ? (
          listProvider?.map((value, index) => {
            return (
              <tr key={index}>
                <td>{index + NUMBER.page_limit * (this.state.activePage - 1) + 1}</td>
                <td>{value?.provider_name || '--'}</td>
                <td>{value?.phone || '--'}</td>
                <td>{value?.email || '--'}</td>
                {/* <td>{value?.provider_type_name || '--'}</td> */}
                <td>{(value?.is_active && STRING.active) || '--'}</td>
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
    const { isLoading, isError, listProvider } = this.state
    let showFooter
    if (!isLoading) {
      showFooter = listProvider.findIndex((item) => item.isSelected) >= 0
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

export default withRouter(AccountProviderListScreen)
