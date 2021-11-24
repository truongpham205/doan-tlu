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
import { LABEL_BUTTON_CLEAR_SEARCH, LABEL_BUTTON_SEARCH, NUMBER, ROUTER, STATUS, STRING } from 'constants/Constant'
import * as FilterApi from 'network/FilterApi'
import * as RoomApi from 'network/RoomApi'
import * as RoomTypeApi from 'network/RoomTypeApi'
import React, { Component, Suspense } from 'react'
// import { browserHistory } from 'react-router'
import { Col, FormControl, Row, Table } from 'react-bootstrap'
import { withRouter } from 'react-router-dom'
import { notifyFail, notifySuccess } from 'utils/notify'
import './style.css'
// import reactotron from 'reactotron-react-js'
class RoomListScreen extends Component {
  constructor(props) {
    super(props)
    this.state = {
      [STRING.fromDate]: '',
      [STRING.toDate]: '',
      valueSearch: '',
      status: '',
      checkAll: false,
      roomId: '',
      isError: false,
      listRoom: [],
      isLoading: true,
      conFirmModal: false,
      activePage: 1,
      isExist: false,
      hasEdit: false,
      check: [],
      paging: '',
      listRoomType: [],
      listProvince: [],
      listDistrict: [],
      listVillage: [],
      roomTypeId: '',
      provinceId: '',
      districtId: '',
      villageId: '',
      tableHeader: [
        {
          header: STRING.numericalOrder,
        },
        {
          header: STRING.houseCode,
        },
        {
          header: STRING.roomName,
        },

        {
          header: STRING.roomOwner,
        },
        {
          header: STRING.roomType,
        },
        {
          header: STRING.numberPeople,
        },
        {
          header: STRING.zone,
        },
        {
          header: STRING.serviceCharge,
        },
        {
          header: STRING.evaluate,
        },
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
    this.getListRoomType()
    this.getData()
  }

  getData = async () => {
    const {
      valueSearch,
      [STRING.fromDate]: fromDate,
      districtId,
      roomTypeId,
      provinceId,
      villageId,
      [STRING.toDate]: toDate,
      status,
      activePage,
    } = this.state
    const payload = {
      search: valueSearch,
      is_active: parseInt(status) || '',
      service_category_id: roomTypeId?.value,
      province_id: provinceId?.value,
      village_id: villageId?.value,
      district_id: districtId?.value,
      page: activePage,
    }
    this.setState({
      ...this.state,
      isLoading: true,
    })
    try {
      const res = await RoomApi.getListRoom(payload)
      this.setState({
        ...this.state,
        listRoom: res?.data.map((room) => {
          room.isSelected = false
          return room
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

  getListRoomType = async () => {
    try {
      const listRoomTypeApi = await RoomTypeApi.getListRoomType()
      let options = listRoomTypeApi.data.map((roomType) => ({
        value: roomType.id,
        label: roomType.name,
      }))
      this.setState({
        listRoomType: options,
      })
    } catch (error) {
      console.log(error)
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

  getListDistrict = async (province_id = '') => {
    try {
      const listDistrict = await FilterApi.getListDistrict({ province_id })
      let options = listDistrict.data.map((district) => ({
        value: district.id,
        label: district.name,
      }))
      this.setState({
        ...this.state,
        listDistrict: options,
      })
    } catch (error) {
      console.log(error)
    }
  }

  getListVillage = async (district_id = '') => {
    try {
      const listVillage = await FilterApi.getListVillage({ district_id })
      let options = listVillage.data.map((village) => ({
        value: village.id,
        label: village.name,
      }))
      this.setState({
        ...this.state,
        listVillage: options,
      })
    } catch (error) {
      console.log(error)
    }
  }

  handleEdit = () => {
    const { listRoom } = this.state
    let room = listRoom.find((room) => room.isSelected)
    this.props.history.push(ROUTER.EDIT_ROOM + `/${room?.id}`)
  }

  getListSelected = () => {
    const { listRoom } = this.state
    let payload = []
    listRoom.forEach((item) => {
      if (item.isSelected) payload.push(item?.id)
    })

    return payload
  }

  deleteRoom = async () => {
    const { listRoom } = this.state
    const payload = this.getListSelected()
    this.setState({
      isLoading: true,
    })

    try {
      await RoomApi.deleteRoom({ listID: payload })
      if (payload.length === listRoom.length) {
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
        roomTypeId: '',
        provinceId: '',
        districtId: '',
        villageId: '',
        isLoading: true,
      },
      () => this.getData()
    )
  }

  handleCheckBox = (value, index) => {
    const { checkAll, listRoom } = this.state
    let newListRoom = [...listRoom]
    let newCheckAll = false
    let newHasEdit = false
    if (!value?.isSelected && checkAll) {
      newCheckAll = !checkAll
    }

    newListRoom[index].isSelected = !value?.isSelected

    let count = this.countNumberOfElementIsChecked(newListRoom)

    if (count === 1) {
      newHasEdit = true
    }

    if (count === listRoom.length) {
      newCheckAll = true
    }

    this.setState({ listRoom: newListRoom, checkAll: newCheckAll, hasEdit: newHasEdit })
  }

  handleChange = (fieldName, value) => {
    this.setState({
      [fieldName]: value || '',
    })
  }

  handleChangeSelect = (fieldName, value) => {
    if (fieldName === 'provinceId') {
      this.setState(
        {
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

    if (fieldName === 'districtId') {
      this.setState(
        {
          [fieldName]: value || '',
          isLoading: true,
          activePage: 1,
        },
        () => {
          this.getListVillage(value?.id)
          this.getData()
        }
      )
      return
    }

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
    const { checkAll, listRoom } = this.state
    let newHasEdit = false

    let newListRoom = listRoom.map((room) => {
      room.isSelected = !checkAll
      return room
    })

    if (this.countNumberOfElementIsChecked(newListRoom) === 1) {
      newHasEdit = true
    }

    this.setState({
      ...this.state,
      listRoom: newListRoom,
      checkAll: !checkAll,
      hasEdit: newHasEdit,
    })
  }

  countNumberOfElementIsChecked = (arrCheck) => {
    return arrCheck.filter((item) => item.isSelected === true).length
  }

  renderHeader = () => {
    return (
      <HeaderPage
        titleHeader={STRING.room}
        titleButton={STRING.addRoom}
        onClickButton={() => this.props.history.push(ROUTER.ADD_ROOM)}
      ></HeaderPage>
    )
  }

  renderField = () => {
    const {
      listProvince,
      provinceId,
      listDistrict,
      districtId,
      listVillage,
      villageId,
      valueSearch,
      status,
      roomTypeId,
      listRoomType,
    } = this.state
    return (
      <Row className="mx-0 box--shadow p-3">
        <Col sm="12" md="6" lg="4" className="pl-0 responsive__inputField">
          <input
            onKeyPress={this.handleKeyPress}
            type="text"
            className="form-control"
            autoComplete="off"
            placeholder={STRING.roomName}
            value={valueSearch}
            onChange={(e) => this.handleChange('valueSearch', e.target.value)}
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
            <option value={STATUS.stopWorking}>{STRING.stopWorking}</option>
          </FormControl>
        </Col>
        <Col sm="12" md="6" lg="4" className="responsive__inputField mb-2 pl-0">
          <SelectField
            options={listRoomType}
            placeholder={STRING.roomType}
            selectedOption={roomTypeId}
            valueName={'roomTypeId'}
            onSelectChange={this.handleChangeSelect}
          />
        </Col>
        <Col sm="12" md="6" lg="4" className="pl-0 mb-2 responsive__inputField">
          <SelectField
            options={listProvince}
            placeholder={STRING.province}
            selectedOption={provinceId}
            valueName={'provinceId'}
            onSelectChange={this.handleChangeSelect}
          />
        </Col>
        <Col sm="12" md="6" lg="4" className="pl-0 mb-2 responsive__inputField">
          <SelectField
            options={listDistrict}
            placeholder={STRING.district}
            selectedOption={districtId}
            valueName={'districtId'}
            onSelectChange={this.handleChangeSelect}
          />
        </Col>
        <Col sm="12" md="6" lg="4" className="pl-0 mb-2 responsive__inputField">
          <SelectField
            options={listVillage}
            placeholder={STRING.ward}
            selectedOption={villageId}
            valueName={'villageId'}
            onSelectChange={this.handleChangeSelect}
          />
        </Col>
        <Row className="text-right col-12 mt-2 pr-0">{this.renderButton()}</Row>
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
      <Col className="button-wrapper pr-0">
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
          action={this.deleteRoom}
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
    const { listRoom } = this.state

    return (
      <tbody>
        {listRoom?.length ? (
          listRoom?.map((value, index) => {
            return (
              <tr key={index}>
                <td onClick={() => this.props.history.push(ROUTER.USER + '/' + value.id)}>
                  {index + NUMBER.page_limit * (this.state.activePage - 1) + 1}
                </td>
                <td>{value?.code || '--'}</td>
                <td>{value?.name || '--'}</td>
                <td>
                  {value?.provider?.full_name || '--'}
                  <br />({value?.provider?.phone})
                </td>
                <td>{value?.service_category_name || '--'}</td>
                <td>{value?.people || '--'}</td>

                <td>{value?.region?.name || '--'}</td>
                <td>{STRING.notUpdate || '--'}</td>
                <td>{!isNaN(value?.rating) ? `${Math.round(value?.rating)} sao` : STRING.notUpdate} </td>
                <td>{value?.is_active === STATUS.approve ? STRING.active : STRING.stopWorking || '--'}</td>
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
    const { isLoading, isError, listRoom } = this.state
    let showFooter
    if (!isLoading) {
      showFooter = listRoom?.findIndex((item) => item.isSelected) >= 0
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

export default withRouter(RoomListScreen)
