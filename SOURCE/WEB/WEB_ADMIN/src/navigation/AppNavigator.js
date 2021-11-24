import Header from 'components/Header'
import SideBar from 'components/SideBar'
import { ROUTER, ROLE } from 'constants/Constant'
import React, { Component } from 'react'
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom'
// import Chat from 'screens/chat_support/component/Chat'
// import { browserHistory } from 'react-router'
import {
  AccountScreen,
  AddUpdateNewsScreen,
  // AddUpdateRoleScreen,
  // AssignRoleScreen,
  ChatSupportSreen,
  ConfigScreen,
  AddUpdateSupplierScreen,
  CustomerListScreen,
  LoginScreen,
  NewsListScreen,
  OrderDetailByBookTourScreen,
  OrderBookRoomListScreen,
  OverViewScreen,
  OrderBookTourListScreen,
  SupplierTypeScreen,
  SupplierListScreen,
  RoomListScreen,
  AddUpdateDetailRoomScreen,
  RoomTypeListScreen,
  AccumulationHistoryListScreen,
  SaleListScreen,
  AddUpdateSaleScreen,
  AddUpdateOrderBookRoomScreen,
  // SupplierDetailScreen,
  CustomerDetailScreen,
  SaleDetailScreen,
  // SaleSalesListScreen,
  ProviderSalesListScreen,
  // ChatFirebase,
  OrderDetailByBookRoomScreen,
  AddUpdateOrderBookTourScreen,
  TourListScreen,
  AddUpdateDetailTourScreen,
  SettlementSaleListScreen,
  SettlementSaleDetailScreen,
  ChatSystemSupportScreen,
  BankConfigScreen,
  OrderProviderListScreen,
  OrderProviderDetailScreen,
  ProviderSaleDetailScreen,
  AccountProviderListScreen,
  AddUpdateAccountOfProviderScreen,
  SettlementProviderListScreen,
  SettlementProviderDetailScreen,
} from 'screens/index'
import PrivateRoute from './PrivateRoute'

export class AppNavigator extends Component {
  render() {
    return (
      <Router>
        <Switch>
          <Route path={ROUTER.LOGIN} exact component={LoginScreen} />
          <PrivateRoute path="/" Component={MainNavigator} />
        </Switch>
      </Router>
    )
  }
}

