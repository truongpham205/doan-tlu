import React from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

import {
  Header,
  Footer,
  HomePage,
  ReviewPage,
  TourDetailPage,
  TourPage,
  UserPage,
  ForgotPasswordScreen,
  LoginScreen,
  RegisterScreen,
  CreateNewPasswordScreen,
  ResultSearchPage,
} from '@screens/index'
import { ROUTER } from '@constants/Constant'
import BookingRoomDetail from '../screens/Main/UserPage/UserPageComponent/BookingRoomDetail'

const AppNavigator = () => {
  return (
    <>
      <Router>
        <Header />
        <Switch>
          <Route path="/" exact component={HomePage} />
          <Route path={ROUTER.HOME_PAGE} exact component={HomePage} />
          <Route path={ROUTER.LOGIN} exact component={LoginScreen} />
          <Route path={ROUTER.FORGOT_PASSWORD} exact component={ForgotPasswordScreen} />
          <Route path={ROUTER.CREATE_NEW_PASSWORD} exact component={CreateNewPasswordScreen} />
          <Route path={ROUTER.REGISTER} exact component={RegisterScreen} />
          <Route path={ROUTER.REVIEW_PAGE} exact Component={ReviewPage} />
          <Route path={ROUTER.TOUR_PAGE + '/:id'} exact component={TourPage} />
          <Route path={ROUTER.SERVICE_DETAIL + '/:id'} exact component={TourPage} />
          <Route path={ROUTER.TOUR_DETAIL_PAGE + '/:id'} exact component={TourDetailPage} />
          <Route path={ROUTER.NEW_DETAIL + '/:id'} exact component={TourDetailPage} />
          <Route path={ROUTER.USER_INFO} exact component={UserPage} />
          <Route path={ROUTER.BOOKING_LIST} exact component={UserPage} />
          <Route path={ROUTER.FAVOURITE_LIST} exact component={UserPage} />
          <Route path={ROUTER.BOOKING_DETAIL + '/:id'} exact component={BookingRoomDetail} />
          <Route path={ROUTER.RESULT_SEARCH} exact component={ResultSearchPage} />
        </Switch>
        <Footer />
      </Router>
    </>
  )
}

export default AppNavigator
