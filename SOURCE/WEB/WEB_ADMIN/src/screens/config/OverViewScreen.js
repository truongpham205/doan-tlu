import ScreenWrapper from 'components/ScreenWrapper'
import { ROUTER, STRING } from 'constants/Constant'
import { getOverView } from 'network/ConfigApi'
import React, { useEffect, useState } from 'react'
import { Col, Row } from 'react-bootstrap'
import { connect } from 'react-redux'
import { useHistory, withRouter } from 'react-router-dom'
import { getListOverView } from 'redux/actions'
import formatMoney from 'utils/formatMoney'
import formatNumber from 'utils/formatNumber'
import HeaderPage from 'components/HeaderPage'
function OverViewScreen(props) {
  // const [overViewData, setOverViewData] = useState([])
  const [isLoadingFirst, setIsLoadingDataFirst] = useState(true)
  let history = useHistory()

  useEffect(() => {
    if (!Object.keys(props.overViewState.data).length || props.history.action !== 'POP') {
      props.getListOverView()
    }
    // getOverViewData()
  }, [])

  useEffect(() => {
    if (isLoadingFirst && Object.keys(props.overViewState?.data).length) {
      setIsLoadingDataFirst(false)
    }
  }, [])

  const { isLoading, error, data } = props.overViewState
  let overViewData = []
  if (!isLoading) {
    overViewData = [
      {
        backgroundColor: 'bg-danger',
        icon: 'fas fa-money-bill-alt',
        label: STRING.sales,
        value: formatMoney(data?.data?.total_price || 0),
        router: '',
        state: {},
      },
      {
        backgroundColor: 'bg-orange',
        icon: 'fas fa-archive',
        label: STRING.totalOrders,
        value: formatNumber(data?.data?.total_order?.toString() || '0'),
        router: '',
        state: {
          status: '0',
        },
      },
      {
        backgroundColor: 'bg-purple',
        icon: 'fas fa-address-card',
        label: STRING.totalCustomer,
        value: formatNumber(data?.data?.total_customer?.toString() || '0'),
        router: '',
        state: {},
      },
      {
        backgroundColor: 'bg-info',
        icon: 'fas fa-archive',
        label: STRING.notAssigned,
        value: formatNumber(data?.data?.not_assigned?.toString() || '0'),
        router: '',
        state: {
          status: '0',
        },
      },
      {
        backgroundColor: 'bg-warning',
        icon: 'fas fa-archive',
        label: STRING.notFinish,
        value: formatNumber(data?.data?.not_finish?.toString() || '0'),
        router: '',
        state: {},
      },
      {
        backgroundColor: 'bg-success',
        icon: 'fas fa-archive',
        label: STRING.finished,
        value: formatNumber(data?.data?.finished?.toString() || '0'),
        router: '',
        state: {},
      },
      // {
      //   backgroundColor: 'bg-orange',
      //   icon: 'fas fa-address-card',
      //   label: STRING.assignProjectOwner,
      //   value: data?.data?.count_project_owner || '0',
      //   router: ROUTER.PROFILE,
      //   state: {
      //     statusOwner: '0',
      //     typeOwner: '3',
      //   },
      // },
      // {
      //   backgroundColor: 'bg-teal',
      //   icon: 'fas fa-clipboard-check',
      //   label: STRING.needConfirmProject,
      //   value: data?.data?.count_project_transport || '0',
      //   router: ROUTER.PROJECT,
      //   state: {
      //     status: '0',
      //   },
      // },
      // {
      //   backgroundColor: 'bg-indigo',
      //   icon: 'fas fa-shipping-fast',
      //   label: STRING.needConfirmedOldVehicle,
      //   value: data?.data?.count_old_vehicle || '0',
      //   router: ROUTER.OLD_CAR_POSTING,
      //   state: {
      //     status: '0',
      //   },
      // },
      // {
      //   backgroundColor: 'bg-pink',
      //   icon: 'fas fa-address-card',
      //   label: STRING.assignTeamOwner,
      //   value: data?.data?.count_team_owner || '0',
      //   router: ROUTER.PROFILE,
      //   state: {
      //     statusOwner: '0',
      //     typeOwner: '4',
      //   },
      // },

      // {
      //   id: 11,
      //   backgroundColor: 'bg-cyan',
      //   icon: 'fas fa-money-check-alt',
      //   label: STRING.needConfirmedLoanRequest,
      //   value: data?.data?.loan_request || '0',
      //   router: ROUTER.REQUEST_LOAN_PACK,
      //   state: {
      //     status: '0',
      //   },
      // },
    ]
  }

  const renderHeader = () => {
    return <HeaderPage titleHeader={STRING.overView}></HeaderPage>
  }

  return (
    <ScreenWrapper
      titleHeader={STRING.overView}
      isError={error}
      renderHeader={renderHeader}
      isLoading={isLoading && isLoadingFirst}
    >
      <section className="content mr-2 ml-2">
        <div className="container-fluid">
          {/* row-cols-sm-3 row-cols-md-2 row-cols-lg-2 row-cols-xl-3 row-cols-xxl-4 */}
          {/* <div className="row"> */}
          {/* sm="2" md="2" lg="3" xl="4" */}
          <Row>
            {overViewData.map((item, index) => {
              return (
                // sm="6" md="6" lg="4" xl="3"
                <Col key={index} sm="6" md="6" lg="6" xl="4">
                  {/* <div className="col-12 col-sm-6 col-md-6 col-lg-6 col-xl-4 col-xxl-3" key={index}> */}
                  <div
                    className="info-box mb-3 mr-3"
                    style={{ cursor: 'pointer', minWidth: '270px', height: '80px' }}
                    onClick={() =>
                      history.push({
                        pathname: item.router,
                        state: item.state,
                      })
                    }
                  >
                    <span
                      className={`info-box-icon ${item.backgroundColor} elevation-1`}
                      style={{ minWidth: '70px', height: '64px' }}
                    >
                      <i className={item.icon} />
                    </span>
                    <div className="info-box-content">
                      <span className="info-box-text">{item.label}</span>
                      <span className="info-box-number d-inline">
                        {item.value}{' '}
                        {/* <span>
                          {item.label === STRING.assignService ||
                          item.label === STRING.needConfirmProject ||
                          item.label === STRING.needConfirmedLoanRequest ||
                          item.label === STRING.needConfirmedOldVehicle
                            ? `(${STRING.pending})`
                            : item.label === STRING.totalOrders
                            ? `(${STRING.waitForConfirmation})`
                            : item.label === STRING.assignVehicleOwner ||
                              item.label === STRING.assignProjectOwner ||
                              item.label === STRING.assignGoodsOwner ||
                              item.label === STRING.assignTeamOwner
                            ? `(${STRING.pendingProfile})`
                            : ''}
                        </span> */}
                      </span>
                    </div>
                  </div>
                  {/* </div> */}
                </Col>
              )
            })}
          </Row>
          {/* </div> */}
        </div>
      </section>
    </ScreenWrapper>
  )
}

const mapStateToProps = (state) => ({
  overViewState: state.overViewReducer,
})

const mapDispatchToProps = {
  getListOverView,
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(OverViewScreen))