class MainNavigator extends Component {
  render() {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    if (userInfo?.role_id === ROLE.PROVIDER) {
      return (
        <>
          <Header />
          <SideBar />
          <Switch>
            <PrivateRoute path={ROUTER.ORDER_PROVIDER} exact Component={OrderProviderListScreen} />
            <PrivateRoute path={ROUTER.ORDER_PROVIDER + '/:id'} exact Component={OrderProviderDetailScreen} />
            <PrivateRoute path={ROUTER.ACCOUNT_PROVIDER} exact Component={AccountProviderListScreen} />
            <PrivateRoute path={ROUTER.ADD_SUPPLIER} exact Component={AddUpdateAccountOfProviderScreen} />
            <PrivateRoute path={ROUTER.EDIT_SUPPLIER + '/:id'} exact Component={AddUpdateAccountOfProviderScreen} />
            <Route render={() => <Redirect to={ROUTER.ORDER_PROVIDER} />} />
          </Switch>
        </>
      )
    }
    return (
      <>
        {/* <Chat /> */}
        <Header />
        <SideBar />
        <Switch>
          {/* customer */}
          <PrivateRoute path={ROUTER.USER} exact Component={CustomerListScreen} />
          <PrivateRoute path={ROUTER.USER + '/:id'} exact Component={CustomerDetailScreen} />
          {/* provider */}
          <PrivateRoute path={ROUTER.ADD_SUPPLIER} exact Component={AddUpdateSupplierScreen} />
          <PrivateRoute path={ROUTER.EDIT_SUPPLIER + '/:id'} exact Component={AddUpdateSupplierScreen} />
          <PrivateRoute path={ROUTER.SUPPLIER} exact Component={SupplierListScreen} />
          {/* <PrivateRoute path={ROUTER.SUPPLIER + '/:id'} exact Component={SupplierDetailScreen} /> */}

          <PrivateRoute path={ROUTER.SUPPLIER_TYPE} exact Component={SupplierTypeScreen} />
          <PrivateRoute path={ROUTER.ROOM_TYPE} exact Component={RoomTypeListScreen} />
          <PrivateRoute path={ROUTER.ACCUMULATION_HISTORY} exact Component={AccumulationHistoryListScreen} />

          {/* sale */}
          <PrivateRoute path={ROUTER.SALE} exact Component={SaleListScreen} />

          <PrivateRoute path={ROUTER.ADD_SALE} exact Component={AddUpdateSaleScreen} />
          <PrivateRoute path={ROUTER.EDIT_SALE + '/:id'} exact Component={AddUpdateSaleScreen} />
          {/* statistical */}
          {/* <PrivateRoute path={ROUTER.SALE_SALES_STATISTICS} exact Component={SaleSalesListScreen} /> */}
          <PrivateRoute path={ROUTER.PROVIDER_LIST} exact Component={ProviderSalesListScreen} />
          <PrivateRoute path={ROUTER.PROVIDER_SALE_LIST + '/:id'} exact Component={ProviderSaleDetailScreen} />

          <PrivateRoute path={ROUTER.ADD_ORDER_BOOK_ROOM} exact Component={AddUpdateOrderBookRoomScreen} />
          <PrivateRoute path={ROUTER.ADD_ORDER_BOOK_TOUR} exact Component={AddUpdateOrderBookTourScreen} />

          {/* Store */}
          <PrivateRoute path={ROUTER.ORDER_BOOK_ROOM} exact Component={OrderBookRoomListScreen} />
          <PrivateRoute path={ROUTER.ORDER_DETAIL_BOOK_TOUR + '/:id'} exact Component={OrderDetailByBookTourScreen} />
          <PrivateRoute path={ROUTER.ORDER_DETAIL_BOOK_ROOM + '/:id'} exact Component={OrderDetailByBookRoomScreen} />
          <PrivateRoute path={ROUTER.ORDER_BOOK_TOUR} exact Component={OrderBookTourListScreen} />
          {/* room */}
          <PrivateRoute path={ROUTER.ROOM} exact Component={RoomListScreen} />
          <PrivateRoute path={ROUTER.EDIT_ROOM + '/:id'} exact Component={AddUpdateDetailRoomScreen} />
          <PrivateRoute path={ROUTER.ADD_ROOM} exact Component={AddUpdateDetailRoomScreen} />
          <PrivateRoute path={ROUTER.ROOM_DETAIL + '/:id'} exact Component={AddUpdateDetailRoomScreen} />
          {/* news */}
          <PrivateRoute path={ROUTER.NEWS} exact Component={NewsListScreen} />
          <PrivateRoute path={ROUTER.ADD_NEWS} exact Component={AddUpdateNewsScreen} />
          <PrivateRoute path={ROUTER.UPDATE_NEWS + '/:id'} exact Component={AddUpdateNewsScreen} />
          {/* tour */}
          <PrivateRoute path={ROUTER.TOUR} exact Component={TourListScreen} />
          <PrivateRoute path={ROUTER.ADD_TOUR} exact Component={AddUpdateDetailTourScreen} />
          <PrivateRoute path={ROUTER.EDIT_TOUR + '/:id'} exact Component={AddUpdateDetailTourScreen} />
          {/* other */}

          <PrivateRoute path={ROUTER.OVERVIEW} exact Component={OverViewScreen} />
          <PrivateRoute path={ROUTER.CHAT_SUPPORT} exact Component={ChatSupportSreen} />
          <PrivateRoute path={ROUTER.CHAT_SYSTEM} exact Component={ChatSystemSupportScreen} />
          {/* check role */}
          {userInfo?.role_id === ROLE.ADMIN && (
            <>
              <PrivateRoute path={ROUTER.SETTLEMENT_SALE} exact Component={SettlementSaleListScreen} />
              <PrivateRoute path={ROUTER.SETTLEMENT_PROVIDER} exact Component={SettlementProviderListScreen} />
              <PrivateRoute
                path={ROUTER.SETTLEMENT_SALE_DETAIL + '/:id'}
                exact
                Component={SettlementSaleDetailScreen}
              />
              <PrivateRoute
                path={ROUTER.SETTLEMENT_PROVIDER_DETAIL + '/:id'}
                exact
                Component={SettlementProviderDetailScreen}
              />
              <PrivateRoute path={ROUTER.CONFIG} exact Component={ConfigScreen} />
              <PrivateRoute path={ROUTER.BANK_CONFIG} exact Component={BankConfigScreen} />
              <PrivateRoute path={ROUTER.ACCOUNT} exact Component={AccountScreen} />
              <PrivateRoute path={ROUTER.SALE + '/:id'} exact Component={SaleDetailScreen} />
            </>
          )}
          <Route render={() => <Redirect to={ROUTER.OVERVIEW} />} />
        </Switch>
      </>
    )
  }
}

export default AppNavigator
