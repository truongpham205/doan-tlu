import React, { Component, useEffect } from 'react'
import './ReviewPage.css'
import BannerAds from './ReviewPageComponent/BannerAds'
import BannerHome from './ReviewPageComponent/BannerHome'
import ReviewBanner from './ReviewPageComponent/ReviewBanner'
import ReviewComment from './ReviewPageComponent/ReviewComment'
import ReviwContent from './ReviewPageComponent/ReviewContent'
import ReviewSimilar from './ReviewPageComponent/ReviewSimilar'
import SharingContent from './ReviewPageComponent/SharingContent'
import Cookie from 'js-cookie'
import Chat from '../../../Chat'

const ReviewPage = () => {
  const isLogin = Cookie.get('SESSION_ID')
  // componentDidMount() {
  //   window.scrollTo(0, 0)
  // }
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
  return (
    <>
      <div className="container-fluid">
        <ReviewBanner />
        <div className="container-header">
          <div className="row">
            <div className="col-sm-8">
              <ReviwContent />
              <SharingContent />
              <ReviewComment />
            </div>
            <div className="col-sm-4 px-3">
              <BannerAds />
              <BannerHome />
            </div>
          </div>
        </div>
        <ReviewSimilar />
      </div>
      {isLogin && <Chat />}
    </>
  )
}

export default ReviewPage
